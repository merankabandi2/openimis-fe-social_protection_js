import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import {
  decodeId,
  formatMessage,
  formatMessageWithValues,
  useModulesManager,
} from '@openimis/fe-core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Button,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import {
  fetchProjectBeneficiaries,
  fetchProjectGroupBeneficiaries,
} from '../actions';
import {
  MODULE_NAME,
  RIGHT_PROJECT_UPDATE,
} from '../constants';
import BeneficiaryTable from './BeneficiaryTable';
import {
  ProjectBeneficiariyEnrollmentDialog,
  ProjectGroupBeneficiaryEnrollmentDialog,
} from '../dialogs/ProjectEnrollmentDialog';

const convertFieldName = (field) => (
  // Handle nested objects (e.g., 'individual.firstName' -> 'individual__first_name')
  field.replace(/\./g, '__').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
);

function BaseProjectBeneficiaryTable({
  project,
  isGroup,
  EnrollmentDialogComponent,
  rights,
  intl,
  fetchProjectBeneficiaries,
  fetchingBeneficiaries,
  beneficiaries,
}) {
  const orderBy = isGroup ? 'orderBy: ["group__code"]' : 'orderBy: ["individual__last_name", "individual__first_name"]';
  const payloadField = isGroup ? 'groupBeneficiary' : 'beneficiary';
  const modulesManager = useModulesManager();
  const [useRemote, setUseRemote] = useState(true);
  const [localRows, setLocalRows] = useState([]);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [initialTotalCount, setInitialTotalCount] = useState(0);
  const tableTitle = formatMessageWithValues(
    intl,
    MODULE_NAME,
    'projectBeneficiaries.enrolled',
    { n: initialTotalCount },
  );

  // Trigger fetch
  useEffect(() => {
    if (project?.benefitPlan?.id) {
      const params = [
        `project_Id: "${project.id}"`,
        'isDeleted: false',
        orderBy,
        'first: 100', // TODO: switch to remote data
      ];
      fetchProjectBeneficiaries(modulesManager, params)
        .then((response) => {
          setInitialTotalCount(response?.payload.data[payloadField].totalCount);
        });
    }
  }, [project?.benefitPlan?.id]);

  useEffect(() => {
    const decoratedBeneficiaries = (beneficiaries || []).map((b) => (
      {
        ...b,
        jsonExt: typeof b.jsonExt === 'string' ? JSON.parse(b.jsonExt) : b.jsonExt,
      }
    ));
    const manyOrNoBeneficiaries = decoratedBeneficiaries.length < 1 || decoratedBeneficiaries.length > 100;
    setUseRemote(manyOrNoBeneficiaries);
    setLocalRows(manyOrNoBeneficiaries ? null : decoratedBeneficiaries);
  }, [beneficiaries]);

  const assignButtonComponentFn = () => (
    <Button
      startIcon={<AddIcon />}
      variant="contained"
      color="primary"
    >
      <Typography variant="body2">{formatMessage(intl, MODULE_NAME, 'projectBeneficiaries.enroll')}</Typography>
    </Button>
  );

  const actions = rights.includes(RIGHT_PROJECT_UPDATE) ? [
    {
      icon: assignButtonComponentFn,
      isFreeAction: true,
      onClick: () => setEnrollmentDialogOpen(true),
    },
  ] : [];

  const handleQueryChange = async ({
    page, pageSize, filters, search, orderBy, orderDirection,
  }) => {
    const offset = page * pageSize;

    // Build base filters
    const gqlFilters = [
      `project_Id: "${project.id}"`,
      'isDeleted: false',
      `first: ${pageSize}`,
      `offset: ${offset}`,
      'applyDefaultValidityFilter: true',
    ];

    // Handle global search
    if (search) {
      const sanitizedSearch = search.replace(/\\/g, '');
      gqlFilters.push(`search: "${sanitizedSearch}"`);
    }

    // TODO: Handle per-column filters
    filters?.forEach(({ column, value }) => {
      const { field } = column;

      if (!value || value === '' || value === 'all') return;

      // Boolean columns
      if (column.type === 'boolean') {
        gqlFilters.push(`${field}: ${value}`);
        return;
      }

      // Date fields
      if (column.type === 'date') {
        gqlFilters.push(`${field}_Gte: "${value}"`);
        return;
      }

      // Known fields from the table
      if (field) {
        gqlFilters.push(`${field}_Icontains: "${value}"`);
      }
    });

    // Handle ordering
    if (orderBy) {
      const prefix = orderDirection === 'desc' ? '-' : '';
      gqlFilters.push(`orderBy: ["${prefix}${convertFieldName(orderBy.field)}"]`);
    }

    return fetchProjectBeneficiaries(modulesManager, gqlFilters)
      .then((response) => {
        const payload = response?.payload?.data[payloadField] || {};
        const rows = (payload.edges || []).map(({ node }) => ({
          ...node,
          benefitPlan: { id: node?.benefitPlan?.id ? decodeId(node.benefitPlan.id) : null },
          id: decodeId(node.id),
          jsonExt: typeof node.jsonExt === 'string' ? JSON.parse(node.jsonExt) : node.jsonExt,
        }));

        return {
          data: rows,
          page,
          pageSize,
          totalCount: payload.totalCount || 0,
        };
      })
      .catch((error) => {
        // TODO: handle error
        console.error('Error fetching beneficiaries:', error);
        return {
          data: [],
          page: 0,
          pageSize,
          totalCount: 0,
        };
      });
  };

  return (
    !!project?.id && (
      <>
        <BeneficiaryTable
          allRows={localRows}
          fetchingBeneficiaries={fetchingBeneficiaries}
          tableTitle={tableTitle}
          isGroup={isGroup}
          actions={actions}
          onQueryChange={useRemote && handleQueryChange}
        />
        <EnrollmentDialogComponent
          open={enrollmentDialogOpen}
          onClose={() => setEnrollmentDialogOpen(false)}
          project={project}
          enrolledBeneficiaries={beneficiaries}
          isGroup={isGroup}
          orderBy={orderBy}
        />
      </>
    )
  );
}

