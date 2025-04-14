import React, { useState } from 'react';
import { Grid, Tab } from '@material-ui/core';
import {
  Contributions,
  formatMessage,
} from '@openimis/fe-core';
import {
  BENEFIT_PLAN_BENEFICIARIES_TAB_WRAPPER_VALUE,
  BENEFIT_PLAN_BENEFICIARIES_LIST_TAB_VALUE,
  BENEFIT_PLAN_BENEFICIARY_TABS_LABEL_CONTRIBUTION_KEY,
  BENEFIT_PLAN_BENEFICIARY_TABS_PANEL_CONTRIBUTION_KEY,
} from '../constants';

function BenefitPlanBeneficiariesTabLabel({
  intl, onChange, tabStyle, isSelected,
}) {
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(BENEFIT_PLAN_BENEFICIARIES_TAB_WRAPPER_VALUE)}
      selected={isSelected(BENEFIT_PLAN_BENEFICIARIES_TAB_WRAPPER_VALUE)}
      value={BENEFIT_PLAN_BENEFICIARIES_TAB_WRAPPER_VALUE}
      label={formatMessage(intl, 'socialProtection', 'benefitPlan.beneficiaries.tabGroup.label')}
    />
  );
}

function BenefitPlanBeneficiariesTabPanel({
  intl, rights, benefitPlan, setConfirmedAction, value, classes,
}) {
  if (value !== BENEFIT_PLAN_BENEFICIARIES_TAB_WRAPPER_VALUE) {
    return null;
  }
  const [activeTab, setActiveTab] = useState(BENEFIT_PLAN_BENEFICIARIES_LIST_TAB_VALUE);

  const isSelected = (tab) => tab === activeTab;
  const tabStyle = (tab) => (isSelected(tab) ? classes.selectedTab : classes.unselectedTab);

  const handleChange = (_, tab) => {
    setActiveTab(tab);
  };

  return (
    <Grid container>
      <Grid item xs={12} style={{ paddingLeft: '10px' }}>
        <Contributions
          contributionKey={BENEFIT_PLAN_BENEFICIARY_TABS_LABEL_CONTRIBUTION_KEY}
          intl={intl}
          rights={rights}
          value={activeTab}
          onChange={handleChange}
          isSelected={isSelected}
          tabStyle={tabStyle}
        />
      </Grid>
      <Grid item xs={12}>
        <Contributions
          contributionKey={BENEFIT_PLAN_BENEFICIARY_TABS_PANEL_CONTRIBUTION_KEY}
          rights={rights}
          value={activeTab}
          benefitPlan={benefitPlan}
          setConfirmedAction={setConfirmedAction}
        />
      </Grid>
    </Grid>
  );
}

export { BenefitPlanBeneficiariesTabLabel, BenefitPlanBeneficiariesTabPanel };
