import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Container,
  Grid,
  makeStyles,
  ThemeProvider,
} from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import { baseApiUrl, apiHeaders } from '@openimis/fe-core';
import HomeIcon from '@material-ui/icons/Home';
import Person from '@material-ui/icons/Person';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import ReceiptIcon from '@material-ui/icons/Receipt';
import PlaceIcon from '@material-ui/icons/Place';
import MapComponent from './MapComponent';
import BoxCard from './BoxCard';

const loadStatsAll = async () => {
  const response = await fetch(`${baseApiUrl}/graphql`, {
    method: 'post',
    headers: apiHeaders(),
    body: JSON.stringify(
      {
        query: `
          {
            benefitsSummary {
              totalAmountReceived,
              totalAmountDue
            },
            paymentCycle {
              totalCount
            },
            group {
              totalCount
            },
            individual {
              totalCount
            },
            groupBeneficiary {
              totalCount
            },
            locationByBenefitPlan(benefitPlan_Id: "452721c3-cc8a-49d9-81f0-a7c7a1a3bf82") {
              totalCount,
              edges {
                node {
                  id,
                  code,
                  name,
                  countSelected,
                  countSuspended,
                  countActive
                }
              }
            }
          }
        `,
      },
    ),
  });
  if (!response.ok) {
    throw response;
  } else {
    const { data } = await response.json();
    return data;
  }
};

// Create a custom theme
const theme = createTheme({
  typography: {
    fontFamily: '"Titillium Web", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
  palette: {
    primary: {
      main: '#5a8dee',
    },
  },
});

// Custom styles
const useStyles = makeStyles((theme) => ({
  wrapper: {
    backgroundColor: '#f9fbfd',
    minHeight: '100vh',
  },
  contentArea: {
    padding: theme.spacing(1),
  },
  box: {
    backgroundColor: '#fff',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 1px 20px 0 rgba(0,0,0,.1)',
    height: '100%',
  },
  box1: {
    color: '#8799a2',
    '& .apexcharts-series path': {
      stroke: '#5a8dee !important',
    },
  },
  box2: {
    color: '#8799a2',
    '& .apexcharts-series path': {
      stroke: '#ff8f00 !important',
    },
  },
  box3: {
    color: '#8799a2',
    '& .apexcharts-series path': {
      stroke: '#00d0bd !important',
    },
  },
  chartContainer: {
    height: '350px',
  },
}));

// Dashboard component
function BalkanDashboard() {
  const [stats, setStats] = useState({});
  useEffect(() => {
    loadStatsAll().then(
      (data) => setStats({ ...data }),
      (error) => console.error('Failed to load stats', error),
    );
  }, [setStats]);

  const classes = useStyles();

  const getStat = (item, field = 'totalCount') => (
    stats && stats[item] && stats[item][field] ? Number(stats[item][field])?.toLocaleString('fr-FR') : 0
  );

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.wrapper}>
        <Container maxWidth={false} className={classes.contentArea}>
          <div className="main">
            <Grid container spacing={2}>
              {/* Sparkboxes Row */}
              <Grid item xs={12} md={4}>
                <BoxCard
                  label="Bénéficiaires"
                  value={getStat('groupBeneficiary')}
                  className={classes.box}
                  icon={<Person fontSize="large" />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <BoxCard
                  label="Paiements"
                  value={getStat('paymentCycle')}
                  className={classes.box}
                  icon={<ReceiptIcon fontSize="large" />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <BoxCard
                  label="Montants"
                  value={`${getStat('benefitsSummary', 'totalAmountDue')} BIF`}
                  className={classes.box}
                  valueVariant="h5"
                  icon={<AttachMoneyIcon fontSize="large" />}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <MapComponent className={classes.box} />
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <BoxCard
                  label="Individus"
                  value={getStat('individual')}
                  className={classes.box}
                  icon={<PeopleAltIcon fontSize="large" />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <BoxCard
                  label="Ménages"
                  value={getStat('group')}
                  className={classes.box}
                  icon={<HomeIcon fontSize="large" />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <BoxCard
                  label="Provinces"
                  value={getStat('locationByBenefitPlan')}
                  className={classes.box}
                  icon={<PlaceIcon fontSize="large" />}
                />
              </Grid>
            </Grid>
          </div>
        </Container>
      </div>
    </ThemeProvider>
  );
}

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(BalkanDashboard);
