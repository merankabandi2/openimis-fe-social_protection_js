import React from 'react';

import { Box, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import {
  useUserQuery,
  useModulesManager,
} from '@openimis/fe-core';
import Dashboard from './Dashboard';

const useStyles = makeStyles((theme) => ({
  container: theme.page,
  messageTitle: {
    textAlign: 'center',
    color: 'red',
    fontSize: '16px',
  },
  messageDate: {
    textAlign: 'center',
    fontSize: '16px',
  },
  healthFacilityLongTimeActive: {
    textAlign: 'center',
  },
  healthFacilityMediumTimeActive: {
    textAlign: 'center',
    color: 'gray',
  },
  healthFacilityShortTimeActive: {
    textAlign: 'center',
    color: 'red',
  },
  messageNotice: {
    fontSize: '16px',
  },
}));

function HomePageContainer() {
  const { user } = useUserQuery();
  const classes = useStyles();

  if (!user) {
    return null;
  }

  return (
    <Grid container className={classes.container} spacing={2}>
      <Grid item xs={12}>
        <Box mt={2}>
          <Dashboard />
        </Box>
      </Grid>
    </Grid>
  );
}

export default HomePageContainer;
