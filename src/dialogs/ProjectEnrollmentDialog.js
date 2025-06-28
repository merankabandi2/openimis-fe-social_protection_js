import React, { useState, useEffect } from 'react';
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
import MaterialTable from 'material-table';
import {
  formatMessage,
  formatMessageWithValues,
  useModulesManager,
} from '@openimis/fe-core';
import {
  ThemeProvider,
  createMuiTheme,
  withStyles,
  withTheme,
  fade,
} from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchBeneficiaries } from '../actions';
import {
  MODULE_NAME,
} from '../constants';
import {
  LOC_LEVELS,
  locationFormatter,
} from '../util/searcher-utils';

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
    marginTop: -10,
    marginBottom: 20,
    fontSize: '1rem',
  },
  actionsContainer: {
    display: 'inline',
    paddingLeft: 10,
  },
  saveButton: {
    float: 'right',
    margin: '0 16px 15px',
  },
});

function ProjectEnrollmentDialog({
  intl,
  theme,
  classes,
  open,
  onClose,
  project,
  enrolledBeneficiaries,
  enrolledBeneficiariesTotalCount,
  fetchBeneficiaries,
  fetchingBeneficiaries,
  beneficiaries,
}) {
  const modulesManager = useModulesManager();
  const [selectedRows, setSelectedRows] = useState([]);
  const tableTitle = formatMessageWithValues(
    intl,
    MODULE_NAME,
    'projectBeneficiaries.activeSelected',
    { n: selectedRows.length },
  );

  const translate = (key) => formatMessage(intl, MODULE_NAME, key);

  // Sync selected rows on dialog open
  useEffect(() => {
    setSelectedRows(enrolledBeneficiaries);
  }, [enrolledBeneficiaries, open]);

  // Trigger fetch when dialog opens
  // TODO (Wei): add status = active & location within project location filter
  useEffect(() => {
    if (open && project?.benefitPlan?.id) {
      fetchBeneficiaries(modulesManager, {
        benefitPlan_Id: project.benefitPlan.id,
        isDeleted: false,
        first: 1000,
      });
    }
  }, [open, project?.benefitPlan?.id]);

  const onSelectionChange = (rows) => setSelectedRows(rows);

  const onSave = () => {
    //TODO (Wei) actually save
    onClose();
  };

  const tableTheme = createMuiTheme({
    palette: {
      primary: theme.palette.primary,
      secondary: theme.palette.primary,
    },
    typography: {
      h6: {
        color: theme.palette.primary.main,
        fontSize: '1rem',
      },
    },
    overrides: {
      MuiIcon: {
        root: {
          color: theme.palette.primary.main,
        },
      },
      MuiToolbar: {
        root: {
          backgroundColor: fade(theme.palette.primary.light, 0.2),
        },
      },
      MuiTablePagination: {
        toolbar: {
          backgroundColor: 'white',
        },
      },
    },
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

        <ThemeProvider theme={tableTheme}>
          <MaterialTable
            title={tableTitle}
            columns={[
              {
                title: translate('socialProtection.beneficiary.firstName'),
                field: 'individual.firstName',
              },
              {
                title: translate('socialProtection.beneficiary.lastName'),
                field: 'individual.lastName',
              },
              {
                title: translate('socialProtection.beneficiary.dob'),
                field: 'individual.dob',
                type: 'date',
              },
              ...Array.from({ length: LOC_LEVELS }, (_, i) => ({
                title: translate(`location.locationType.${i}`),
                render: (rowData) => locationFormatter(rowData?.individual?.location)[i] || '',
                customFilterAndSearch: (term, rowData) => {
                  const locName = locationFormatter(rowData?.individual?.location)[i].toLowerCase() || '';
                  return locName.includes(term.toLowerCase());
                },
              })),
            ]}
            data={beneficiaries}
            isLoading={fetchingBeneficiaries}
            options={{
              selection: true,
              search: true,
              filtering: true,
              paging: true,
              pageSize: 10,
              pageSizeOptions: [10, 50, 100],
              showSelectAllCheckbox: true,
              headerStyle: {
                padding: 0,
                fontWeight: 500,
                color: theme.palette.primary.main,
              },
              cellStyle: {
                padding: 0,
                fontWeight: 400,
                color: theme.palette.primary.main,
              },
              filterCellStyle: {
                padding: 0,
                color: theme.palette.primary.main,
              },
            }}
            localization={{
              toolbar: {
                nRowsSelected: tableTitle,
              },
              body: {
                filterRow: {
                  filterPlaceHolder: translate('projectBeneficiaries.filterPlaceholder'),
                },
              },
            }}
            onSelectionChange={onSelectionChange}
          />
        </ThemeProvider>
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
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchBeneficiaries,
}, dispatch);

export default injectIntl(
  withTheme(
    withStyles(styles)(
      connect(mapStateToProps, mapDispatchToProps)(ProjectEnrollmentDialog),
    ),
  ),
);
