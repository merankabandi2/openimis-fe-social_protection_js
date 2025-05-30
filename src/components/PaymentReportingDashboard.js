import React, { useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  makeStyles,
  ThemeProvider,
  createTheme,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Avatar,
  Fade,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import PeopleIcon from '@material-ui/icons/People';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import AssessmentIcon from '@material-ui/icons/Assessment';
import GetAppIcon from '@material-ui/icons/GetApp';
import FilterListIcon from '@material-ui/icons/FilterList';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ReactApexChart from 'react-apexcharts';
import { 
  usePaymentReporting, 
  usePaymentByLocation, 
  usePaymentByProgram, 
  usePaymentTrends,
  usePaymentKPIs 
} from '../hooks/usePaymentReporting';
import { useLocations } from '@openimis/fe-location';
import { useBenefitPlans } from '@openimis/fe-social_protection';

// Create custom theme
const theme = createTheme({
  typography: {
    fontFamily: '"Titillium Web", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#ff6f00',
    },
    success: {
      main: '#43a047',
    },
    error: {
      main: '#e53935',
    },
    warning: {
      main: '#fb8c00',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

// Custom styles
const useStyles = makeStyles((theme) => ({
  wrapper: {
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh',
    paddingTop: theme.spacing(3),
  },
  contentArea: {
    padding: theme.spacing(2),
  },
  pageHeader: {
    marginBottom: theme.spacing(3),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: theme.spacing(2),
    },
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  titleIcon: {
    fontSize: '2.5rem',
    color: theme.palette.primary.main,
  },
  filterContainer: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    backgroundColor: '#fff',
    borderRadius: theme.spacing(2),
    boxShadow: '0 0 20px rgba(0,0,0,.06)',
  },
  summaryCard: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
    color: '#fff',
    marginBottom: theme.spacing(3),
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing(3),
  },
  summaryItem: {
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1,
  },
  summaryLabel: {
    fontSize: '0.875rem',
    opacity: 0.9,
    marginTop: theme.spacing(1),
  },
  statsCard: {
    height: '100%',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 30px rgba(0,0,0,.12)',
    },
  },
  statsCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  statsCardTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  statsCardValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: theme.palette.primary.main,
  },
  chartContainer: {
    height: 350,
    marginTop: theme.spacing(2),
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  refreshButton: {
    color: theme.palette.primary.main,
  },
  kpiCard: {
    padding: theme.spacing(2),
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: 100,
      height: 100,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.1)',
      transform: 'translate(30px, -30px)',
    },
  },
  kpiValue: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1,
  },
  kpiLabel: {
    fontSize: '0.875rem',
    opacity: 0.8,
    marginTop: theme.spacing(1),
  },
  kpiTarget: {
    fontSize: '0.75rem',
    opacity: 0.7,
    marginTop: theme.spacing(0.5),
  },
  filterChip: {
    margin: theme.spacing(0.5),
  },
}));

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-BI', {
    style: 'currency',
    currency: 'BIF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format number
const formatNumber = (num) => {
  return new Intl.NumberFormat('fr-BI').format(num);
};

