import React, {
  useState, useEffect,
} from 'react';
import { injectIntl } from 'react-intl';
import {
  formatMessage,
  formatMessageWithValues,
  Searcher,
  downloadExport,
  CLEARED_STATE_FILTER,
  useModulesManager,
  useHistory,
} from '@openimis/fe-core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Tooltip,
  DialogContent,
  Checkbox,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Box,
  Typography,
} from '@material-ui/core';
import PreviewIcon from '@material-ui/icons/ListAlt';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import {
  fetchGroupBeneficiaries, downloadGroupBeneficiaries, updateGroupBeneficiary,
  clearGroupBeneficiaryExport, bulkUpdateGroupBeneficiaryStatus,
} from '../actions';
import {
  DEFAULT_PAGE_SIZE,
  LOC_LEVELS,
  locationAtLevel,
  RIGHT_GROUP_SEARCH,
  RIGHT_BENEFICIARY_UPDATE,
  RIGHT_BENEFICIARY_SEARCH,
  ROWS_PER_PAGE_OPTIONS,
  BENEFICIARY_STATUS,
} from '../constants';
import BenefitPlanGroupBeneficiariesFilter from './BenefitPlanGroupBeneficiariesFilter';
import BeneficiaryStatusPicker from '../pickers/BeneficiaryStatusPicker';
import GroupBeneficiaryCSVUpdateDialog from '../dialogs/GroupBeneficiaryCSVUpdateDialog';

import {
  applyNumberCircle,
} from '../util/searcher-utils';

