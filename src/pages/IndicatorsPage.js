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
  INDICATOR_ROUTE,
  RIGHT_INDICATOR_CREATE,
  RIGHT_INDICATOR_SEARCH,
} from '../constants';
import IndicatorSearcher from '../components/indicators/IndicatorSearcher';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  fab: theme.fab,
}));

function IndicatorsPage() {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const onCreate = () => history.push(
    `/${modulesManager.getRef(INDICATOR_ROUTE)}`,
  );

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('indicator.page.title')} />
      {rights.includes(RIGHT_INDICATOR_SEARCH)
        && <IndicatorSearcher />}
      {rights.includes(RIGHT_INDICATOR_CREATE)
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

export default IndicatorsPage;
