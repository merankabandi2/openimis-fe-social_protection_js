import React from 'react';
import { useSelector } from 'react-redux';
import { Fab, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import AddIcon from '@material-ui/icons/Add';

import {
  Helmet,
  useModulesManager,
  useTranslations,
  useHistory,
  withTooltip,
} from '@openimis/fe-core';
import {
  MODULE_NAME,
  MONETARY_TRANSFER_ROUTE,
  RIGHT_MONETARY_TRANSFER_CREATE,
  RIGHT_MONETARY_TRANSFER_SEARCH,
} from '../constants';
import MonetaryTransferSearcher from '../components/me/MonetaryTransferSearcher';
import MonetaryTransfertDashboard from '../components/dashboard/MonetaryTransfertDashboard';

const useStyles = makeStyles((theme) => ({
  page: {
    ...theme.page,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  dashboardSection: {
    marginBottom: theme.spacing(3),
  },
  searcherSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  fabContainer: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: theme.zIndex.fab,
  },
  noAccessMessage: {
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

function MonetaryTransfersPage() {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const rights = useSelector((store) => store.core.user?.i_user?.rights ?? []);
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const canSearch = rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH);
  const canCreate = rights.includes(RIGHT_MONETARY_TRANSFER_CREATE);

  const handleCreate = () => {
    history.push(`/${modulesManager.getRef(MONETARY_TRANSFER_ROUTE)}`);
  };

  return (
    <div className={classes.page} data-testid="monetary-transfers-page">
      <Helmet title={formatMessage('monetaryTransfer.page.title')} />
      
      {/* Dashboard Section */}
      <Box className={classes.dashboardSection} data-testid="dashboard-section">
        <MonetaryTransfertDashboard />
      </Box>

      {/* Searcher Section */}
      {canSearch && (
        <Box className={classes.searcherSection} data-testid="searcher-section">
          <MonetaryTransferSearcher />
        </Box>
      )}

      {/* No Access Message */}
      {!canSearch && (
        <Box className={classes.noAccessMessage} data-testid="no-access-message">
          {formatMessage('monetaryTransfer.noSearchRights')}
        </Box>
      )}

      {/* Create Button */}
      {canCreate && (
        <Box className={classes.fabContainer} data-testid="create-button-container">
          {withTooltip(
            <Fab 
              color="primary" 
              onClick={handleCreate}
              data-testid="create-monetary-transfer-button"
              aria-label={formatMessage('tooltip.createButton')}
            >
              <AddIcon />
            </Fab>,
            formatMessage('tooltip.createButton'),
          )}
        </Box>
      )}
    </div>
  );
}

export default MonetaryTransfersPage;