// For Individual Beneficiaries
const mapStateToPropsIndividual = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  fetchingBeneficiaries: state.socialProtection.fetchingProjectBeneficiaries,
  beneficiaries: state.socialProtection.projectBeneficiaries,
});

const mapDispatchToPropsIndividual = (dispatch) => bindActionCreators({
  fetchProjectBeneficiaries,
}, dispatch);

const ConnectedProjectBeneficiaryTable = connect(
  mapStateToPropsIndividual,
  mapDispatchToPropsIndividual,
)(BaseProjectBeneficiaryTable);

export const ProjectBeneficiaryTable = injectIntl((props) => (
  <ConnectedProjectBeneficiaryTable
    {...props}
    EnrollmentDialogComponent={ProjectBeneficiariyEnrollmentDialog}
  />
));

// For Group Beneficiaries
const mapStateToPropsGroup = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  fetchingBeneficiaries: state.socialProtection.fetchingProjectGroupBeneficiaries,
  beneficiaries: state.socialProtection.projectGroupBeneficiaries,
});

const mapDispatchToPropsGroup = (dispatch) => bindActionCreators({
  fetchProjectBeneficiaries: fetchProjectGroupBeneficiaries,
}, dispatch);

const ConnectedProjectGroupBeneficiaryTable = connect(
  mapStateToPropsGroup,
  mapDispatchToPropsGroup,
)(BaseProjectBeneficiaryTable);

export const ProjectGroupBeneficiaryTable = injectIntl((props) => (
  <ConnectedProjectGroupBeneficiaryTable
    {...props}
    isGroup
    EnrollmentDialogComponent={ProjectGroupBeneficiaryEnrollmentDialog}
  />
));
