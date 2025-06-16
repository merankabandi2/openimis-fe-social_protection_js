import React, { useEffect, useState, useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Container,
  Grid,
  makeStyles,
  ThemeProvider,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
} from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import { decodeId } from '@openimis/fe-core';
import HomeIcon from '@material-ui/icons/Home';
import Person from '@material-ui/icons/Person';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import ReceiptIcon from '@material-ui/icons/Receipt';
import PlaceIcon from '@material-ui/icons/Place';
import AssignmentIcon from '@material-ui/icons/Assignment';
import BarChartIcon from '@material-ui/icons/BarChart';
import RefreshIcon from '@material-ui/icons/Refresh';
import MapComponent from './MapComponent';
import BoxCard from './BoxCard';
import TicketsPieChart from './TicketsPieChart';
import TransfersChart from './TransfersChart';
import ActivitiesBarChart from './ActivitiesBarChart';
import { useOptimizedDashboard } from '../../hooks/useOptimizedDashboard';
import ModernDashboardFilters from '../filters/ModernDashboardFilters';
import { useIntl } from 'react-intl';

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
  sectionTitle: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
}));


// Dashboard component
function Dashboard() {
  const [filters, setFilters] = useState({
    provinces: [],
    communes: [],
    collines: [],
    benefitPlan: null,
    year: null,
    yearRange: [2020, new Date().getFullYear()],
    status: [],
    dateRange: { start: null, end: null },
  });

  // Convert filters to optimized dashboard format
  const optimizedFilters = useMemo(() => ({
    provinceId: Array.isArray(filters.provinces) && filters.provinces.length > 0 ? parseInt(decodeId(filters.provinces[0])) : undefined,
    communeId: Array.isArray(filters.communes) && filters.communes.length > 0 ? parseInt(decodeId(filters.communes[0])) : undefined,
    collineId: Array.isArray(filters.collines) && filters.collines.length > 0 ? parseInt(decodeId(filters.collines[0])) : undefined,
    year: filters.year ? parseInt(filters.year) : undefined,
    benefitPlanId: filters.benefitPlan ? decodeId(filters.benefitPlan) : undefined,
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


  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
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

  // Use grievance data from the main dashboard hook (respects dashboard filters)
  const grievanceStatus = grievances?.statusDistribution || [];
  
  // Prepare grievance data for pie chart
  const ticketsData = grievanceStatus.map(item => ({
    status: item.category,
    count: item.count
  }));

  const intl = useIntl();
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.wrapper}>
        <Container maxWidth={false} className={classes.contentArea}>
          <div className="main">
            {/* Modern Dashboard Filters */}
            <ModernDashboardFilters
              onFiltersChange={handleFilterChange}
              defaultFilters={filters}
              filterTypes={['location', 'benefitPlan', 'year']}
            />
            
            {/* Refresh Button */}
            <Paper className={classes.refreshContainer}>
              <Box display="flex" justifyContent="flex-end" p={1}>
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
              </Box>
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
                      filters={filters}
                      intl={intl}
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
