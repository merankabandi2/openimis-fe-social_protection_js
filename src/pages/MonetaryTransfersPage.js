import React from 'react';
import { useSelector } from 'react-redux';

import { Fab } from '@material-ui/core';
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
  page: theme.page,
  fab: theme.fab,
}));

function MonetaryTransfersPage() {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const onCreate = () => history.push(
    `/${modulesManager.getRef(MONETARY_TRANSFER_ROUTE)}`,
  );

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('monetaryTransfer.page.title')} />
      <MonetaryTransfertDashboard />
      {rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH)
        && <MonetaryTransferSearcher />}
      {rights.includes(RIGHT_MONETARY_TRANSFER_CREATE)
        && withTooltip(
          <div className={classes.fab}>
            <Fab color="primary" onClick={onCreate}>
              <AddIcon />
            </Fab>
          </div>,
          formatMessage('tooltip.createButton'),
        )}
    </div>
  );
}

export default MonetaryTransfersPage;