function PaymentReportingDashboard() {
  const intl = useIntl();
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState(0);
  const [locationLevel, setLocationLevel] = useState('province');
  const [trendGranularity, setTrendGranularity] = useState('month');
  const [showFilters, setShowFilters] = useState(true);
  
  // Get location and benefit plan data
  const { provinces, communes, collines } = useLocations();
  const { benefitPlans } = useBenefitPlans();
  
  // Use payment reporting hooks
  const {
    summary,
    breakdownBySource,
    breakdownByGender,
    breakdownByCommunity,
    filters,
    isLoading: summaryLoading,
    updateFilters,
    clearFilters,
    refetch: refetchSummary,
  } = usePaymentReporting();
  
  const {
    locations,
    total: locationTotal,
    isLoading: locationLoading,
    refetch: refetchLocation,
  } = usePaymentByLocation(locationLevel, filters);
  
  const {
    programs,
    total: programTotal,
    isLoading: programLoading,
    refetch: refetchProgram,
  } = usePaymentByProgram(filters);
  
  const {
    trends,
    isLoading: trendsLoading,
    refetch: refetchTrends,
  } = usePaymentTrends(trendGranularity, filters);
  
  const {
    kpis,
    targets,
    isLoading: kpisLoading,
    refetch: refetchKPIs,
  } = usePaymentKPIs(filters);
  
  // Handle filter changes
  const handleFilterChange = (name) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updateFilters({ [name]: value });
  };
  
  // Handle location hierarchy
  const handleLocationChange = (level) => (event) => {
    const value = event.target.value;
    updateFilters({ [`${level}Id`]: value });
    
    // Clear child locations when parent changes
    if (level === 'province') {
      updateFilters({ communeId: null, collineId: null });
    } else if (level === 'commune') {
      updateFilters({ collineId: null });
    }
  };
  
  // Refresh all data
  const handleRefreshAll = () => {
    refetchSummary();
    refetchLocation();
    refetchProgram();
    refetchTrends();
    refetchKPIs();
  };
  
  // Export data (placeholder)
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export payment report');
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    // Payment source pie chart
    const sourceChart = {
      series: breakdownBySource.map(item => item.paymentAmount),
      labels: breakdownBySource.map(item => 
        item.source === 'EXTERNAL' ? 'Paiements Externes' : 'Paiements Internes'
      ),
    };
    
    // Gender distribution chart
    const genderChart = {
      series: breakdownByGender.map(item => item.beneficiaryCount),
      labels: breakdownByGender.map(item => 
        item.gender === 'M' ? 'Hommes' : 'Femmes'
      ),
    };
    
    // Community type chart
    const communityChart = {
      series: breakdownByCommunity.map(item => item.beneficiaryCount),
      labels: breakdownByCommunity.map(item => 
        item.communityType === 'HOST' ? 'Communauté Hôte' : item.communityType
      ),
    };
    
    // Trends line chart
    const trendsChart = {
      series: [{
        name: 'Montant des Paiements',
        data: trends.map(t => t.paymentAmount),
      }, {
        name: 'Nombre de Bénéficiaires',
        data: trends.map(t => t.beneficiaryCount),
        yaxis: 1,
      }],
      categories: trends.map(t => t.period),
    };
    
    return { sourceChart, genderChart, communityChart, trendsChart };
  };
  
  const chartData = prepareChartData();
  
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.wrapper}>
        <Container maxWidth={false} className={classes.contentArea}>
          {/* Page Header */}
          <div className={classes.pageHeader}>
            <Typography className={classes.pageTitle}>
              <AttachMoneyIcon className={classes.titleIcon} />
              Tableau de Bord - Rapports de Paiements
            </Typography>
            <Box display="flex" gap={1}>
              <Tooltip title="Exporter les données">
                <IconButton onClick={handleExport}>
                  <GetAppIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Actualiser les données">
                <IconButton 
                  className={classes.refreshButton}
                  onClick={handleRefreshAll}
                  disabled={summaryLoading}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </div>
          
          {/* Filters */}
          <Paper className={classes.filterContainer}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" display="flex" alignItems="center">
                <FilterListIcon style={{ marginRight: 8 }} />
                Filtres
              </Typography>
              <Button
                size="small"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Masquer' : 'Afficher'}
              </Button>
            </Box>
            
            {showFilters && (
              <Grid container spacing={2}>
                {/* Time filters */}
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Année"
                    type="number"
                    value={filters.year || ''}
                    onChange={handleFilterChange('year')}
                    fullWidth
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl variant="outlined" fullWidth size="small">
                    <InputLabel>Mois</InputLabel>
                    <Select
                      value={filters.month || ''}
                      onChange={handleFilterChange('month')}
                      label="Mois"
                    >
                      <MenuItem value="">Tous</MenuItem>
                      {[...Array(12)].map((_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {new Date(2000, i).toLocaleDateString('fr-FR', { month: 'long' })}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Location filters */}
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl variant="outlined" fullWidth size="small">
                    <InputLabel>Province</InputLabel>
                    <Select
                      value={filters.provinceId || ''}
                      onChange={handleLocationChange('province')}
                      label="Province"
                    >
                      <MenuItem value="">Toutes</MenuItem>
                      {provinces?.map(prov => (
                        <MenuItem key={prov.id} value={prov.id}>
                          {prov.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {filters.provinceId && (
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl variant="outlined" fullWidth size="small">
                      <InputLabel>Commune</InputLabel>
                      <Select
                        value={filters.communeId || ''}
                        onChange={handleLocationChange('commune')}
                        label="Commune"
                      >
                        <MenuItem value="">Toutes</MenuItem>
                        {communes
                          ?.filter(c => c.parent?.id === filters.provinceId)
                          .map(com => (
                            <MenuItem key={com.id} value={com.id}>
                              {com.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                
                {/* Program filter */}
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl variant="outlined" fullWidth size="small">
                    <InputLabel>Programme</InputLabel>
                    <Select
                      value={filters.benefitPlanId || ''}
                      onChange={handleFilterChange('benefitPlanId')}
                      label="Programme"
                    >
                      <MenuItem value="">Tous</MenuItem>
                      {benefitPlans?.map(plan => (
                        <MenuItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Demographic filters */}
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl variant="outlined" fullWidth size="small">
                    <InputLabel>Genre</InputLabel>
                    <Select
                      value={filters.gender || ''}
                      onChange={handleFilterChange('gender')}
                      label="Genre"
                    >
                      <MenuItem value="">Tous</MenuItem>
                      <MenuItem value="M">Masculin</MenuItem>
                      <MenuItem value="F">Féminin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.isTwa || false}
                        onChange={handleFilterChange('isTwa')}
                        color="primary"
                      />
                    }
                    label="TWA uniquement"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl variant="outlined" fullWidth size="small">
                    <InputLabel>Source</InputLabel>
                    <Select
                      value={filters.paymentSource || ''}
                      onChange={handleFilterChange('paymentSource')}
                      label="Source"
                    >
                      <MenuItem value="">Toutes</MenuItem>
                      <MenuItem value="EXTERNAL">Externe</MenuItem>
                      <MenuItem value="INTERNAL">Interne</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    fullWidth
                  >
                    Réinitialiser
                  </Button>
                </Grid>
              </Grid>
            )}
            
            {/* Active filters chips */}
            <Box mt={2} display="flex" flexWrap="wrap">
              {filters.year && (
                <Chip
                  label={`Année: ${filters.year}`}
                  onDelete={() => updateFilters({ year: null })}
                  className={classes.filterChip}
                  size="small"
                />
              )}
              {filters.provinceId && provinces && (
                <Chip
                  label={`Province: ${provinces.find(p => p.id === filters.provinceId)?.name}`}
                  onDelete={() => updateFilters({ provinceId: null, communeId: null, collineId: null })}
                  className={classes.filterChip}
                  size="small"
                />
              )}
              {filters.benefitPlanId && benefitPlans && (
                <Chip
                  label={`Programme: ${benefitPlans.find(p => p.id === filters.benefitPlanId)?.name}`}
                  onDelete={() => updateFilters({ benefitPlanId: null })}
                  className={classes.filterChip}
                  size="small"
                />
              )}
            </Box>
          </Paper>
          
          {/* Summary Cards */}
          {summary && (
            <Fade in={!summaryLoading}>
              <Paper className={classes.summaryCard}>
                <div className={classes.summaryGrid}>
                  <div className={classes.summaryItem}>
                    <Typography className={classes.summaryValue}>
                      {formatCurrency(summary.totalAmount)}
                    </Typography>
                    <Typography className={classes.summaryLabel}>
                      Montant Total Versé
                    </Typography>
                  </div>
                  <div className={classes.summaryItem}>
                    <Typography className={classes.summaryValue}>
                      {formatNumber(summary.totalBeneficiaries)}
                    </Typography>
                    <Typography className={classes.summaryLabel}>
                      Bénéficiaires Touchés
                    </Typography>
                  </div>
                  <div className={classes.summaryItem}>
                    <Typography className={classes.summaryValue}>
                      {formatNumber(summary.totalPayments)}
                    </Typography>
                    <Typography className={classes.summaryLabel}>
                      Nombre de Paiements
                    </Typography>
                  </div>
                  <div className={classes.summaryItem}>
                    <Typography className={classes.summaryValue}>
                      {formatCurrency(summary.avgPaymentAmount)}
                    </Typography>
                    <Typography className={classes.summaryLabel}>
                      Paiement Moyen
                    </Typography>
                  </div>
                </div>
              </Paper>
            </Fade>
          )}
          
          {/* KPI Cards */}
          {kpis && (
            <Grid container spacing={3} style={{ marginBottom: 24 }}>
              <Grid item xs={12} md={3}>
                <Card className={classes.kpiCard} style={{ backgroundColor: '#e3f2fd' }}>
                  <CardContent>
                    <Typography className={classes.kpiLabel}>
                      Inclusion Féminine
                    </Typography>
                    <Typography className={classes.kpiValue} style={{ color: '#1976d2' }}>
                      {kpis.femaleInclusion.toFixed(1)}%
                    </Typography>
                    {targets && (
                      <Typography className={classes.kpiTarget}>
                        Cible: {targets.femaleInclusion}%
                      </Typography>
                    )}
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (kpis.femaleInclusion / targets?.femaleInclusion) * 100)}
                      style={{ marginTop: 8 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card className={classes.kpiCard} style={{ backgroundColor: '#f3e5f5' }}>
                  <CardContent>
                    <Typography className={classes.kpiLabel}>
                      Inclusion TWA
                    </Typography>
                    <Typography className={classes.kpiValue} style={{ color: '#7b1fa2' }}>
                      {kpis.twaInclusion.toFixed(1)}%
                    </Typography>
                    {targets && (
                      <Typography className={classes.kpiTarget}>
                        Cible: {targets.twaInclusion}%
                      </Typography>
                    )}
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (kpis.twaInclusion / targets?.twaInclusion) * 100)}
                      style={{ marginTop: 8 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card className={classes.kpiCard} style={{ backgroundColor: '#e8f5e9' }}>
                  <CardContent>
                    <Typography className={classes.kpiLabel}>
                      Couverture Géographique
                    </Typography>
                    <Typography className={classes.kpiValue} style={{ color: '#388e3c' }}>
                      {kpis.geographicCoverage}
                    </Typography>
                    <Typography className={classes.kpiTarget}>
                      Provinces actives
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card className={classes.kpiCard} style={{ backgroundColor: '#fff3e0' }}>
                  <CardContent>
                    <Typography className={classes.kpiLabel}>
                      Score d'Efficacité
                    </Typography>
                    <Typography className={classes.kpiValue} style={{ color: '#f57c00' }}>
                      {kpis.efficiencyScore.toFixed(0)}%
                    </Typography>
                    {targets && (
                      <Typography className={classes.kpiTarget}>
                        Cible: {targets.efficiencyScore}%
                      </Typography>
                    )}
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (kpis.efficiencyScore / targets?.efficiencyScore) * 100)}
                      style={{ marginTop: 8 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Tabs for different views */}
          <Paper style={{ marginBottom: 24 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Vue d'ensemble" icon={<DashboardIcon />} />
              <Tab label="Par Localisation" icon={<LocationOnIcon />} />
              <Tab label="Par Programme" icon={<AccountBalanceIcon />} />
              <Tab label="Tendances" icon={<TrendingUpIcon />} />
            </Tabs>
          </Paper>
          
          {/* Tab Content */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Payment Source Distribution */}
              <Grid item xs={12} md={6}>
                <Paper style={{ padding: 24 }}>
                  <Typography variant="h6" gutterBottom>
                    Répartition par Source de Paiement
                  </Typography>
                  <div className={classes.chartContainer}>
                    <ReactApexChart
                      options={{
                        chart: { type: 'pie' },
                        labels: chartData.sourceChart.labels,
                        colors: ['#1976d2', '#ff6f00'],
                        legend: { position: 'bottom' },
                        dataLabels: {
                          formatter: (val, opts) => {
                            const amount = chartData.sourceChart.series[opts.seriesIndex];
                            return `${val.toFixed(1)}%\n${formatCurrency(amount)}`;
                          },
                        },
                      }}
                      series={chartData.sourceChart.series}
                      type="pie"
                      height="100%"
                    />
                  </div>
                </Paper>
              </Grid>
              
              {/* Gender Distribution */}
              <Grid item xs={12} md={6}>
                <Paper style={{ padding: 24 }}>
                  <Typography variant="h6" gutterBottom>
                    Répartition par Genre
                  </Typography>
                  <div className={classes.chartContainer}>
                    <ReactApexChart
                      options={{
                        chart: { type: 'donut' },
                        labels: chartData.genderChart.labels,
                        colors: ['#2196f3', '#e91e63'],
                        legend: { position: 'bottom' },
                      }}
                      series={chartData.genderChart.series}
                      type="donut"
                      height="100%"
                    />
                  </div>
                </Paper>
              </Grid>
              
              {/* Community Type Distribution */}
              <Grid item xs={12} md={6}>
                <Paper style={{ padding: 24 }}>
                  <Typography variant="h6" gutterBottom>
                    Répartition par Type de Communauté
                  </Typography>
                  <div className={classes.chartContainer}>
                    <ReactApexChart
                      options={{
                        chart: { type: 'bar' },
                        xaxis: { categories: chartData.communityChart.labels },
                        colors: ['#4caf50'],
                        plotOptions: {
                          bar: {
                            borderRadius: 4,
                            horizontal: true,
                          },
                        },
                      }}
                      series={[{
                        name: 'Bénéficiaires',
                        data: chartData.communityChart.series,
                      }]}
                      type="bar"
                      height="100%"
                    />
                  </div>
                </Paper>
              </Grid>
              
              {/* Payment Details Table */}
              <Grid item xs={12} md={6}>
                <Paper style={{ padding: 24 }}>
                  <Typography variant="h6" gutterBottom>
                    Détails par Source
                  </Typography>
                  <TableContainer className={classes.tableContainer}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Source</TableCell>
                          <TableCell align="right">Paiements</TableCell>
                          <TableCell align="right">Montant</TableCell>
                          <TableCell align="right">Femmes %</TableCell>
                          <TableCell align="right">TWA %</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {breakdownBySource.map((row) => (
                          <TableRow key={row.source}>
                            <TableCell>
                              {row.source === 'EXTERNAL' ? 'Externe' : 'Interne'}
                            </TableCell>
                            <TableCell align="right">
                              {formatNumber(row.paymentCount)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(row.paymentAmount)}
                            </TableCell>
                            <TableCell align="right">
                              {row.femalePercentage.toFixed(1)}%
                            </TableCell>
                            <TableCell align="right">
                              {row.twaPercentage.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 1 && (
            <Grid container spacing={3}>
              {/* Location Level Selector */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" mb={2}>
                  <FormControl variant="outlined" style={{ minWidth: 200 }}>
                    <InputLabel>Niveau</InputLabel>
                    <Select
                      value={locationLevel}
                      onChange={(e) => setLocationLevel(e.target.value)}
                      label="Niveau"
                    >
                      <MenuItem value="province">Province</MenuItem>
                      <MenuItem value="commune">Commune</MenuItem>
                      <MenuItem value="colline">Colline</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              
              {/* Location Map/Chart */}
              <Grid item xs={12}>
                <Paper style={{ padding: 24 }}>
                  <Typography variant="h6" gutterBottom>
                    Paiements par {locationLevel === 'province' ? 'Province' : 
                                   locationLevel === 'commune' ? 'Commune' : 'Colline'}
                  </Typography>
                  <TableContainer className={classes.tableContainer}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Localisation</TableCell>
                          <TableCell align="right">Paiements</TableCell>
                          <TableCell align="right">Montant</TableCell>
                          <TableCell align="right">Bénéficiaires</TableCell>
                          <TableCell align="right">Paiement Moyen</TableCell>
                          <TableCell align="right">Femmes %</TableCell>
                          <TableCell align="right">TWA %</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {locations.map((loc, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {loc.provinceName || loc.communeName || loc.collineName || '-'}
                            </TableCell>
                            <TableCell align="right">
                              {formatNumber(loc.paymentCount)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(loc.paymentAmount)}
                            </TableCell>
                            <TableCell align="right">
                              {formatNumber(loc.beneficiaryCount)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(loc.avgPayment)}
                            </TableCell>
                            <TableCell align="right">
                              {loc.femalePercentage.toFixed(1)}%
                            </TableCell>
                            <TableCell align="right">
                              {loc.twaPercentage.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell><strong>Total</strong></TableCell>
                          <TableCell align="right">
                            <strong>{formatNumber(locationTotal.paymentCount)}</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>{formatCurrency(locationTotal.paymentAmount)}</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>{formatNumber(locationTotal.beneficiaryCount)}</strong>
                          </TableCell>
                          <TableCell colSpan={3} />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 2 && (
            <Grid container spacing={3}>
              {/* Programs Table */}
              <Grid item xs={12}>
                <Paper style={{ padding: 24 }}>
                  <Typography variant="h6" gutterBottom>
                    Paiements par Programme
                  </Typography>
                  <TableContainer className={classes.tableContainer}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Programme</TableCell>
                          <TableCell align="right">Paiements</TableCell>
                          <TableCell align="right">Montant</TableCell>
                          <TableCell align="right">Bénéficiaires</TableCell>
                          <TableCell align="right">Paiement Moyen</TableCell>
                          <TableCell align="right">Femmes %</TableCell>
                          <TableCell align="right">TWA %</TableCell>
                          <TableCell align="right">Provinces</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {programs.map((prog) => (
                          <TableRow key={prog.benefitPlanId}>
                            <TableCell>{prog.benefitPlanName}</TableCell>
                            <TableCell align="right">
                              {formatNumber(prog.paymentCount)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(prog.paymentAmount)}
                            </TableCell>
                            <TableCell align="right">
                              {formatNumber(prog.beneficiaryCount)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(prog.avgPayment)}
                            </TableCell>
                            <TableCell align="right">
                              {prog.femalePercentage.toFixed(1)}%
                            </TableCell>
                            <TableCell align="right">
                              {prog.twaPercentage.toFixed(1)}%
                            </TableCell>
                            <TableCell align="right">
                              {prog.provincesCovered}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell><strong>Total</strong></TableCell>
                          <TableCell align="right">
                            <strong>{formatNumber(programTotal.paymentCount)}</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>{formatCurrency(programTotal.paymentAmount)}</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>{formatNumber(programTotal.beneficiaryCount)}</strong>
                          </TableCell>
                          <TableCell colSpan={4} />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 3 && (
            <Grid container spacing={3}>
              {/* Trends Granularity Selector */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" mb={2}>
                  <FormControl variant="outlined" style={{ minWidth: 200 }}>
                    <InputLabel>Période</InputLabel>
                    <Select
                      value={trendGranularity}
                      onChange={(e) => setTrendGranularity(e.target.value)}
                      label="Période"
                    >
                      <MenuItem value="day">Jour</MenuItem>
                      <MenuItem value="week">Semaine</MenuItem>
                      <MenuItem value="month">Mois</MenuItem>
                      <MenuItem value="quarter">Trimestre</MenuItem>
                      <MenuItem value="year">Année</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              
              {/* Trends Chart */}
              <Grid item xs={12}>
                <Paper style={{ padding: 24 }}>
                  <Typography variant="h6" gutterBottom>
                    Évolution des Paiements
                  </Typography>
                  <div className={classes.chartContainer}>
                    <ReactApexChart
                      options={{
                        chart: { 
                          type: 'line',
                          zoom: { enabled: true },
                        },
                        xaxis: { 
                          categories: chartData.trendsChart.categories,
                          labels: { rotate: -45 },
                        },
                        yaxis: [
                          {
                            title: { text: 'Montant (BIF)' },
                            labels: {
                              formatter: (val) => formatCurrency(val),
                            },
                          },
                          {
                            opposite: true,
                            title: { text: 'Bénéficiaires' },
                            labels: {
                              formatter: (val) => formatNumber(val),
                            },
                          },
                        ],
                        stroke: { curve: 'smooth' },
                        colors: ['#1976d2', '#ff6f00'],
                        legend: { position: 'bottom' },
                      }}
                      series={chartData.trendsChart.series}
                      type="line"
                      height="100%"
                    />
                  </div>
                </Paper>
              </Grid>
              
              {/* Cumulative Trends */}
              <Grid item xs={12} md={6}>
                <Paper style={{ padding: 24 }}>
                  <Typography variant="h6" gutterBottom>
                    Cumul des Paiements
                  </Typography>
                  <div className={classes.chartContainer}>
                    <ReactApexChart
                      options={{
                        chart: { type: 'area' },
                        xaxis: { 
                          categories: trends.map(t => t.period),
                          labels: { rotate: -45 },
                        },
                        yaxis: {
                          labels: {
                            formatter: (val) => formatCurrency(val),
                          },
                        },
                        stroke: { curve: 'smooth' },
                        fill: {
                          type: 'gradient',
                          gradient: {
                            shadeIntensity: 1,
                            opacityFrom: 0.7,
                            opacityTo: 0.3,
                          },
                        },
                        colors: ['#1976d2'],
                      }}
                      series={[{
                        name: 'Cumul',
                        data: trends.map(t => t.cumulativeAmount),
                      }]}
                      type="area"
                      height="100%"
                    />
                  </div>
                </Paper>
              </Grid>
              
              {/* Inclusion Trends */}
              <Grid item xs={12} md={6}>
                <Paper style={{ padding: 24 }}>
                  <Typography variant="h6" gutterBottom>
                    Évolution de l'Inclusion
                  </Typography>
                  <div className={classes.chartContainer}>
                    <ReactApexChart
                      options={{
                        chart: { type: 'line' },
                        xaxis: { 
                          categories: trends.map(t => t.period),
                          labels: { rotate: -45 },
                        },
                        yaxis: {
                          max: 100,
                          labels: {
                            formatter: (val) => `${val}%`,
                          },
                        },
                        stroke: { curve: 'smooth', width: 2 },
                        colors: ['#e91e63', '#7b1fa2'],
                        legend: { position: 'bottom' },
                      }}
                      series={[{
                        name: 'Femmes %',
                        data: trends.map(t => t.femalePercentage),
                      }, {
                        name: 'TWA %',
                        data: trends.map(t => t.twaPercentage),
                      }]}
                      type="line"
                      height="100%"
                    />
                  </div>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </div>
    </ThemeProvider>
  );
}

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PaymentReportingDashboard);