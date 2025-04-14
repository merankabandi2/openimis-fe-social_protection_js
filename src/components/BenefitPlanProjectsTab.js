import React from 'react';
import { Tab } from '@material-ui/core';
import { formatMessage, PublishedComponent } from '@openimis/fe-core';
import { BENEFIT_PLAN_PROJECTS_TAB_VALUE } from '../constants';

function BenefitPlanProjectsTabLabel({
  intl, onChange, tabStyle, isSelected,
}) {
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(BENEFIT_PLAN_PROJECTS_TAB_VALUE)}
      selected={isSelected(BENEFIT_PLAN_PROJECTS_TAB_VALUE)}
      value={BENEFIT_PLAN_PROJECTS_TAB_VALUE}
      label={formatMessage(intl, 'socialProtection', 'projects.label')}
    />
  );
}

function BenefitPlanProjectsTabPanel({
  value, benefitPlan,
}) {
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="socialProtection"
      index={BENEFIT_PLAN_PROJECTS_TAB_VALUE}
      value={value}
    >
      <PublishedComponent
        pubRef="socialProtection.BenefitPlanProjectsSearcher"
        benefitPlanId={benefitPlan?.id}
      />
    </PublishedComponent>
  );
}

export { BenefitPlanProjectsTabLabel, BenefitPlanProjectsTabPanel };
