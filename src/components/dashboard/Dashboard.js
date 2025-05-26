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
import FaceIcon from '@material-ui/icons/Face';
import AccessibilityIcon from '@material-ui/icons/Accessibility';
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

  // Build gender and minority filters
  const genderFilterParts = [];
  if (filters.locationId) {
    genderFilterParts.push(`parentLocation: "${filters.locationId}", parentLocationLevel: 0`);
  }
  if (filters.year) {
    const startDate = `${filters.year}-01-01T00:00:00.000Z`;
    const endDate = `${filters.year}-12-31T23:59:59.999Z`;
    genderFilterParts.push(`dateCreated_Lte: "${endDate}"`);
    genderFilterParts.push(`dateCreated_Gte: "${startDate}"`);
  }
  const genderFilter = genderFilterParts.length ? `(${genderFilterParts.join(', ')})` : '';

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
            individualMale ${genderFilter} {
              totalCount
            },
            individualFemale ${genderFilter} {
              totalCount
            },
            minorityHouseholds ${genderFilter} {
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
    backgroundColor: '#f5f7fa',
    minHeight: '100vh',
  },
  contentArea: {
    padding: theme.spacing(2),
  },
  box: {
    backgroundColor: '#fff',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    boxShadow: '0 0 20px rgba(0,0,0,.06)',
    height: '100%',
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: '0 5px 25px rgba(0,0,0,.1)',
    },
  },
  statsBox: {
    backgroundColor: '#fff',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    boxShadow: '0 0 20px rgba(0,0,0,.06)',
    height: '100%',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      boxShadow: '0 5px 25px rgba(0,0,0,.1)',
      transform: 'translateY(-2px)',
    },
  },
  chartContainer: {
    height: '280px',
  },
  mapContainer: {
    height: '450px',
    position: 'relative',
  },
  filterContainer: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: '#fff',
    borderRadius: theme.spacing(1),
    boxShadow: '0 0 20px rgba(0,0,0,.06)',
  },
  filterFormControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  filterTitle: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
  filterIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  filterActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '100%',
    paddingRight: theme.spacing(1),
  },
  select: {
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(1),
    },
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
    fontWeight: 600,
    color: theme.palette.text.primary,
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

  // Calculate gender percentages
  const maleCount = stats?.individualMale?.totalCount || 0;
  const femaleCount = stats?.individualFemale?.totalCount || 0;
  const totalIndividuals = maleCount + femaleCount || stats?.individualFiltered?.totalCount || 0;

  // If gender data is not available, show N/A
  const hasGenderData = (maleCount > 0 || femaleCount > 0) && stats?.individualMale !== undefined;
  const malePercentage = hasGenderData && totalIndividuals > 0 ? Math.round((maleCount / totalIndividuals) * 100) : 0;
  const femalePercentage = hasGenderData && totalIndividuals > 0 ? Math.round((femaleCount / totalIndividuals) * 100) : 0;

  // Use different fallback messages based on whether the query is supported
  let genderSubtitle;
  if (!stats?.individualMale && !stats?.individualFemale) {
    genderSubtitle = ''; // Query not supported yet, show nothing
  } else if (hasGenderData) {
    genderSubtitle = `♂ ${malePercentage}% | ♀ ${femalePercentage}%`;
  } else {
    genderSubtitle = 'Données de genre non disponibles';
  }

  // Calculate minority percentage
  const minorityCount = stats?.minorityHouseholds?.totalCount || 0;
  const totalHouseholds = stats?.groupFiltered?.totalCount || 0;
  const hasMinorityData = (minorityCount > 0 || stats?.minorityHouseholds !== undefined) && stats?.minorityHouseholds !== null;
  const minorityPercentage = totalHouseholds > 0 && hasMinorityData ? Math.round((minorityCount / totalHouseholds) * 100) : 0;

  // Use different fallback messages based on whether the query is supported
  let minoritySubtitle;
  if (!stats?.minorityHouseholds) {
    minoritySubtitle = ''; // Query not supported yet, show nothing
  } else if (hasMinorityData && minorityCount > 0) {
    minoritySubtitle = `Mutwa: ${minorityPercentage}% (${minorityCount.toLocaleString('fr-FR')})`;
  } else {
    minoritySubtitle = 'Données minoritaires non disponibles';
  }

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.wrapper}>
        <Container maxWidth={false} className={classes.contentArea}>
          <div className="main">
            <Paper className={classes.filterContainer}>
              <Typography className={classes.filterTitle}>
                <FilterListIcon className={classes.filterIcon} />
                Filtres du tableau de bord
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl variant="outlined" className={classes.filterFormControl} fullWidth size="small">
                    <InputLabel id="location-label">Province</InputLabel>
                    <Select
                      labelId="location-label"
                      name="locationId"
                      value={filters.locationId}
                      onChange={handleFilterChange}
                      label="Province"
                      className={classes.select}
                    >
                      <MenuItem value="">
                        <em>Toutes les provinces</em>
                      </MenuItem>
                      {locations.map(loc => (
                        <MenuItem key={loc.uuid} value={loc.uuid}>{loc.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl variant="outlined" className={classes.filterFormControl} fullWidth size="small">
                    <InputLabel id="benefit-plan-label">Intervention</InputLabel>
                    <Select
                      labelId="benefit-plan-label"
                      name="benefitPlanId"
                      value={filters.benefitPlanId}
                      onChange={handleFilterChange}
                      label="Intervention"
                      className={classes.select}
                    >
                      <MenuItem value="">
                        <em>Toutes les interventions</em>
                      </MenuItem>
                      {benefitPlans.map(plan => (
                        <MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl variant="outlined" className={classes.filterFormControl} fullWidth size="small">
                    <InputLabel id="year-label">Année</InputLabel>
                    <Select
                      labelId="year-label"
                      name="year"
                      value={filters.year}
                      onChange={handleFilterChange}
                      label="Année"
                      className={classes.select}
                    >
                      <MenuItem value="">
                        <em>Toutes</em>
                      </MenuItem>
                      {years.map(year => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <div className={classes.filterActions}>
                    <Button
                      variant="outlined"
                      color="default"
                      onClick={handleResetFilters}
                      style={{ marginRight: 8 }}
                      size="small"
                    >
                      Réinitialiser
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleApplyFilters}
                      size="small"
                    >
                      Appliquer
                    </Button>
                  </div>
                </Grid>
              </Grid>
            </Paper>
            {/* Key Metrics Row */}
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <BoxCard
                  label="Bénéficiaires"
                  value={getStat('groupBeneficiaryFiltered')}
                  subtitle={genderSubtitle}
                  className={classes.statsBox}
                  icon={<Person />}
                  isLoading={isLoading}
                  color="#5a8dee"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <BoxCard
                  label="Ménages"
                  value={getStat('groupFiltered')}
                  subtitle={minoritySubtitle}
                  className={classes.statsBox}
                  icon={<HomeIcon />}
                  isLoading={isLoading}
                  color="#ff8f00"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <BoxCard
                  label="Paiements"
                  value={getStat('paymentCycleFiltered')}
                  className={classes.statsBox}
                  icon={<ReceiptIcon />}
                  isLoading={isLoading}
                  color="#00d0bd"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <BoxCard
                  label="Montant Total"
                  value={`${getStat('benefitsSummaryFiltered', 'totalAmountDue')} BIF`}
                  className={classes.statsBox}
                  valueVariant="h6"
                  icon={<AttachMoneyIcon />}
                  isLoading={isLoading}
                  color="#ff5b5c"
                />
              </Grid>
            </Grid>

            {/* Map and Stats Section */}
            <Typography variant="h6" className={classes.sectionTitle}>
              Vue d'ensemble
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper className={classes.box} style={{ padding: 0, overflow: 'hidden', height: 580 }}>
                  <MapComponent
                    filters={filters}
                    isLoading={isLoading}
                    fullMap={false}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Paper className={classes.box}>
                      <Typography variant="subtitle1" gutterBottom style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                        <AttachMoneyIcon style={{ marginRight: '8px', color: '#ff8f00' }} />
                        Transferts Monétaires
                      </Typography>
                        <TransfersChart filters={filters} header={false} />
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            {/* Analytics Row */}
            <Typography variant="h6" className={classes.sectionTitle}>
              Analyses et Tendances
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper className={classes.box}>
                  <Typography variant="subtitle1" gutterBottom style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                    <AssignmentIcon style={{ marginRight: '8px', color: '#5a8dee' }} />
                    Plaintes par statut
                  </Typography>
                  <div className={classes.chartContainer}>
                    <TicketsPieChart
                      data={stats?.ticketsByResolution || []}
                      isLoading={isLoading}
                    />
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper className={classes.box}>
                  <Typography variant="subtitle1" gutterBottom style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                    <BarChartIcon style={{ marginRight: '8px', color: '#00d0bd' }} />
                    Activités M&E
                  </Typography>
                  <div className={classes.chartContainer}>
                    <ActivitiesBarChart
                      filters={filters}
                      isLoading={isLoading}
                      compact={true}
                    />
                  </div>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <BoxCard
                    label="Individus"
                    value={getStat('individualFiltered')}
                    subtitle={hasGenderData ? `♂ ${maleCount.toLocaleString('fr-FR')} | ♀ ${femaleCount.toLocaleString('fr-FR')}` : ''}
                    className={classes.statsBox}
                    icon={<PeopleAltIcon />}
                    isLoading={isLoading}
                    color="#7c4dff"
                  />
                </Grid>
                <Grid item xs={12}>
                  <BoxCard
                    label="Provinces Actives"
                    value={getStat('locationByBenefitPlan')}
                    className={classes.statsBox}
                    icon={<PlaceIcon />}
                    isLoading={isLoading}
                    color="#f44336"
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
