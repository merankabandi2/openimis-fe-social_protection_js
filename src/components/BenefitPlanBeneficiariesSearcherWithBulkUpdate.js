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
} from '@material-ui/core';
import PreviewIcon from '@material-ui/icons/ListAlt';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutline';
import {
  fetchBeneficiaries, downloadBeneficiaries, updateBeneficiary, clearBeneficiaryExport, bulkUpdateBeneficiaryStatus,
} from '../actions';
import {
  DEFAULT_PAGE_SIZE,
  RIGHT_BENEFICIARY_SEARCH,
  ROWS_PER_PAGE_OPTIONS,
  RIGHT_BENEFICIARY_UPDATE,
} from '../constants';
import BenefitPlanBeneficiariesFilter from './BenefitPlanBeneficiariesFilter';
import BeneficiaryStatusPicker from '../pickers/BeneficiaryStatusPicker';
import {
  applyNumberCircle,
  LOC_LEVELS,
  locationAtLevel,
} from '../util/searcher-utils';

function BenefitPlanBeneficiariesSearcherWithBulkUpdate({
  rights,
  intl,
  benefitPlan,
  fetchBeneficiaries,
  downloadBeneficiaries,
  fetchingBeneficiaries,
  fetchedBeneficiaries,
  errorBeneficiaries,
  beneficiaries,
  beneficiariesPageInfo,
  beneficiariesTotalCount,
  clearBeneficiaryExport,
  status,
  readOnly,
  beneficiaryExport,
  errorBeneficiaryExport,
  updateBeneficiary,
  bulkUpdateBeneficiaryStatus,
}) {
  const modulesManager = useModulesManager();
  const history = useHistory();
  const [updatedBeneficiaries, setUpdatedBeneficiaries] = useState([]);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState([]);
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('');
  const [bulkUpdateReason, setBulkUpdateReason] = useState('');
  const fetch = (params) => fetchBeneficiaries(modulesManager, params);

  const headers = () => {
    const baseHeaders = [];
    
    // Add checkbox header if user has update rights
    if (rights.includes(RIGHT_BENEFICIARY_UPDATE) && !readOnly) {
      baseHeaders.push('');
    }
    
    baseHeaders.push(
      'socialProtection.beneficiary.firstName',
      'socialProtection.beneficiary.lastName',
      'socialProtection.beneficiary.dob',
    );

    baseHeaders.push(...Array.from({ length: LOC_LEVELS }, (_, i) => `location.locationType.${i}`));
    baseHeaders.push('socialProtection.beneficiary.status');

    if (status) {
      baseHeaders.push('socialProtection.beneficiary.isEligible');
    }

    baseHeaders.push('');

    return baseHeaders;
  };

  const openBenefitPackage = (beneficiary) => history.push(`${benefitPlan?.id}/`
      + `${modulesManager.getRef('socialProtection.route.benefitPackage')}`
      + `/individual/${beneficiary?.id}`);

  const addUpdatedBeneficiary = (beneficiary, status) => {
    setUpdatedBeneficiaries((prevState) => {
      const updatedBeneficiaryExists = prevState.some(
        (item) => item.id === beneficiary.id && item.status === status,
      );

      if (!updatedBeneficiaryExists) {
        return [...prevState, beneficiary];
      }

      return prevState.filter(
        (item) => !(item.id === beneficiary.id && item.status === status),
      );
    });
  };

  const handleStatusOnChange = (beneficiary, status) => {
    if (beneficiary && status) {
      addUpdatedBeneficiary(beneficiary, status);
      const editedBeneficiary = { ...beneficiary, status };
      updateBeneficiary(
        editedBeneficiary,
        formatMessageWithValues(intl, 'socialProtection', 'beneficiary.update.mutationLabel', {
          id: beneficiary.individual.id,
        }),
      );
    }
  };

  const handleSelectBeneficiary = (beneficiary) => {
    setSelectedBeneficiaries(prev => {
      const index = prev.findIndex(b => b.id === beneficiary.id);
      if (index >= 0) {
        return prev.filter(b => b.id !== beneficiary.id);
      }
      return [...prev, beneficiary];
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedBeneficiaries(beneficiaries || []);
    } else {
      setSelectedBeneficiaries([]);
    }
  };

  const handleBulkUpdateSubmit = () => {
    if (selectedBeneficiaries.length > 0 && bulkUpdateStatus) {
      const beneficiaryIds = selectedBeneficiaries.map(b => b.id);
      bulkUpdateBeneficiaryStatus(
        beneficiaryIds,
        bulkUpdateStatus,
        bulkUpdateReason,
        formatMessageWithValues(intl, 'socialProtection', 'beneficiary.bulkUpdate.mutationLabel', {
          count: beneficiaryIds.length,
        }),
      );
      setBulkUpdateOpen(false);
      setSelectedBeneficiaries([]);
      setBulkUpdateStatus('');
      setBulkUpdateReason('');
      // Refresh the list
      fetch(defaultFilters());
    }
  };

  const itemFormatters = () => {
    const result = [];
    
    // Add checkbox formatter if user has update rights
    if (rights.includes(RIGHT_BENEFICIARY_UPDATE) && !readOnly) {
      result.push((beneficiary) => (
        <Checkbox
          checked={selectedBeneficiaries.some(b => b.id === beneficiary.id)}
          onChange={() => handleSelectBeneficiary(beneficiary)}
          disabled={isRowDisabled(null, beneficiary)}
        />
      ));
    }
    
    result.push(
      (beneficiary) => beneficiary.individual.firstName,
      (beneficiary) => beneficiary.individual.lastName,
      (beneficiary) => beneficiary.individual.dob
    );

    const locations = Array.from({ length: LOC_LEVELS }, (_, i) => (beneficiary) => (
      locationAtLevel(beneficiary?.individual?.location, LOC_LEVELS - i - 1)
    ));
    result.push(...locations);

    if (rights.includes(RIGHT_BENEFICIARY_UPDATE)) {
      result.push((beneficiary) => (
        <BeneficiaryStatusPicker
          withLabel={false}
          withNull={false}
          value={beneficiary.status}
          onChange={(status) => handleStatusOnChange(beneficiary, status)}
        />
      ));
    }

    if (status) {
      const yes = formatMessage(intl, 'socialProtection', 'beneficiary.isEligible.true');
      const no = formatMessage(intl, 'socialProtection', 'beneficiary.isEligible.false');
      result.push((beneficiary) => (
        beneficiary.isEligible
          ? <Tooltip title={yes} placement="right"><CheckCircleIcon aria-label={yes} /></Tooltip>
          : <Tooltip title={no} placement="right"><ErrorIcon aria-label={no} /></Tooltip>
      ));
    }

    if (rights.includes(RIGHT_BENEFICIARY_SEARCH)) {
      result.push((beneficiary) => (
        <Tooltip
          title={formatMessage(
            intl,
            'socialProtection',
            'benefitPackage.overviewButtonTooltip',
          )}
        >
          <IconButton onClick={() => openBenefitPackage(beneficiary)}>
            <PreviewIcon />
          </IconButton>
        </Tooltip>
      ));
    }

    return result;
  };

  const isRowDisabled = (_, beneficiary) => (
    updatedBeneficiaries.some((item) => item.id === beneficiary.id));

  const sorts = () => [
    ['individual_FirstName', true],
    ['individual_LastName', true],
    ['individual_Dob', true],
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
    if (errorBeneficiaryExport) {
      setFailedExport(true);
    }
  }, [errorBeneficiaryExport]);

  useEffect(() => {
    if (beneficiaryExport) {
      downloadExport(
        beneficiaryExport,
        `${formatMessage(intl, 'socialProtection', 'export.filename.beneficiaries')}.csv`,
      )();
      clearBeneficiaryExport();
    }

    return setFailedExport(false);
  }, [beneficiaryExport]);

  const beneficiaryFilter = (props) => (
    <BenefitPlanBeneficiariesFilter
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

  const bulkActions = rights.includes(RIGHT_BENEFICIARY_UPDATE) && !readOnly && selectedBeneficiaries.length > 0 ? [
    {
      name: 'bulkUpdateStatus',
      label: formatMessageWithValues(intl, 'socialProtection', 'beneficiary.bulkUpdateStatus', {
        count: selectedBeneficiaries.length,
      }),
      enabled: true,
      onClick: () => setBulkUpdateOpen(true),
    },
  ] : null;

  return (
    !!benefitPlan?.id && (
    <div>
      <Searcher
        module="benefitPlan"
        FilterPane={beneficiaryFilter}
        fetch={fetch}
        items={beneficiaries}
        itemsPageInfo={beneficiariesPageInfo}
        fetchingItems={fetchingBeneficiaries}
        fetchedItems={fetchedBeneficiaries}
        errorItems={errorBeneficiaries}
        tableTitle={formatMessageWithValues(intl, 'socialProtection', 'beneficiaries.searcherResultsTitle', {
          beneficiariesTotalCount,
        })}
        exportable
        exportFetch={downloadBeneficiaries}
        exportFields={[
          'id',
          'individual.first_name',
          'individual.last_name',
          'individual.dob',
          'json_ext', // Unfolded by backend and removed from csv
        ]}
        exportFieldsColumns={{
          id: 'ID',
          individual__first_name: formatMessage(intl, 'socialProtection', 'export.firstName'),
          individual__last_name: formatMessage(intl, 'socialProtection', 'export.lastName'),
          individual__dob: formatMessage(intl, 'socialProtection', 'export.dob'),
        }}
        exportFieldLabel={formatMessage(intl, 'socialProtection', 'export.label')}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultFilters={defaultFilters()}
        cacheFiltersKey="benefitPlanBeneficiaryFilterCache"
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
        actions={bulkActions}
        selectionMessage={
          rights.includes(RIGHT_BENEFICIARY_UPDATE) && !readOnly && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={beneficiaries?.length > 0 && selectedBeneficiaries.length === beneficiaries.length}
                  indeterminate={selectedBeneficiaries.length > 0 && selectedBeneficiaries.length < beneficiaries.length}
                  onChange={handleSelectAll}
                />
              }
              label={formatMessage(intl, 'socialProtection', 'beneficiary.selectAll')}
            />
          )
        }
      />
      
      {/* Bulk Update Dialog */}
      <Dialog open={bulkUpdateOpen} onClose={() => setBulkUpdateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {formatMessageWithValues(intl, 'socialProtection', 'beneficiary.bulkUpdateDialog.title', {
            count: selectedBeneficiaries.length,
          })}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <FormLabel>{formatMessage(intl, 'socialProtection', 'beneficiary.status')}</FormLabel>
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
            label={formatMessage(intl, 'socialProtection', 'beneficiary.bulkUpdateDialog.reason')}
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
            {formatMessage(intl, 'socialProtection', 'beneficiary.bulkUpdateDialog.submit')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Export Error Dialog */}
      {failedExport && (
        <Dialog open={failedExport} fullWidth maxWidth="sm">
          <DialogTitle>{errorBeneficiaryExport?.message}</DialogTitle>
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
  fetchingBeneficiaries: state.socialProtection.fetchingBeneficiaries,
  fetchedBeneficiaries: state.socialProtection.fetchedBeneficiaries,
  errorBeneficiaries: state.socialProtection.errorBeneficiaries,
  beneficiaries: state.socialProtection.beneficiaries,
  beneficiariesPageInfo: state.socialProtection.beneficiariesPageInfo,
  beneficiariesTotalCount: state.socialProtection.beneficiariesTotalCount,
  beneficiaryExport: state.socialProtection.beneficiaryExport,
  errorBeneficiaryExport: state.socialProtection.errorBeneficiaryExport,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchBeneficiaries,
  downloadBeneficiaries,
  clearBeneficiaryExport,
  updateBeneficiary,
  bulkUpdateBeneficiaryStatus,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(BenefitPlanBeneficiariesSearcherWithBulkUpdate));