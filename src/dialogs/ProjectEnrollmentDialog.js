import React, { useState, useEffect, useRef } from 'react';
import { injectIntl } from 'react-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  formatMessage,
  formatMessageWithValues,
  useModulesManager,
  decodeId,
  journalize,
} from '@openimis/fe-core';
import {
  fetchProjectBeneficiaries,
  fetchBeneficiaries,
  enroll,
} from '../actions';
import {
  MODULE_NAME,
} from '../constants';
import BeneficiaryTable from '../components/BeneficiaryTable';

const styles = () => ({
  dialogPaper: {
    width: 1200,
    maxWidth: 1500,
    maxHeight: 800,
  },
  closeButton: {
    padding: 6,
  },
  subtitle: {
    marginTop: -12,
    marginBottom: 12,
    fontSize: '1rem',
  },
  actionsContainer: {
    display: 'inline',
    paddingLeft: 10,
  },
  saveButton: {
    float: 'right',
    margin: '-2px 16px 5px',
  },
});

function ProjectEnrollmentDialog({
  intl,
  classes,
  open,
  onClose,
  project,
  enrolledBeneficiaries,
  fetchBeneficiaries,
  fetchingBeneficiaries,
  fetchProjectBeneficiaries,
  beneficiaries,
  enroll,
  submittingMutation,
  mutation,
  journalize,
}) {
  const prevSubmittingMutationRef = useRef();
  const modulesManager = useModulesManager();
  const [selectedRows, setSelectedRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const tableTitle = formatMessageWithValues(
    intl,
    MODULE_NAME,
    'projectBeneficiaries.activeSelected',
    { n: selectedRows.length },
  );

  const translate = (key) => formatMessage(intl, MODULE_NAME, key);

  // Sync selected rows & check status on dialog open
  useEffect(() => {
    setSelectedRows(enrolledBeneficiaries);

    const checkedIds = new Set(enrolledBeneficiaries.map((b) => b.id));
    setAllRows((prevRows) => {
      // If we already have rows, just update their checked status
      if (prevRows.length > 0 && beneficiaries.length === prevRows.length) {
        prevRows.forEach((row) => ({
          ...row,
          tableData: {
            ...row.tableData,
            checked: checkedIds.has(row.id),
          },
        }));
        return prevRows;
      }

      // Otherwise create new rows (only when beneficiaries actually change)
      return beneficiaries.map((b) => ({
        ...b,
        jsonExt: typeof b.jsonExt === 'string' ? JSON.parse(b.jsonExt) : b.jsonExt,
        tableData: { checked: checkedIds.has(b.id) },
      }));
    });
  }, [beneficiaries, enrolledBeneficiaries]);

  // Trigger fetch when dialog opens
  useEffect(() => {
    if (open && project?.benefitPlan?.id) {
      fetchBeneficiaries(modulesManager, [
        `benefitPlan_Id: "${project.benefitPlan.id}"`,
        'isDeleted: false',
        'status: ACTIVE',
        `villageOrChildOf: ${decodeId(project.location.id)}`,
        'first: 100',
      ]);
    }
  }, [open, project?.benefitPlan?.id]);

  const onSelectionChange = (rows) => setSelectedRows(rows);

  const onSave = () => {
    enroll(
      {
        projectId: project.id,
        ids: selectedRows.map((r) => r.id),
      },
      formatMessageWithValues(
        intl,
        MODULE_NAME,
        'project.enroll.mutationLabel',
        { name: project.name, n: selectedRows?.length || 0 },
      ),
    );

    onClose();
  };

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
    }
    if (mutation?.clientMutationId) {
      fetchProjectBeneficiaries(modulesManager, [
        `project_Id: "${project.id}"`,
        'isDeleted: false',
      ]);
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  return (
    <Dialog open={open} onClose={onClose} classes={{ paper: classes.dialogPaper }}>
      <DialogTitle style={{ paddingBottom: 0 }}>
        {translate('projectBeneficiaries.dialogTitle')}
        <div style={{ float: 'right' }}>
          <IconButton
            aria-label="close"
            onClick={onClose}
            className={classes.closeButton}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <div className={classes.subtitle}>
          {translate('projectBeneficiaries.dialogSubtitle')}
        </div>

        <BeneficiaryTable
          allRows={allRows}
          fetchingBeneficiaries={fetchingBeneficiaries}
          onSelectionChange={onSelectionChange}
          tableTitle={tableTitle}
          nameDoBFieldPrefix="individual"
        />
      </DialogContent>

      <DialogActions className={classes.actionsContainer}>
        <Button
          onClick={onSave}
          variant="contained"
          color="primary"
          autoFocus
          className={classes.saveButton}
        >
          {translate('projectBeneficiaries.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const mapStateToProps = (state) => ({
  fetchingBeneficiaries: state.socialProtection.fetchingBeneficiaries,
  beneficiaries: state.socialProtection.beneficiaries,
  submittingMutation: state.socialProtection.submittingMutation,
  mutation: state.socialProtection.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchProjectBeneficiaries,
  fetchBeneficiaries,
  enroll,
  journalize,
}, dispatch);

export default injectIntl(
  withTheme(
    withStyles(styles)(
      connect(mapStateToProps, mapDispatchToProps)(ProjectEnrollmentDialog),
    ),
  ),
);
