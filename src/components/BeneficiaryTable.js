import React, { useMemo } from 'react';
import { injectIntl } from 'react-intl';
import MaterialTable from 'material-table';
import _ from 'lodash';
import {
  Select,
  MenuItem,
} from '@material-ui/core';
import {
  withTheme,
  withStyles,
  ThemeProvider,
  createMuiTheme,
} from '@material-ui/core/styles';
import {
  formatMessage,
} from '@openimis/fe-core';
import {
  LOC_LEVELS,
  locationFormatter,
} from '../util/searcher-utils';
import {
  MODULE_NAME,
} from '../constants';

const styles = (theme) => ({
  page: theme.page,
  paper: theme.paper.classes,
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

function BeneficiaryTable({
  intl,
  theme,
  allRows,
  fetchingBeneficiaries,
  onSelectionChange,
  tableTitle,
  actions,
  additionalColumns,
  nameDoBFieldPrefix,
}) {
  const translate = (key) => formatMessage(intl, MODULE_NAME, key);

  const [filters, setFilters] = React.useState({});

  const dynamicColumns = React.useMemo(() => (
    getDynamicColumns(allRows, translate, filters)
  ), [allRows, translate]);

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
      MuiTableBody: {
        root: {
          fontSize: '0.875rem',
        },
      },
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
          backgroundColor: theme.paper.body.backgroundColor,
          margin: '0 -20px -15px',
        },
      },
      MuiTablePagination: {
        toolbar: {
          backgroundColor: 'white',
          marginBottom: 0,
        },
      },
    },
  });

  const columns = useMemo(() => {
    const allColumns = [
      ...additionalColumns || [],
      {
        title: translate('socialProtection.beneficiary.firstName'),
        field: `${nameDoBFieldPrefix}.firstName`,
      },
      {
        title: translate('socialProtection.beneficiary.lastName'),
        field: `${nameDoBFieldPrefix}.lastName`,
      },
      {
        title: translate('socialProtection.beneficiary.dob'),
        field: `${nameDoBFieldPrefix}.dob`,
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

    return allColumns.map((c) => ({
      ...c,
      width: c.field && c.field.includes('email') ? '200px' : '140px',
      tableData: { filterValue: filters[c.title] || '' },
    }));
  }, [additionalColumns, filters, nameDoBFieldPrefix, translate, dynamicColumns]);

  const isSelectable = !!onSelectionChange;

  const cellPadding = isSelectable ? '0' : '0 0 0 10px';

  return (
    <ThemeProvider theme={tableTheme}>
      <MaterialTable
        title={tableTitle}
        columns={columns}
        data={allRows}
        isLoading={fetchingBeneficiaries}
        options={{
          selection: isSelectable,
          selectionProps: {
            color: 'primary',
          },
          search: true,
          filtering: true,
          paging: true,
          pageSize: 10,
          pageSizeOptions: [10, 50, 100],
          showSelectAllCheckbox: isSelectable,
          headerStyle: {
            padding: cellPadding,
            fontWeight: 500,
            color: theme.palette.primary.main,
          },
          cellStyle: {
            padding: cellPadding,
            fontWeight: 400,
            color: theme.palette.primary.main,
          },
          filterCellStyle: {
            padding: cellPadding,
            color: theme.palette.primary.main,
          },
          rowStyle: {
            height: '42px',
          },
          doubleHorizontalScroll: true,
          tableLayout: 'fixed',
          emptyRowsWhenPaging: false,
        }}
        localization={{
          toolbar: {
            nRowsSelected: isSelectable ? tableTitle : '',
          },
          body: {
            filterRow: {
              filterPlaceHolder: translate('projectBeneficiaries.filterPlaceholder'),
            },
          },
        }}
        onFilterChange={(appliedFilters) => {
          const updatedFilters = {};
          appliedFilters.forEach((filter) => {
            if (filter?.value !== undefined) {
              // keyed by column title because not all columns have field
              updatedFilters[filter.column.title] = filter.value;
            }
          });
          setFilters(updatedFilters);
        }}
        onSelectionChange={(rows) => (isSelectable && onSelectionChange(rows))}
        actions={actions}
        style={{ padding: '0 20px' }}
      />
    </ThemeProvider>
  );
}

export default injectIntl(withTheme(withStyles(styles)(BeneficiaryTable)));
