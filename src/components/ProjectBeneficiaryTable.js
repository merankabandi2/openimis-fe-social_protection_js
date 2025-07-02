import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import {
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

function BaseProjectBeneficiaryTable({
  project,
  isGroup,
  EnrollmentDialogComponent,
  rights,
  intl,
  fetchProjectBeneficiaries,
  fetchingBeneficiaries,
  beneficiaries,
  beneficiariesTotalCount,
}) {
  const orderBy = isGroup ? 'orderBy: ["group__code"]' : 'orderBy: ["individual__last_name", "individual__first_name"]';
  const modulesManager = useModulesManager();
  const [allRows, setAllRows] = useState([]);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const tableTitle = formatMessageWithValues(
    intl,
    MODULE_NAME,
    'projectBeneficiaries.enrolled',
    { n: beneficiariesTotalCount },
  );

  // Trigger fetch
  useEffect(() => {
    if (project?.benefitPlan?.id) {
      fetchProjectBeneficiaries(modulesManager, [
        `project_Id: "${project.id}"`,
        'isDeleted: false',
        orderBy,
        'first: 100', // TODO: switch to remote data
      ]);
    }
  }, [project?.benefitPlan?.id]);

  useEffect(() => {
    const decoratedBeneficiaries = (beneficiaries || []).map((b) => (
      {
        ...b,
        jsonExt: typeof b.jsonExt === 'string' ? JSON.parse(b.jsonExt) : b.jsonExt,
      }
    ));
    setAllRows(decoratedBeneficiaries);
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

  return (
    !!project?.id && (
      <>
        <BeneficiaryTable
          allRows={allRows}
          fetchingBeneficiaries={fetchingBeneficiaries}
          tableTitle={tableTitle}
          isGroup={isGroup}
          actions={actions}
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
  beneficiariesTotalCount: state.socialProtection.projectBeneficiariesTotalCount,
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
  beneficiariesTotalCount: state.socialProtection.projectGroupBeneficiariesTotalCount,
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