function BenefitPlanGroupBeneficiariesSearcherWithBulkUpdate({
  rights = [],
  intl,
  benefitPlan,
  fetchGroupBeneficiaries,
  downloadGroupBeneficiaries,
  fetchingGroupBeneficiaries,
  fetchedGroupBeneficiaries,
  errorGroupBeneficiaries,
  groupBeneficiaries,
  groupBeneficiariesPageInfo,
  groupBeneficiariesTotalCount,
  clearGroupBeneficiaryExport,
  status,
  readOnly,
  groupBeneficiaryExport,
  errorGroupBeneficiaryExport,
  updateGroupBeneficiary,
  bulkUpdateGroupBeneficiaryStatus,
}) {
  const modulesManager = useModulesManager();
  const history = useHistory();
  const [updatedGroupBeneficiaries, setUpdatedGroupBeneficiaries] = useState([]);
  const [selectedGroupBeneficiaries, setSelectedGroupBeneficiaries] = useState([]);
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const [csvUpdateOpen, setCSVUpdateOpen] = useState(false);
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('');
  const [bulkUpdateReason, setBulkUpdateReason] = useState('');
  const fetch = (params) => fetchGroupBeneficiaries(modulesManager, params);

  const headers = () => {
    const baseHeaders = [
      'socialProtection.groupBeneficiary.code',
    ];

    baseHeaders.push(...Array.from({ length: LOC_LEVELS }, (_, i) => `location.locationType.${i}`));
    baseHeaders.push('socialProtection.groupBeneficiary.status');

    if (status) {
      baseHeaders.push('socialProtection.beneficiary.isEligible');
    }
    baseHeaders.push('socialProtection.groupBeneficiary.card');

    baseHeaders.push('');

    return baseHeaders;
  };

  const addUpdatedGroupBeneficiary = (groupBeneficiary, status) => {
    setUpdatedGroupBeneficiaries((prevState) => {
      const updatedGroupBeneficiaryExists = prevState.some(
        (item) => item.id === groupBeneficiary.id && item.status === status,
      );

      if (!updatedGroupBeneficiaryExists) {
        return [...prevState, groupBeneficiary];
      }

      return prevState.filter(
        (item) => !(item.id === groupBeneficiary.id && item.status === status),
      );
    });
  };

  const handleStatusOnChange = (groupBeneficiary, status) => {
    if (groupBeneficiary && status) {
      addUpdatedGroupBeneficiary(groupBeneficiary, status);
      const editedGroupBeneficiary = { ...groupBeneficiary, status };
      updateGroupBeneficiary(
        editedGroupBeneficiary,
        formatMessageWithValues(intl, 'socialProtection', 'groupBeneficiary.update.mutationLabel', {
          id: groupBeneficiary.group.id,
        }),
      );
    }
  };

  const openBenefitPackage = (groupBeneficiary) => history.push(`${benefitPlan?.id}/`
  + `${modulesManager.getRef('socialProtection.route.benefitPackage')}`
    + `/group/${groupBeneficiary?.id}`);

  const handleSelectGroupBeneficiary = (groupBeneficiary) => {
    setSelectedGroupBeneficiaries((prev) => {
      const index = prev.findIndex((gb) => gb.id === groupBeneficiary.id);
      if (index >= 0) {
        return prev.filter((gb) => gb.id !== groupBeneficiary.id);
      }
      return [...prev, groupBeneficiary];
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedGroupBeneficiaries(groupBeneficiaries || []);
    } else {
      setSelectedGroupBeneficiaries([]);
    }
  };

  const handleBulkUpdateSubmit = () => {
    if (selectedGroupBeneficiaries.length > 0 && bulkUpdateStatus) {
      const groupBeneficiaryIds = selectedGroupBeneficiaries.map((gb) => gb.id);
      bulkUpdateGroupBeneficiaryStatus(
        groupBeneficiaryIds,
        bulkUpdateStatus,
        bulkUpdateReason,
        formatMessageWithValues(intl, 'socialProtection', 'groupBeneficiary.bulkUpdate.mutationLabel', {
          count: groupBeneficiaryIds.length,
        }),
      );
      setBulkUpdateOpen(false);
      setSelectedGroupBeneficiaries([]);
      setBulkUpdateStatus('');
      setBulkUpdateReason('');
      // Refresh the list
      fetch(defaultFilters());
    }
  };

  const handleCSVUpdateSuccess = () => {
    // Refresh the list after CSV update
    fetch(defaultFilters());
  };

  const itemFormatters = () => {
    const result = [
      (groupBeneficiary) => groupBeneficiary.group.code,
    ];

    const locations = Array.from({ length: LOC_LEVELS }, (_, i) => (groupBeneficiary) => (
      locationAtLevel(groupBeneficiary?.group?.location, LOC_LEVELS - i - 1)
    ));
    result.push(...locations);

    if (rights.includes(RIGHT_BENEFICIARY_UPDATE)) {
      result.push((groupBeneficiary) => (
        <BeneficiaryStatusPicker
          withLabel={false}
          withNull={false}
          value={groupBeneficiary.status}
          onChange={(status) => handleStatusOnChange(groupBeneficiary, status)}
        />
      ));
    }

    result.push((groupBeneficiary) => (groupBeneficiary.status === BENEFICIARY_STATUS.ACTIVE ? <a href={`/api/merankabandi/card/${groupBeneficiary.group.code}/`}>Carte</a> : ''));

    if (rights.includes(RIGHT_GROUP_SEARCH)) {
      result.push((groupBeneficiary) => (
        <Tooltip title={formatMessage(intl, 'socialProtection', 'benefitPackage.overviewButtonTooltip')}>
          <IconButton
            onClick={() => openBenefitPackage(groupBeneficiary)}
          >
            <PreviewIcon />
          </IconButton>
        </Tooltip>
      ));
    }

    return result;
  };

  const isRowDisabled = (_, groupBeneficiary) => (
    updatedGroupBeneficiaries.some((item) => item.id === groupBeneficiary.id));

  const sorts = () => [
    ['group_Id', false],
    ['status', false],
  ];

  const defaultFilters = () => {
    const filters = {
      benefitPlan_Id: {
        value: benefitPlan?.id,
        filter: `benefitPlan_Id: "${benefitPlan?.id}"`,
      },
      isDeleted: {
        value: false,
        filter: 'isDeleted: false',
      },
    };
    if (status !== null && status !== undefined) {
      filters.status = {
        value: status,
        filter: `status: ${status}`,
      };
    }

    return filters;
  };

  const [failedExport, setFailedExport] = useState(false);
  const [appliedCustomFilters, setAppliedCustomFilters] = useState([CLEARED_STATE_FILTER]);
  const [appliedFiltersRowStructure, setAppliedFiltersRowStructure] = useState([CLEARED_STATE_FILTER]);

  useEffect(() => {
    if (errorGroupBeneficiaryExport) {
      setFailedExport(true);
    }
  }, [errorGroupBeneficiaryExport]);

  useEffect(() => {
    if (groupBeneficiaryExport) {
      downloadExport(
        groupBeneficiaryExport,
        `${formatMessage(intl, 'socialProtection', 'export.filename.groupBeneficiaries')}.csv`,
      )();
      clearGroupBeneficiaryExport();
    }

    return setFailedExport(false);
  }, [groupBeneficiaryExport]);

  const groupBeneficiaryFilter = (props) => (
    <BenefitPlanGroupBeneficiariesFilter
      intl={props.intl}
      classes={props.classes}
      filters={props.filters}
      onChangeFilters={props.onChangeFilters}
      readOnly={readOnly}
      status={status}
    />
  );

  const additionalParams = benefitPlan ? { benefitPlan: `${benefitPlan.id}` } : null;

  useEffect(() => {
    // refresh when appliedCustomFilters is changed
  }, [appliedCustomFilters]);

  const bulkActions = rights.includes(RIGHT_BENEFICIARY_UPDATE) && !readOnly ? [
    {
      name: 'bulkUpdateStatus',
      label: formatMessageWithValues(intl, 'socialProtection', 'groupBeneficiary.bulkUpdateStatus', {
        count: selectedGroupBeneficiaries.length,
      }),
      enabled: selectedGroupBeneficiaries.length > 0,
      onClick: () => setBulkUpdateOpen(true),
    },
    {
      name: 'csvUpdateStatus',
      label: formatMessage(intl, 'socialProtection', 'groupBeneficiary.csvUpdateStatus'),
      enabled: true,
      icon: <CloudUploadIcon />,
      onClick: () => setCSVUpdateOpen(true),
    },
  ] : [];

  return (
    !!benefitPlan?.id && (
    <div>
      {rights.includes(RIGHT_BENEFICIARY_UPDATE) && !readOnly && (
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <FormControlLabel
            control={(
              <Checkbox
                checked={groupBeneficiaries?.length > 0 && selectedGroupBeneficiaries.length === groupBeneficiaries.length}
                indeterminate={selectedGroupBeneficiaries.length > 0 && selectedGroupBeneficiaries.length < groupBeneficiaries.length}
                onChange={handleSelectAll}
              />
            )}
            label={formatMessage(intl, 'socialProtection', 'groupBeneficiary.selectAll')}
          />
          {selectedGroupBeneficiaries.length > 0 && (
            <Typography variant="body2" color="textSecondary">
              {formatMessageWithValues(intl, 'socialProtection', 'groupBeneficiary.selectedCount', {
                count: selectedGroupBeneficiaries.length,
              })}
            </Typography>
          )}
        </Box>
      )}
      <Searcher
        module="benefitPlan"
        FilterPane={groupBeneficiaryFilter}
        fetch={fetch}
        items={groupBeneficiaries}
        actions={bulkActions.length > 0 ? bulkActions : undefined}
        itemsPageInfo={groupBeneficiariesPageInfo}
        fetchingItems={fetchingGroupBeneficiaries}
        fetchedItems={fetchedGroupBeneficiaries}
        errorItems={errorGroupBeneficiaries}
        tableTitle={formatMessageWithValues(intl, 'socialProtection', 'groupBeneficiaries.searcherResultsTitle', {
          groupBeneficiariesTotalCount,
        })}
        exportable
        exportFetch={downloadGroupBeneficiaries}
        exportFields={[
          'id',
          'json_ext', // Unfolded by backend and removed from csv
        ]}
        exportFieldsColumns={{
          id: 'ID',
        }}
        exportFieldLabel={formatMessage(intl, 'socialProtection', 'export.label')}
        exportFileFormats={['csv', 'xlsx']}
        exportFileFormat="xlsx"
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultFilters={defaultFilters()}
        cacheFiltersKey="benefitPlanGroupBeneficiaryFilterCache"
        cachePerTab
        cacheTabName={`${benefitPlan?.id}-${status}`}
        isCustomFiltering
        objectForCustomFiltering={benefitPlan}
        moduleName="individual"
        objectType="Individual"
        additionalCustomFilterParams={additionalParams}
        appliedCustomFilters={appliedCustomFilters}
        setAppliedCustomFilters={setAppliedCustomFilters}
        appliedFiltersRowStructure={appliedFiltersRowStructure}
        setAppliedFiltersRowStructure={setAppliedFiltersRowStructure}
        applyNumberCircle={applyNumberCircle}
        rowDisabled={isRowDisabled}
        rowLocked={isRowDisabled}
      />

      {/* Bulk Update Dialog */}
      <Dialog open={bulkUpdateOpen} onClose={() => setBulkUpdateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {formatMessageWithValues(intl, 'socialProtection', 'groupBeneficiary.bulkUpdateDialog.title', {
            count: selectedGroupBeneficiaries.length,
          })}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <FormLabel>{formatMessage(intl, 'socialProtection', 'groupBeneficiary.status')}</FormLabel>
            <BeneficiaryStatusPicker
              withLabel={false}
              withNull={false}
              value={bulkUpdateStatus}
              onChange={setBulkUpdateStatus}
            />
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label={formatMessage(intl, 'socialProtection', 'groupBeneficiary.bulkUpdateDialog.reason')}
            value={bulkUpdateReason}
            onChange={(e) => setBulkUpdateReason(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkUpdateOpen(false)}>
            {formatMessage(intl, 'socialProtection', 'cancel')}
          </Button>
          <Button
            onClick={handleBulkUpdateSubmit}
            color="primary"
            disabled={!bulkUpdateStatus}
          >
            {formatMessage(intl, 'socialProtection', 'groupBeneficiary.bulkUpdateDialog.submit')}
          </Button>
        </DialogActions>
      </Dialog>

      <Button
        variant="outlined"
        color="primary"
        startIcon={<CloudUploadIcon />}
        onClick={() => setCSVUpdateOpen(true)}
        size="small"
      >
        {formatMessage(intl, 'socialProtection', 'groupBeneficiary.csvUpdateStatus')}
      </Button>
      {/* CSV Update Dialog */}
      <GroupBeneficiaryCSVUpdateDialog
        open={csvUpdateOpen}
        onClose={() => setCSVUpdateOpen(false)}
        benefitPlan={benefitPlan}
        onSuccess={handleCSVUpdateSuccess}
      />

      {/* Export Error Dialog */}
      {failedExport && (
        <Dialog open={failedExport} fullWidth maxWidth="sm">
          <DialogTitle>{errorGroupBeneficiaryExport?.message}</DialogTitle>
          <DialogContent>
            <Button onClick={(e) => setFailedExport(false)} color="primary">
              {formatMessage(intl, 'socialProtection', 'ok')}
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
    )
  );
}

const mapStateToProps = (state) => ({
  fetchingGroupBeneficiaries: state.socialProtection.fetchingGroupBeneficiaries,
  fetchedGroupBeneficiaries: state.socialProtection.fetchedGroupBeneficiaries,
  errorGroupBeneficiaries: state.socialProtection.errorGroupBeneficiaries,
  groupBeneficiaries: state.socialProtection.groupBeneficiaries,
  groupBeneficiariesPageInfo: state.socialProtection.groupBeneficiariesPageInfo,
  groupBeneficiariesTotalCount: state.socialProtection.groupBeneficiariesTotalCount,
  groupBeneficiaryExport: state.socialProtection.groupBeneficiaryExport,
  errorGroupBeneficiaryExport: state.socialProtection.errorGroupBeneficiaryExport,
  rights: state.core?.user?.i_user?.rights || [],
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchGroupBeneficiaries,
  downloadGroupBeneficiaries,
  clearGroupBeneficiaryExport,
  updateGroupBeneficiary,
  bulkUpdateGroupBeneficiaryStatus,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(BenefitPlanGroupBeneficiariesSearcherWithBulkUpdate));
