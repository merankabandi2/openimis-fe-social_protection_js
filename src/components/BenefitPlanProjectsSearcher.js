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
import {
  LOC_LEVELS,
  locationAtLevel,
} from '../util/searcher-utils';

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

  const headers = () => {
    const baseHeaders = [
      'project.name',
      'project.status',
      'project.activity',
      'project.targetBeneficiaries',
    ];
    baseHeaders.push(...Array.from({ length: LOC_LEVELS }, (_, i) => `location.locationType.${i}`));

    return baseHeaders;
  };

  const itemFormatters = () => {
    const results = [
      (project) => project.name,
      (project) => project.status,
      (project) => project.activity?.name ?? '',
      (project) => project.target_beneficiaries,
    ];
    const locations = Array.from({ length: LOC_LEVELS }, (_, i) => (project) => (
      locationAtLevel(project?.location, LOC_LEVELS - i - 1)
    ));
    results.push(...locations);
    return results;
  };

  const rowIdentifier = (project) => project.id;

  const sorts = () => [
    ['name', true],
    ['status', true],
    ['activity', true],
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
