import React, { useState } from 'react';
import { injectIntl } from 'react-intl';
import {
  formatMessage,
  formatMessageWithValues,
  Searcher,
  CLEARED_STATE_FILTER,
  useModulesManager,
  useHistory,
} from '@openimis/fe-core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PreviewIcon from '@material-ui/icons/ListAlt';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutline';
import { IconButton, Tooltip } from '@material-ui/core';
import { fetchBeneficiaries } from '../actions';
import {
  DEFAULT_PAGE_SIZE,
  RIGHT_BENEFICIARY_SEARCH,
  ROWS_PER_PAGE_OPTIONS,
} from '../constants';
import {
  applyNumberCircle,
  LOC_LEVELS,
  locationFormatter,
} from '../util/searcher-utils';

function ProjectBeneficiariesSearcher({
  rights,
  intl,
  project,
  fetchBeneficiaries,
  fetchingBeneficiaries,
  fetchedBeneficiaries,
  errorBeneficiaries,
  beneficiaries,
  beneficiariesPageInfo,
  beneficiariesTotalCount,
}) {
  const modulesManager = useModulesManager();
  const history = useHistory();

  const fetch = (params) => fetchBeneficiaries(modulesManager, params);

  const headers = () => [
    'socialProtection.beneficiary.firstName',
    'socialProtection.beneficiary.lastName',
    'socialProtection.beneficiary.dob',
    ...Array.from({ length: LOC_LEVELS }, (_, i) => `location.locationType.${i}`),
    'socialProtection.beneficiary.status',
    '',
  ];

  const openBenefitPackage = (beneficiary) => history.push(`${project?.id}/`
    + `${modulesManager.getRef('socialProtection.route.benefitPackage')}`
    + `/individual/${beneficiary?.id}`);

  const itemFormatters = () => [
    (beneficiary) => beneficiary.individual.firstName,
    (beneficiary) => beneficiary.individual.lastName,
    (beneficiary) => beneficiary.individual.dob,
    ...Array.from(
      { length: LOC_LEVELS },
      (_, i) => (beneficiary) => locationFormatter(beneficiary?.individual?.location)[i],
    ),
    (beneficiary) => (
      beneficiary.isEligible
        ? <Tooltip title={formatMessage(intl, 'socialProtection', 'beneficiary.isEligible.true')} placement="right"><CheckCircleIcon /></Tooltip>
        : <Tooltip title={formatMessage(intl, 'socialProtection', 'beneficiary.isEligible.false')} placement="right"><ErrorIcon /></Tooltip>
    ),
    (beneficiary) => (
      rights.includes(RIGHT_BENEFICIARY_SEARCH) && (
        <Tooltip title={formatMessage(intl, 'socialProtection', 'benefitPackage.overviewButtonTooltip')}>
          <IconButton onClick={() => openBenefitPackage(beneficiary)}>
            <PreviewIcon />
          </IconButton>
        </Tooltip>
      )
    ),
  ];

  const sorts = () => [
    ['individual_FirstName', true],
    ['individual_LastName', true],
    ['individual_Dob', true],
    ['status', false],
  ];

  const defaultFilters = () => ({
    project_Id: {
      value: project?.id,
      filter: `project_Id: "${project?.id}"`,
    },
    isDeleted: {
      value: false,
      filter: 'isDeleted: false',
    },
  });

  const [appliedCustomFilters, setAppliedCustomFilters] = useState([CLEARED_STATE_FILTER]);
  const [appliedFiltersRowStructure, setAppliedFiltersRowStructure] = useState([CLEARED_STATE_FILTER]);

  const additionalParams = project ? { project: `${project.id}` } : null;

  return (
    !!project?.id && (
      <Searcher
        module="benefitPlan"
        fetch={fetch}
        items={beneficiaries}
        itemsPageInfo={beneficiariesPageInfo}
        fetchingItems={fetchingBeneficiaries}
        fetchedItems={fetchedBeneficiaries}
        errorItems={errorBeneficiaries}
        tableTitle={formatMessageWithValues(intl, 'socialProtection', 'beneficiaries.searcherResultsTitle', {
          beneficiariesTotalCount,
        })}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultFilters={defaultFilters()}
        cacheFiltersKey="projectBeneficiaryFilterCache"
        cachePerTab
        cacheTabName={`${project?.id}`}
        isCustomFiltering
        objectForCustomFiltering={project}
        moduleName="individual"
        objectType="Individual"
        additionalCustomFilterParams={additionalParams}
        appliedCustomFilters={appliedCustomFilters}
        setAppliedCustomFilters={setAppliedCustomFilters}
        appliedFiltersRowStructure={appliedFiltersRowStructure}
        setAppliedFiltersRowStructure={setAppliedFiltersRowStructure}
        applyNumberCircle={applyNumberCircle}
      />
    )
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  fetchingBeneficiaries: state.socialProtection.fetchingBeneficiaries,
  fetchedBeneficiaries: state.socialProtection.fetchedBeneficiaries,
  errorBeneficiaries: state.socialProtection.errorBeneficiaries,
  beneficiaries: state.socialProtection.beneficiaries,
  beneficiariesPageInfo: state.socialProtection.beneficiariesPageInfo,
  beneficiariesTotalCount: state.socialProtection.beneficiariesTotalCount,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchBeneficiaries,
}, dispatch);

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ProjectBeneficiariesSearcher));
