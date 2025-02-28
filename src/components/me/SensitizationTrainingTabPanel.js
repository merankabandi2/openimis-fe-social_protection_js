import React from 'react';
import { Tab } from '@material-ui/core';
import { PublishedComponent, useTranslations } from '@openimis/fe-core';
import {
  SENSITIZATION_TRAINING_LIST_TAB_VALUE,
  MODULE_NAME,
} from '../../constants';
import SensitizationTrainingSearcher from './SensitizationTrainingSearcher';

function SensitizationTrainingTabLabel({
  onChange, tabStyle, isSelected, modulesManager,
}) {
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(SENSITIZATION_TRAINING_LIST_TAB_VALUE)}
      selected={isSelected(SENSITIZATION_TRAINING_LIST_TAB_VALUE)}
      value={SENSITIZATION_TRAINING_LIST_TAB_VALUE}
      label={formatMessage('sensitizationTrainingTab.label')}
    />
  );
}

function SensitizationTrainingTabPanel({
  value, rights,
}) {
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="socialProtection"
      index={SENSITIZATION_TRAINING_LIST_TAB_VALUE}
      value={value}
    >
      <SensitizationTrainingSearcher
        rights={rights}
      />
    </PublishedComponent>
  );
}

export { SensitizationTrainingTabLabel, SensitizationTrainingTabPanel };
