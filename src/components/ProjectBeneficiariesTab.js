import React from 'react';
import { Tab } from '@material-ui/core';
import { formatMessage, PublishedComponent } from '@openimis/fe-core';
import { PROJECT_BENEFICIARIES_TAB_VALUE, BENEFIT_PLAN_TYPE } from '../constants';
import ProjectBeneficiariesSearcher from './ProjectBeneficiariesSearcher';
// import ProjectGroupBeneficiariesSearcher from './ProjectGroupBeneficiariesSearcher';
// TODO (Wei): handle group beneficiaries

function ProjectBeneficiariesTabLabel({
  intl, onChange, tabStyle, isSelected,
}) {
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(PROJECT_BENEFICIARIES_TAB_VALUE)}
      selected={isSelected(PROJECT_BENEFICIARIES_TAB_VALUE)}
      value={PROJECT_BENEFICIARIES_TAB_VALUE}
      label={formatMessage(intl, 'socialProtection', 'projectBeneficiaries.label')}
    />
  );
}

function ProjectBeneficiariesTabPanel({
  value, project,
}) {
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="socialProtection"
      index={PROJECT_BENEFICIARIES_TAB_VALUE}
      value={value}
    >
      {project.benefitPlan?.type === BENEFIT_PLAN_TYPE.INDIVIDUAL ? (
        <ProjectBeneficiariesSearcher project={project} />
      ) : (
        ''
        // <ProjectGroupBeneficiariesSearcher project={project} />
      )}
    </PublishedComponent>
  );
}

export { ProjectBeneficiariesTabLabel, ProjectBeneficiariesTabPanel };
