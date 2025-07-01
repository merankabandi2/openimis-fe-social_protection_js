import React, { useState, useEffect, useRef } from 'react';
import { injectIntl } from 'react-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  MenuItem,
  Select,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import MaterialTable from 'material-table';
import _ from 'lodash';
import {
  formatMessage,
  formatMessageWithValues,
  useModulesManager,
  decodeId,
  journalize,
} from '@openimis/fe-core';
import {
  ThemeProvider,
  createTheme,
  withStyles,
  withTheme,
  alpha,
} from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  fetchProjectBeneficiaries,
  fetchBeneficiaries,
  enroll,
} from '../actions';
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
    marginBottom: 12,
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

const exclusionKeys = [
  'first_name', 'last_name', 'dob',
  'location_name', 'location_code',
  'report_synch', 'version',
  'group_code', 'individual_role', 'recepien_info',
];

const getDynamicColumns = (data, translateFn) => {
  if (!data || !data.length) return [];

  const sampleItem = data.find((item) => item.jsonExt && Object.keys(item.jsonExt).length > 0);
  if (!sampleItem) return [];

  return Object.keys(sampleItem.jsonExt)
    .filter((key) => !exclusionKeys.includes(key))
    .map((key) => {
      // Detect type from first non-null value
      // TODO: use benefit plan schema instead
      const sampleValue = sampleItem.jsonExt[key];
      let columnType = 'string';
      let renderFn = (rowData) => {
        const value = rowData.jsonExt?.[key];
        if (value === null || value === undefined) return '';
        return String(value);
      };
      let filterFn = (term, rowData) => {
        const value = rowData.jsonExt?.[key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(term.toLowerCase());
      };
      let filterComponent;

      if (typeof sampleValue === 'boolean') {
        columnType = 'boolean';
        renderFn = (rowData) => (rowData.jsonExt?.[key] ? translateFn('common.true') : translateFn('common.false'));
        filterFn = (term, rowData) => {
          if (term === 'all') return true;
          return term === String(rowData.jsonExt?.[key]);
        };
        filterComponent = ({ columnDef, onFilterChanged }) => (
          <Select
            fullWidth
            value={columnDef.tableData.filterValue || 'all'}
            onChange={({ target }) => {
              onFilterChanged(columnDef.tableData.id, target.value);
            }}
            displayEmpty
          >
            <MenuItem value="all">{translateFn('common.any')}</MenuItem>
            <MenuItem value="true">{translateFn('common.true')}</MenuItem>
            <MenuItem value="false">{translateFn('common.false')}</MenuItem>
          </Select>
        );
      } else if (typeof sampleValue === 'number') {
        columnType = 'numeric';
      } else if (typeof sampleValue === 'object') {
        renderFn = (rowData) => JSON.stringify(rowData.jsonExt?.[key]);
      } else if (
        typeof sampleValue === 'string'
        && !Number.isNaN(sampleValue)
        && !Number.isNaN(Date.parse(sampleValue))
      ) {
        columnType = 'date';
        renderFn = (rowData) => {
          const date = new Date(rowData.jsonExt?.[key]);
          return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
        };
      }

      return {
        title: _.startCase(key),
        field: `jsonExt.${key}`,
        type: columnType,
        render: renderFn,
        filterComponent,
        customFilterAndSearch: filterFn,
        align: 'left',
      };
    });
};

function ProjectEnrollmentDialog({
  intl,
  theme,
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

    const checkedIds = enrolledBeneficiaries.map((b) => b.id);
    const decoratedBeneficiaries = beneficiaries.map((b) => (
      {
        ...b,
        jsonExt: typeof b.jsonExt === 'string' ? JSON.parse(b.jsonExt) : b.jsonExt,
        tableData: { ...b.tableData, checked: checkedIds.includes(b.id) },
      }
    ));
    setAllRows(decoratedBeneficiaries);
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

  const dynamicColumns = React.useMemo(() => (
    getDynamicColumns(allRows, translate)
  ), [allRows, translate]);

  const tableTheme = createTheme({
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
      MuiInputBase: {
        root: {
          fontSize: '0.875rem',
          color: theme.palette.text.primary,
          '&.Mui-focused': {
            color: theme.palette.primary.main,
          },
        },
      },
      MuiList: {
        root: {
          color: theme.palette.text.primary,
        },
      },
      MuiIcon: {
        root: {
          color: theme.palette.primary.main,
        },
      },
      MuiToolbar: {
        root: {
          backgroundColor: alpha(theme.palette.primary.light, 0.2),
        },
      },
      MuiTablePagination: {
        toolbar: {
          backgroundColor: 'white',
        },
      },
    },
  });

  const columns = [
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
    ...dynamicColumns,
  ];

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
            columns={columns}
            data={allRows}
            isLoading={fetchingBeneficiaries}
            options={{
              selection: true,
              selectionProps: {
                color: 'primary',
              },
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
              rowStyle: {
                height: '42px',
              },
              searchFieldStyle: {
                position: 'fixed',
                right: '164px',
                top: '120px',
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
            style={{ width: 140 * columns.length }}
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
