import React from 'react';
import { Tab } from '@material-ui/core';
import { formatMessage, PublishedComponent } from '@openimis/fe-core';
import { BENEFIT_PLAN_PROVINCES_TAB_VALUE } from '../constants';
import BenefitPlanProvincesPanel from './BenefitPlanProvincesPanel';

function BenefitPlanProvincesTabLabel({
  intl, onChange, tabStyle, isSelected,
}) {
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(BENEFIT_PLAN_PROVINCES_TAB_VALUE)}
      selected={isSelected(BENEFIT_PLAN_PROVINCES_TAB_VALUE)}
      value={BENEFIT_PLAN_PROVINCES_TAB_VALUE}
      label={formatMessage(intl, 'socialProtection', 'benefitPlanProvinces.label')}
    />
  );
}

function BenefitPlanProvincesTabPanel({
  value, benefitPlan, rights,
}) {
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="socialProtection"
      index={BENEFIT_PLAN_PROVINCES_TAB_VALUE}
      value={value}
    >
      <BenefitPlanProvincesPanel benefitPlan={benefitPlan} rights={rights} />
    </PublishedComponent>
  );
}

export { BenefitPlanProvincesTabLabel, BenefitPlanProvincesTabPanel };
