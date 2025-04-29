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
  SECTION_ROUTE,
  RIGHT_SECTION_CREATE,
  RIGHT_SECTION_SEARCH,
} from '../constants';
import SectionSearcher from '../components/indicators/SectionSearcher';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  fab: theme.fab,
}));

function SectionsPage() {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const onCreate = () => history.push(
    `/${modulesManager.getRef(SECTION_ROUTE)}`,
  );

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('section.page.title')} />
      {rights.includes(RIGHT_SECTION_SEARCH)
        && <SectionSearcher />}
      {rights.includes(RIGHT_SECTION_CREATE)
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

export default SectionsPage;
