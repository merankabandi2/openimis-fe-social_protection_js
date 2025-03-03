import React from "react";
import MapComponent from './MapComponent';

import { Box, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import {
  Contributions,
  useUserQuery,
  ProgressOrError,
  useModulesManager,
  useTranslations,
} from "@openimis/fe-core";
import { useSelector } from "react-redux";

import { DEFAULT, MODULE_NAME, DAYS_HF_STATUS } from "../constants";
import { useFetchData } from "../hooks/useFetchData";
import { getTimeDifferenceInDaysFromToday } from "@openimis/fe-core";

const useStyles = makeStyles((theme) => ({
  container: theme.page,
  messageTitle: {
    textAlign: "center",
    color: "red",
    fontSize: "16px"
  },
  messageDate: {
    textAlign: "center",
    fontSize: "16px",
  },
  healthFacilityLongTimeActive: {
    textAlign: "center",
  },
  healthFacilityMediumTimeActive: {
    textAlign: "center",
    color: "gray",
  },
  healthFacilityShortTimeActive: {
    textAlign: "center",
    color: "red",
  },
  messageNotice: {
    fontSize: "16px"
  }
}));

const HomePageContainer = () => {
  const modulesManager = useModulesManager();
  const userHealthFacility = useSelector(
    (state) => state?.loc?.userHealthFacilityFullPath
  );
  const { formatMessage, formatMessageWithValues, formatDateFromISO } =
    useTranslations(MODULE_NAME, modulesManager);
  const showHomeMessage = modulesManager.getConf(
    "fe-home",
    "HomePageContainer.showHomeMessage",
    DEFAULT.SHOW_HOME_MESSAGE
  );
  const homeMessageURL = modulesManager.getConf(
    "fe-home",
    "HomePageContainer.homeMessageURL",
    DEFAULT.HOME_MESSAGE_URL
  );
  const showHealthFacilityMessage = modulesManager.getConf(
    "fe-home",
    "HomePageContainer.showHealthFacilityMessage",
    DEFAULT.SHOW_HEALTH_FACILITY_MESSAGE
  );

  const { user } = useUserQuery();
  const classes = useStyles();
  const {
    data: messageData,
    loading: messageLoading,
    error: messageError,
  } = showHomeMessage ? useFetchData(homeMessageURL) : {};

  if (!user) {
    return null;
  }

  const dateToCheck = new Date(userHealthFacility?.contractEndDate ?? null);
  const timeDelta = getTimeDifferenceInDaysFromToday(dateToCheck);
  const getHealthFacilityStatus = (timeDelta) => {
    if (timeDelta > DAYS_HF_STATUS.DAYS_LONG_TIME_ACTIVE) {
      return classes.healthFacilityLongTimeActive;
    } else if (timeDelta > DAYS_HF_STATUS.DAYS_MEDIUM_TIME_ACTIVE) {
      return classes.healthFacilityMediumTimeActive;
    } else {
      return classes.healthFacilityShortTimeActive;
    }
  };

  return (
    <Grid container className={classes.container} spacing={2}>
      <Grid item xs={12}>
        <Box mt={2}>
          <MapComponent />
        </Box>
      </Grid>
      {showHealthFacilityMessage && (
        <Grid item xs={12}>
          <h2 className={getHealthFacilityStatus(timeDelta)}>
            {userHealthFacility
              ? formatMessageWithValues(
                  "HomePageContainer.healthFacilityStatus",
                  {
                    date: `${formatDateFromISO(dateToCheck)}`,
                    days: `${timeDelta}`,
                  }
                )
              : formatMessage("HomePageContainer.noHealthFacilityAssigned")}
          </h2>
        </Grid>
      )}
      {showHomeMessage && (
        <Grid item xs={12}>
          <ProgressOrError progress={messageLoading} error={messageError} />
          <h3 className={classes.messageTitle}>
            {formatMessage("HomePageContainer.messageTitle")}
          </h3>
          <p className={classes.messageDate}> {messageData?.date} </p>
          <div
            className={classes.messageNotice}
            dangerouslySetInnerHTML={{ __html: messageData?.notice }}
          />
        </Grid>
      )}
      <Contributions contributionKey="home.HomePage.Blocks" user={user} />
    </Grid>
  );
};

export default HomePageContainer;
