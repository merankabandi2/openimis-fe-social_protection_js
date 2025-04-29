import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Container,
  Grid,
  makeStyles,
  ThemeProvider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Button,
} from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import { baseApiUrl, apiHeaders, decodeId } from '@openimis/fe-core';
import HomeIcon from '@material-ui/icons/Home';
import Person from '@material-ui/icons/Person';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import ReceiptIcon from '@material-ui/icons/Receipt';
import PlaceIcon from '@material-ui/icons/Place';
import FilterListIcon from '@material-ui/icons/FilterList';
import AssignmentIcon from '@material-ui/icons/Assignment';
import BarChartIcon from '@material-ui/icons/BarChart';
import MapComponent from './MapComponent';
import BoxCard from './BoxCard';
import TicketsPieChart from './TicketsPieChart';
import TransfersChart from './TransfersChart';
import ActivitiesBarChart from './ActivitiesBarChart';

const REQUESTED_WITH = 'webapp';

const buildFilter = (itemName, filters) => {
  const { locationId, benefitPlanId, year } = filters;

  // Helper function to create date range filters for a given year
  const createYearDateRange = (year, field = 'dateValidFrom') => {
    if (!year) return [];
    const startDate = `${year}-01-01T00:00:00.000Z`;
    const endDate = `${year}-12-31T23:59:59.999Z`;
    return [
      `${field}_Lte: "${endDate}"`,
      `${field}_Gte: "${startDate}"`,
    ];
  };

  // Define which filters apply to which items and how they should be formatted
  const filterMap = {
    benefitsSummary: {
      year: (val) => `year: ${val}`,
      locationId: (val) => `parentLocation: "${val}", parentLocationLevel: 0`,
      benefitPlanId: (val) => `benefitPlanUuid: "${decodeId(val)}"`,
    },
    paymentCycle: {
      year: (val) => `year: ${val}`,
      // benefitPlanId: (val) => `payroll: "${decodeId(val)}"`,
    },
    group: {
      locationId: (val) => `parentLocation: "${val}", parentLocationLevel: 0`,
      year: (val) => createYearDateRange(val, 'dateCreated'),
    },
    individual: {
      locationId: (val) => `parentLocation: "${val}", parentLocationLevel: 0`,
      year: (val) => createYearDateRange(val, 'dateCreated'),
    },
    groupBeneficiary: {
      locationId: (val) => `parentLocation: "${val}", parentLocationLevel: 0`,
      benefitPlanId: (val) => `benefitPlan_Id: "${decodeId(val)}"`,
      year: (val) => createYearDateRange(val),
    },
    locationByBenefitPlan: {
      benefitPlanId: (val) => `benefitPlan_Id: "${decodeId(val)}"`,
    },
    ticketsByResolution: {
      locationId: (val) => `parentLocation: "${val}", parentLocationLevel: 0`,
      year: (val) => `year: ${val}`,
      benefitPlanId: (val) => `benefitPlan_Id: "${decodeId(val)}"`,
    },
  };

  // Get the filter config for this item
  const itemFilters = filterMap[itemName];
  if (!itemFilters) return '';

  // Build the filter string
  const filterParts = [];

  // Process year filter (special handling for array results)
  if (itemFilters.year && year) {
    const yearFilter = itemFilters.year(year);
    if (Array.isArray(yearFilter)) {
      filterParts.push(...yearFilter);
    } else {
      filterParts.push(yearFilter);
    }
  }

  if (itemFilters.locationId && locationId) {
    filterParts.push(itemFilters.locationId(locationId));
  }

  if (itemFilters.benefitPlanId && benefitPlanId) {
    filterParts.push(itemFilters.benefitPlanId(benefitPlanId));
  }
  return filterParts.length ? `(${filterParts.join(', ')})` : '';
};

