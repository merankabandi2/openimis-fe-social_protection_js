import React from 'react';
import { injectIntl } from 'react-intl';
import {
  formatMessageWithValues,
  Searcher,
  withHistory,
  withModulesManager,
  useModulesManager,
} from '@openimis/fe-core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS } from '../constants';
import { fetchBenefitPlanProjects } from '../actions';
import BenefitPlanProjectsFilter from './BenefitPlanProjectsFilter';

function BenefitPlanProjectsSearcher({
  intl,
  fetchBenefitPlanProjects,
  fetchingProjects,
  fetchedProjects,
  errorProjects,
  projects,
  projectsPageInfo,
  projectsTotalCount,
  benefitPlanId,
}) {
  const modulesManager = useModulesManager();
  const fetch = (params) => fetchBenefitPlanProjects(modulesManager, params);

  const headers = () => [
    'project.name',
    'project.status',
    'project.activity',
    // 'project.location',
    'project.targetBeneficiaries',
  ];

  const itemFormatters = () => [
    (project) => project.name,
    (project) => project.status,
    (project) => project.activity?.name ?? '',
    // (project) => project.location?.name ?? '',
    (project) => project.target_beneficiaries,
  ];

  const rowIdentifier = (project) => project.id;

  const sorts = () => [
    ['name', true],
    ['status', true],
    ['activity', true],
    // ['location', true],
    ['target_beneficiaries', true],
  ];

  const defaultFilters = () => ({
    isDeleted: {
      value: false,
      filter: 'isDeleted: false',
    },
    ...(benefitPlanId && {
      benefitPlan_Id: {
        value: benefitPlanId,
        filter: `benefitPlan_Id: "${benefitPlanId}"`,
      },
    }),
  });

  const benefitPlanProjectsFilter = (props) => (
    <BenefitPlanProjectsFilter
      intl={props.intl}
      classes={props.classes}
      filters={props.filters}
      onChangeFilters={props.onChangeFilters}
    />
  );

  return (
    <Searcher
      module="socialProtection"
      FilterPane={benefitPlanProjectsFilter}
      fetch={fetch}
      items={projects}
      itemsPageInfo={projectsPageInfo}
      fetchingItems={fetchingProjects}
      fetchedItems={fetchedProjects}
      errorItems={errorProjects}
      tableTitle={formatMessageWithValues(intl, 'socialProtection', 'projects.searcherResultsTitle', {
        projectsTotalCount,
      })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      defaultOrderBy="-name"
      rowIdentifier={rowIdentifier}
      defaultFilters={defaultFilters()}
    />
  );
}

const mapStateToProps = (state) => ({
  fetchingProjects: state.socialProtection.fetchingProjects,
  fetchedProjects: state.socialProtection.fetchedProjects,
  errorProjects: state.socialProtection.errorProjects,
  projects: state.socialProtection.projects,
  projectsPageInfo: state.socialProtection.projectsPageInfo,
  projectsTotalCount: state.socialProtection.projectsTotalCount,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchBenefitPlanProjects,
}, dispatch);

const ConnectedBenefitPlanProjectsSearcher = withHistory(
  withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(BenefitPlanProjectsSearcher))),
);
export default ConnectedBenefitPlanProjectsSearcher;
