import React from 'react';
import { Tab } from '@material-ui/core';
import { PublishedComponent, useTranslations } from '@openimis/fe-core';
import {
  BEHAVIOR_CHANGE_PROMOTION_LIST_TAB_VALUE,
  MODULE_NAME,
  RIGHT_BEHAVIOR_CHANGE_PROMOTION_SEARCH,
} from '../../constants';
import BehaviorChangePromotionSearcher from './BehaviorChangePromotionSearcher';

function BehaviorChangePromotionTabLabel({
  onChange, tabStyle, isSelected, modulesManager,
}) {
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(BEHAVIOR_CHANGE_PROMOTION_LIST_TAB_VALUE)}
      selected={isSelected(BEHAVIOR_CHANGE_PROMOTION_LIST_TAB_VALUE)}
      value={BEHAVIOR_CHANGE_PROMOTION_LIST_TAB_VALUE}
      label={formatMessage('behaviorChangePromotionTab.label')}
    />
  );
}

function BehaviorChangePromotionTabPanel({
  value, rights,
}) {
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="socialProtection"
      index={BEHAVIOR_CHANGE_PROMOTION_LIST_TAB_VALUE}
      value={value}
    >
      <BehaviorChangePromotionSearcher
        rights={rights}
      />
    </PublishedComponent>
  );
}

export { BehaviorChangePromotionTabLabel, BehaviorChangePromotionTabPanel };