const loadStatsAll = async (filters = {}) => {
  const csrfToken = localStorage.getItem('csrfToken');
  const baseHeaders = apiHeaders();

  const response = await fetch(`${baseApiUrl}/graphql`, {
    method: 'post',
    headers: { ...baseHeaders, 'X-Requested-With': REQUESTED_WITH, 'X-CSRFToken': csrfToken },
    body: JSON.stringify(
      {
        query: `
          {
            benefitsSummaryFiltered ${buildFilter('benefitsSummary', filters)} {
              totalAmountReceived,
              totalAmountDue
            },
            paymentCycleFiltered ${buildFilter('paymentCycle', filters)} {
              totalCount
            },
            groupFiltered ${buildFilter('group', filters)} {
              totalCount
            },
            individualFiltered ${buildFilter('individual', filters)} {
              totalCount
            },
            groupBeneficiaryFiltered ${buildFilter('groupBeneficiary', filters)} {
              totalCount
            },
            ticketsByResolution ${buildFilter('ticketsByResolution', filters)} {
              status,
              count
            },
            locationByBenefitPlan ${buildFilter('locationByBenefitPlan', filters)} {
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
            ${filters.locationId ? '' : `
            locations (type: "D") {
              edges {
                node {
                  id,
                  uuid
                  name,
                  code,
                  type
                }
              }
            }`}
            benefitPlan (isDeleted: false) {
              edges {
                node {
                  id,
                  name,
                  code
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
  filterContainer: {
    padding: theme.spacing(0),
    marginBottom: theme.spacing(1),
    backgroundColor: '#fff',
    boxShadow: '0 1px 20px 0 rgba(0,0,0,.1)',
  },
  filterFormControl: {
    margin: theme.spacing(1),
    minWidth: 100,
  },
  filterTitle: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
  filterIcon: {
    marginRight: theme.spacing(1),
  },
  filterActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  select: {
    '& > div': {
      padding: theme.spacing(2),
    },
  },
}));

// Dashboard component
function Dashboard() {
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [benefitPlans, setBenefitPlans] = useState([]);
  const [filters, setFilters] = useState({
    locationId: '',
    benefitPlanId: '',
    year: '',
  });
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    loadFilteredData();
  }, [filters]);

  const loadFilteredData = () => {
    setIsLoading(true);
    loadStatsAll(filters)
      .then((data) => {
        setStats({ ...data });
        // Set location and benefit plan options if available
        if (data.locations && !locations.length) {
          setLocations(data.locations.edges.map(edge => edge.node)
            .filter(node => node.type === 'R' || node.type === 'D'));
        }
        if (data.benefitPlan && !benefitPlans.length) {
          setBenefitPlans(data.benefitPlan.edges.map(edge => edge.node));
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load stats', error);
        setIsLoading(false);
      });
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    loadFilteredData();
  };

  const handleResetFilters = () => {
    setFilters({
      locationId: '',
      benefitPlanId: '',
      year: '',
    });
    // Load with reset filters
    setTimeout(loadFilteredData, 0);
  };

  const classes = useStyles();

  const getStat = (item, field = 'totalCount') => (
    stats && stats[item] && stats[item][field] ? Number(stats[item][field])?.toLocaleString('fr-FR') : 0
  );

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.wrapper}>
        <Container maxWidth={false} className={classes.contentArea}>
          <div className="main">
            <Paper className={classes.filterContainer}>
              <Grid container spacing={1}>
                <Grid item xs={6} sm={3}>
                  <FormControl variant="outlined" className={classes.filterFormControl} fullWidth>
                    <InputLabel id="location-label">Province</InputLabel>
                    <Select
                      labelId="location-label"
                      name="locationId"
                      value={filters.locationId}
                      onChange={handleFilterChange}
                      label="Localisation"
                    >
                      <MenuItem value="">
                        <em>Toutes</em>
                      </MenuItem>
                      {locations.map(loc => (
                        <MenuItem key={loc.uuid} value={loc.uuid}>{loc.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControl variant="outlined" className={classes.filterFormControl} fullWidth>
                    <InputLabel id="benefit-plan-label">Intervention</InputLabel>
                    <Select
                      labelId="benefit-plan-label"
                      name="benefitPlanId"
                      value={filters.benefitPlanId}
                      onChange={handleFilterChange}
                      label="Plan de bénéfice"
                    >
                      <MenuItem value="">
                        <em>Tous</em>
                      </MenuItem>
                      {benefitPlans.map(plan => (
                        <MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2} sm={1}>
                  <FormControl variant="outlined" className={classes.filterFormControl} fullWidth>
                    <InputLabel id="year-label">Année</InputLabel>
                    <Select
                      labelId="year-label"
                      name="year"
                      value={filters.year}
                      onChange={handleFilterChange}
                      label="Année"
                    >
                      <MenuItem value="">
                        <em>Tous</em>
                      </MenuItem>
                      {years.map(year => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <div className={classes.filterActions}>
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      onClick={handleResetFilters}
                      style={{ marginRight: 4 }}
                    >
                      Effacer
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleApplyFilters}
                    >
                      Filtrer
                    </Button>
                  </div>
                </Grid>
              </Grid>
            </Paper>
            <Grid container spacing={2}>
              {/* Sparkboxes Row */}
              <Grid item xs={12} md={4}>
                <BoxCard
                  label="Bénéficiaires"
                  value={getStat('groupBeneficiaryFiltered')}
                  className={classes.box}
                  icon={<Person fontSize="large" />}
                  isLoading={isLoading}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <BoxCard
                  label="Paiements"
                  value={getStat('paymentCycleFiltered')}
                  className={classes.box}
                  icon={<ReceiptIcon fontSize="large" />}
                  isLoading={isLoading}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <BoxCard
                  label="Montants"
                  value={`${getStat('benefitsSummaryFiltered', 'totalAmountDue')} BIF`}
                  className={classes.box}
                  valueVariant="h5"
                  icon={<AttachMoneyIcon fontSize="large" />}
                  isLoading={isLoading}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <MapComponent className={classes.box} isLoading={isLoading} />
            </Grid>
            <Grid container spacing={2} style={{ marginTop: '16px' }}>
              <Grid item xs={12} md={4}>
                <Paper className={classes.box}>
                  <Typography variant="h6" gutterBottom style={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon style={{ marginRight: '8px' }} />
                    Plaintes par statut
                  </Typography>
                  <TicketsPieChart
                    data={stats?.ticketsByResolution || []}
                    isLoading={isLoading}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <TransfersChart filters={filters} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper className={classes.box}>
                  <Typography variant="h6" gutterBottom style={{ display: 'flex', alignItems: 'center' }}>
                    <BarChartIcon style={{ marginRight: '8px' }} />
                    Activités
                  </Typography>
                  <ActivitiesBarChart
                    filters={filters}
                    isLoading={isLoading}
                  />
                </Paper>
              </Grid>
            </Grid>
            <Grid container spacing={2} style={{ marginTop: '16px' }}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <BoxCard
                      label="Individus"
                      value={getStat('individualFiltered')}
                      className={classes.box}
                      icon={<PeopleAltIcon fontSize="large" />}
                      isLoading={isLoading}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <BoxCard
                      label="Ménages"
                      value={getStat('groupFiltered')}
                      className={classes.box}
                      icon={<HomeIcon fontSize="large" />}
                      isLoading={isLoading}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <BoxCard
                      label="Provinces"
                      value={getStat('locationByBenefitPlan')}
                      className={classes.box}
                      icon={<PlaceIcon fontSize="large" />}
                      isLoading={isLoading}
                    />
                  </Grid>
                </Grid>
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

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
