/* eslint-disable max-len */
import React, { useState } from 'react';
import { Paper, Grid } from '@material-ui/core';
import {
  Contributions,
} from '@openimis/fe-core';
import { makeStyles } from '@material-ui/styles';
import {
  DEVELOPMENT_INDICATORS_LIST_TAB_VALUE,
  ME_RESULT_FRAMEWORK_TABS_PANEL_CONTRIBUTION_KEY,
  ME_RESULT_FRAMEWORK_TABS_LABEL_CONTRIBUTION_KEY,
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

function MEResultFrameworkTab({
  rights, setConfirmedAction, isInTask,
}) {
  const classes = useStyles();

  const [activeTab, setActiveTab] = useState(DEVELOPMENT_INDICATORS_LIST_TAB_VALUE);

  const isSelected = (tab) => tab === activeTab;

  const tabStyle = (tab) => (isSelected(tab) ? classes.selectedTab : classes.unselectedTab);

  const handleChange = (_, tab) => setActiveTab(tab);

  return (
    <Paper className={classes.paper}>
      <Grid container className={`${classes.tableTitle} ${classes.tabs}`}>
        <div style={{ width: '100%' }}>
          <div style={{ float: 'left' }}>
            <Contributions
              contributionKey={ME_RESULT_FRAMEWORK_TABS_LABEL_CONTRIBUTION_KEY}
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
        contributionKey={ME_RESULT_FRAMEWORK_TABS_PANEL_CONTRIBUTION_KEY}
        rights={rights}
        value={activeTab}
        setConfirmedAction={setConfirmedAction}
        isInTask={isInTask}
      />
    </Paper>
  );
}

export default MEResultFrameworkTab;
