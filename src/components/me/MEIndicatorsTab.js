/* eslint-disable max-len */
import React, { useState } from 'react';
import { Paper, Grid } from '@material-ui/core';
import {
  Contributions,
  useModulesManager,
  useTranslations,
} from '@openimis/fe-core';
import { makeStyles } from '@material-ui/styles';
import {
  MICRO_PROJECT_LIST_TAB_VALUE,
  ME_INDICATORS_TABS_LABEL_CONTRIBUTION_KEY,
  ME_INDICATORS_TABS_PANEL_CONTRIBUTION_KEY,
  MODULE_NAME,
} from '../../constants';

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  tabs: {
    display: 'flex',
    alignItems: 'center',
  },
  selectedTab: {
    borderBottom: '4px solid white',
  },
  unselectedTab: {
    borderBottom: '4px solid transparent',
  },
  button: {
    marginLeft: 'auto',
    padding: theme.spacing(1),
    fontSize: '0.875rem',
    textTransform: 'none',
  },
}));

function MEIndicatorsTab({
  rights, setConfirmedAction, isInTask,
}) {
  const classes = useStyles();

  const [activeTab, setActiveTab] = useState(MICRO_PROJECT_LIST_TAB_VALUE);

  const isSelected = (tab) => tab === activeTab;

  const tabStyle = (tab) => (isSelected(tab) ? classes.selectedTab : classes.unselectedTab);

  const handleChange = (_, tab) => setActiveTab(tab);

  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  return (
    <Paper className={classes.paper}>
      <Grid container className={`${classes.tableTitle} ${classes.tabs}`}>
        <div style={{ width: '100%' }}>
          <div style={{ float: 'left' }}>
            <Contributions
              contributionKey={ME_INDICATORS_TABS_LABEL_CONTRIBUTION_KEY}
              rights={rights}
              value={activeTab}
              onChange={handleChange}
              isSelected={isSelected}
              tabStyle={tabStyle}
              isInTask={isInTask}
            />
          </div>
        </div>
      </Grid>
      <Contributions
        contributionKey={ME_INDICATORS_TABS_PANEL_CONTRIBUTION_KEY}
        rights={rights}
        value={activeTab}
        setConfirmedAction={setConfirmedAction}
        isInTask={isInTask}
      />
    </Paper>
  );
}

export default MEIndicatorsTab;
