import React from 'react';
import { Tab } from '@material-ui/core';
import { PublishedComponent, useTranslations } from '@openimis/fe-core';
import {
  MICRO_PROJECT_LIST_TAB_VALUE,
  MODULE_NAME,
  RIGHT_MICRO_PROJECT_SEARCH,
} from '../../constants';
import MicroProjectSearcher from './MicroProjectSearcher';

function MicroProjectTabLabel({
  onChange, tabStyle, isSelected, modulesManager,
}) {
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(MICRO_PROJECT_LIST_TAB_VALUE)}
      selected={isSelected(MICRO_PROJECT_LIST_TAB_VALUE)}
      value={MICRO_PROJECT_LIST_TAB_VALUE}
      label={formatMessage('microProjectTab.label')}
    />
  );
}

function MicroProjectTabPanel({
  value, rights,
}) {
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="socialProtection"
      index={MICRO_PROJECT_LIST_TAB_VALUE}
      value={value}
    >
      <MicroProjectSearcher
        rights={rights}
      />
    </PublishedComponent>
  );
}

export { MicroProjectTabLabel, MicroProjectTabPanel };
