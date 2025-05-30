import React, { useEffect, useState, useMemo } from 'react';
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
  IconButton,
  Tooltip,
  CircularProgress,
} from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import { baseApiUrl, apiHeaders, decodeId, useGraphqlQuery } from '@openimis/fe-core';
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
import RefreshIcon from '@material-ui/icons/Refresh';
import MapComponent from './MapComponent';
import BoxCard from './BoxCard';
import TicketsPieChart from './TicketsPieChart';
import TransfersChart from './TransfersChart';
import ActivitiesBarChart from './ActivitiesBarChart';
import { useOptimizedDashboard } from '../../hooks/useOptimizedDashboard';

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

// GraphQL query for locations and benefit plans
const LOCATIONS_AND_PLANS_QUERY = `
  query LocationsAndPlans {
    locations(type: "D") {
      edges {
        node {
          id
          uuid
          name
          code
          type
        }
      }
    }
    benefitPlan(isDeleted: false) {
      edges {
        node {
          id
          name
          code
        }
      }
    }
  }
`;

// Dashboard component
function Dashboard() {
  const [filters, setFilters] = useState({
    locationId: '',
    benefitPlanId: '',
    year: '',
  });
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Convert filters to optimized dashboard format
  const optimizedFilters = useMemo(() => ({
    provinceId: filters.locationId ? parseInt(decodeId(filters.locationId)) : undefined,
    year: filters.year ? parseInt(filters.year) : undefined,
    benefitPlanId: filters.benefitPlanId ? decodeId(filters.benefitPlanId) : undefined,
  }), [filters]);

  // Use optimized dashboard hook
  const {
    summary,
    breakdown,
    performance,
    grievances,
    isLoading,
    isRefreshing,
    error,
    refetchAll,
    lastRefresh,
  } = useOptimizedDashboard(optimizedFilters, {
    includeGrievances: true,
    includeTransfers: true,
  });

  // Query for locations and benefit plans
  const { data: locationsAndPlans } = useGraphqlQuery(
    LOCATIONS_AND_PLANS_QUERY,
    {},
    {}
  );

  const locations = useMemo(() => {
    if (!locationsAndPlans?.locations) return [];
    return locationsAndPlans.locations.edges.map(edge => edge.node)
      .filter(node => node.type === 'R' || node.type === 'D');
  }, [locationsAndPlans]);

  const benefitPlans = useMemo(() => {
    if (!locationsAndPlans?.benefitPlan) return [];
    return locationsAndPlans.benefitPlan.edges.map(edge => edge.node);
  }, [locationsAndPlans]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically through the hook
  };

  const handleResetFilters = () => {
    setFilters({
      locationId: '',
      benefitPlanId: '',
      year: '',
    });
  };

  const handleRefresh = async () => {
    await refetchAll();
  };

  const classes = useStyles();

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString('fr-FR');
  };

  // Extract data from optimized queries
  const summaryData = summary?.summary || {};
  const communityData = summary?.communityBreakdown || [];
  const genderData = breakdown?.genderBreakdown || {};
  const statusData = breakdown?.statusBreakdown || [];
  const locationData = breakdown?.locationBreakdown || [];
  const transferMetrics = performance?.overallMetrics || {};
  const grievanceData = grievances?.summary || {};
  const grievanceStatus = grievances?.statusDistribution || [];

  // Separate data for different entities
  const totalBeneficiaries = summaryData.totalBeneficiaries || 0; // groupbeneficiary count
  const totalIndividuals = genderData.total || 0; // individual_individual count 
  const maleCount = genderData.male || 0;
  const femaleCount = genderData.female || 0;
  const twaCount = genderData.twa || 0;

  // Gender percentages for individuals (from breakdown data)
  const malePercentage = genderData.malePercentage || 0;
  const femalePercentage = genderData.femalePercentage || 0;
  const genderSubtitle = totalIndividuals > 0 
    ? `♂ ${Math.round(malePercentage)}% | ♀ ${Math.round(femalePercentage)}%`
    : '';

  // Twa minority group subtitle (separate from gender)
  const twaSubtitle = twaCount > 0
    ? `Mutwa: ${genderData.twaPercentage || 0}% (${formatNumber(twaCount)})`
    : '';

  // Get correct data from appropriate sources
  const totalHouseholds = breakdown?.householdBreakdown?.totalHouseholds || 0; // household count
  const totalTransfers = summaryData.totalTransfers || 0; // payment cycles count  
  const totalAmountPaid = summaryData.totalAmountPaid || 0; // total benefit consumption amount

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '0 BIF';
    return `${formatNumber(amount)} BIF`;
  };

  // Prepare grievance data for pie chart
  const ticketsData = grievanceStatus.map(item => ({
    status: item.category,
    count: item.count
  }));

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.wrapper}>
        <Container maxWidth={false} className={classes.contentArea}>
          <div className="main">
            <Paper className={classes.filterContainer}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs>
                  <Typography className={classes.filterTitle}>
                    <FilterListIcon className={classes.filterIcon} />
                    Filtres du tableau de bord
                  </Typography>
                </Grid>
                <Grid item>
                  <Tooltip title={lastRefresh ? `Dernière mise à jour: ${new Date(lastRefresh).toLocaleString('fr-FR')}` : 'Actualiser les données'}>
                    <IconButton 
                      onClick={handleRefresh} 
                      disabled={isRefreshing}
                      size="small"
                      color="primary"
                    >
                      {isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
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
                  </div>
                </Grid>
              </Grid>
            </Paper>
            {/* Key Metrics Row */}
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <BoxCard
                  label="Bénéficiaires"
                  value={formatNumber(summaryData.totalBeneficiaries)}
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
                  value={formatNumber(totalHouseholds)}
                  subtitle={twaSubtitle}
                  className={classes.statsBox}
                  icon={<HomeIcon />}
                  isLoading={isLoading}
                  color="#ff8f00"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <BoxCard
                  label="Transferts"
                  value={formatNumber(totalTransfers)}
                  className={classes.statsBox}
                  icon={<ReceiptIcon />}
                  isLoading={isLoading}
                  color="#00d0bd"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <BoxCard
                  label="Montant Total"
                  value={formatCurrency(totalAmountPaid)}
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
                    optimizedData={locationData}
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
                        <TransfersChart filters={filters} header={false} optimizedData={performance?.overallMetrics} />
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
                      data={ticketsData}
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
                      optimizedData={communityData}
                    />
                  </div>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <BoxCard
                    label="Individus"
                    value={formatNumber(totalIndividuals)}
                    subtitle={totalIndividuals > 0 ? `♂ ${formatNumber(maleCount)} | ♀ ${formatNumber(femaleCount)}` : ''}
                    className={classes.statsBox}
                    icon={<PeopleAltIcon />}
                    isLoading={isLoading}
                    color="#7c4dff"
                  />
                </Grid>
                <Grid item xs={12}>
                  <BoxCard
                    label="Provinces Actives"
                    value={formatNumber(summaryData.provincesCovered || locationData.length)}
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
