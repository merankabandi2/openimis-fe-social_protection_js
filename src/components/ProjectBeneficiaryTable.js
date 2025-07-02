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
import { fetchProjectBeneficiaries } from '../actions';
import {
  MODULE_NAME,
  RIGHT_PROJECT_UPDATE,
} from '../constants';
import BeneficiaryTable from './BeneficiaryTable';
import ProjectEnrollmentDialog from '../dialogs/ProjectEnrollmentDialog';

function ProjectBeneficiaryTable({
  rights,
  intl,
  project,
  fetchProjectBeneficiaries,
  fetchingBeneficiaries,
  beneficiaries,
  beneficiariesTotalCount,
}) {
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
      ]);
    }
  }, [project?.benefitPlan?.id]);

  useEffect(() => {
    const decoratedBeneficiaries = beneficiaries.map((b) => (
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
      // className={classes.actionButton}
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
          nameDoBFieldPrefix="individual"
          actions={actions}
        />
        <ProjectEnrollmentDialog
          open={enrollmentDialogOpen}
          onClose={() => setEnrollmentDialogOpen(false)}
          project={project}
          enrolledBeneficiaries={beneficiaries}
          enrolledBeneficiariesTotalCount={beneficiariesTotalCount}
        />
      </>
    )
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  fetchingBeneficiaries: state.socialProtection.fetchingProjectBeneficiaries,
  fetchedBeneficiaries: state.socialProtection.fetchedProjectBeneficiaries,
  errorBeneficiaries: state.socialProtection.errorProjectBeneficiaries,
  beneficiaries: state.socialProtection.projectBeneficiaries,
  beneficiariesPageInfo: state.socialProtection.projectBeneficiariesPageInfo,
  beneficiariesTotalCount: state.socialProtection.projectBeneficiariesTotalCount,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchProjectBeneficiaries,
}, dispatch);

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ProjectBeneficiaryTable));
