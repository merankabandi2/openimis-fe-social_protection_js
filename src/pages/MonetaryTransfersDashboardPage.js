import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import {
  Helmet,
  useModulesManager,
  useTranslations,
} from '@openimis/fe-core';
import {
  MODULE_NAME,
} from '../constants';
import TransfertDashboard from '../components/dashboard/TransfertDashboard';

const useStyles = makeStyles((theme) => ({
  page: {
    ...theme.page,
    display: 'flex',
    flexDirection: 'column',
  },
  dashboardContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
}));

function MonetaryTransfersDashboardPage() {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  return (
    <div className={classes.page} data-testid="monetary-transfers-dashboard-page">
      <Helmet title={formatMessage('monetaryTransfer.dashboard.page.title')} />
      
      {/* Dashboard Section */}
      <Box className={classes.dashboardContainer} data-testid="dashboard-container">
        <TransfertDashboard />
      </Box>
    </div>
  );
}

export default MonetaryTransfersDashboardPage;