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
import AddIcon from '@material-ui/icons/Add';
import PreviewIcon from '@material-ui/icons/ListAlt';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutline';
import { IconButton, Tooltip } from '@material-ui/core';
import { fetchProjectBeneficiaries } from '../actions';
import {
  MODULE_NAME,
  DEFAULT_PAGE_SIZE,
  RIGHT_BENEFICIARY_SEARCH,
  ROWS_PER_PAGE_OPTIONS,
  RIGHT_PROJECT_UPDATE,
} from '../constants';
import {
  applyNumberCircle,
  LOC_LEVELS,
  locationFormatter,
} from '../util/searcher-utils';
import ProjectEnrollmentDialog from '../dialogs/ProjectEnrollmentDialog';

function ProjectBeneficiariesSearcher({
  rights,
  intl,
  project,
  fetchProjectBeneficiaries,
  fetchingBeneficiaries,
  fetchedBeneficiaries,
  errorBeneficiaries,
  beneficiaries,
  beneficiariesPageInfo,
  beneficiariesTotalCount,
}) {
  const modulesManager = useModulesManager();
  const history = useHistory();

  const fetch = (params) => fetchProjectBeneficiaries(modulesManager, params);

  const headers = () => [
    'socialProtection.beneficiary.firstName',
    'socialProtection.beneficiary.lastName',
    'socialProtection.beneficiary.dob',
    ...Array.from({ length: LOC_LEVELS }, (_, i) => `location.locationType.${i}`),
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

  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);

  const additionalParams = project ? { project: `${project.id}` } : null;

  const searcherActions = [
    {
      label: formatMessage(intl, MODULE_NAME, 'projectBeneficiaries.enroll'),
      icon: <AddIcon />,
      authorized: rights.includes(RIGHT_PROJECT_UPDATE),
      onClick: () => setEnrollmentDialogOpen(true),
    },
  ];

  return (
    !!project?.id && (
      <>
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
          searcherActions={searcherActions}
          enableActionButtons
          searcherActionsPosition="header-right"
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

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ProjectBeneficiariesSearcher));
