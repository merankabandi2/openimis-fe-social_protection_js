/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Assessment, BarChart, AttachMoney, Dashboard } from '@material-ui/icons';
import { formatMessage, MainMenuContribution, withModulesManager } from '@openimis/fe-core';
import {
  RIGHT_BENEFIT_PLAN_SEARCH,
  ME_MAIN_MENU_CONTRIBUTION_KEY,
  MONETARY_TRANSFERS_ROUTE,
  RESULT_FRAMEWORK_ROUTE,
  RIGHT_MONETARY_TRANSFER_SEARCH,
} from '../constants';

function MEMainMenu(props) {
  const entries = [
    {
      text: formatMessage(props.intl, 'socialProtection', 'menu.socialProtection.resultFrameWork'),
      icon: <Assessment />,
      route: `/${RESULT_FRAMEWORK_ROUTE}`,
      filter: (rights) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH),
      id: 'socialProtection.me.resultFrameWork',
    },
    {
      text: formatMessage(props.intl, 'socialProtection', 'menu.socialProtection.indicators'),
      icon: <BarChart />,
      route: '/me/indicators',
      filter: (rights) => rights.includes(RIGHT_BENEFIT_PLAN_SEARCH),
      id: 'socialProtection.me.indicators',
    },
    {
      text: formatMessage(props.intl, 'socialProtection', 'menu.socialProtection.monetaryTransfer'),
      icon: <AttachMoney />,
      route: `/${MONETARY_TRANSFERS_ROUTE}`,
      filter: (rights) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH),
      id: 'socialProtection.me.monetaryTransfers',
    },
    {
      text: formatMessage(props.intl, 'socialProtection', 'menu.socialProtection.enhancedResultFramework'),
      icon: <Dashboard />,
      route: '/me/enhanced-results-framework',
      filter: (rights) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH),
      id: 'socialProtection.me.enhancedResultFramework',
    },
  ];
  entries.push(
    ...props.modulesManager
      .getContribs(ME_MAIN_MENU_CONTRIBUTION_KEY)
      .filter((c) => !c.filter || c.filter(props.rights)),
  );

  return (
    <MainMenuContribution
      {...props}
      header={formatMessage(props.intl, 'socialProtection', 'mainMenu.me')}
      entries={entries}
      menuId="MEMainMenu"
    />
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default injectIntl(withModulesManager(connect(mapStateToProps)(MEMainMenu)));
