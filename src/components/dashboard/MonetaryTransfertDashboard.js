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
  Button,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Divider,
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
import RefreshIcon from '@material-ui/icons/Refresh';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import AccessibilityIcon from '@material-ui/icons/Accessibility';
import FaceIcon from '@material-ui/icons/Face';
import WcIcon from '@material-ui/icons/Wc';
import MapComponent from './MapComponent';
import BoxCard from './BoxCard';
import MonetaryTransferChart from './MonetaryTransferChart';
import MonetaryTransferChartBeneficiaires from './MonetaryTransferChartBeneficiaires';
import BenefitConsumptionByProvinces from './BenefitConsumptionByProvinces';
import TransfersChart from './TransfersChart';
import { useMonetaryTransfersDashboard } from '../../hooks/useMonetaryTransfersDashboard';

// Remove the old buildFilter and loadStatsAll functions as we'll use the optimized hook

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
    secondary: {
      main: '#ff8f00',
    },
    success: {
      main: '#00d0bd',
    },
    error: {
      main: '#ff5c75',
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
    height: '400px',
    position: 'relative',
  },
  filterContainer: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    backgroundColor: '#fff',
    borderRadius: theme.spacing(1),
    boxShadow: '0 0 20px rgba(0,0,0,.06)',
  },
  filterFormControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(1),
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
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
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  sectionIcon: {
    color: theme.palette.primary.main,
  },
  summaryCard: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -50,
      right: -50,
      width: 150,
      height: 150,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.1)',
    },
  },
  summaryTitle: {
    fontSize: '1rem',
    fontWeight: 500,
    opacity: 0.9,
    marginBottom: theme.spacing(1),
  },
  summaryValue: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1,
  },
  summarySubtitle: {
    fontSize: '0.875rem',
    opacity: 0.8,
    marginTop: theme.spacing(1),
  },
  statIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(2),
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(0.5),
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 'fit-content',
  },
  refreshButton: {
    color: theme.palette.primary.main,
  },
}));

// Dashboard component
function MonetaryTransfertDashboard() {
  const [locations, setLocations] = useState([]);
  const [benefitPlans, setBenefitPlans] = useState([]);
  const [filters, setFilters] = useState({
    locationId: '',
    benefitPlanId: '',
    year: '',
  });
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Use the monetary transfers dashboard hook
  const {
    totalBeneficiaries,
    totalPayments,
    totalAmount,
    totalAmountReceived,
    totalHouseholds,
    totalIndividuals,
    monetaryTransferData,
    isLoading,
    error,
    refetch
  } = useMonetaryTransfersDashboard(filters);

  // Load locations and benefit plans on mount
  useEffect(() => {
    const csrfToken = localStorage.getItem('csrfToken');
    const headers = apiHeaders();
    
    // Fetch locations
    fetch(`${baseApiUrl}/graphql`, {
      method: 'post',
      headers: { 
        ...headers, 
        'X-Requested-With': 'webapp',
        'X-CSRFToken': csrfToken 
      },
      body: JSON.stringify({
        query: `{
          locations (type: "R") {
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
          benefitPlan (isDeleted: false) {
            edges {
              node {
                id
                name
                code
              }
            }
          }
        }`
      })
    })
    .then(res => res.json())
    .then(({ data }) => {
      if (data.locations) {
        setLocations(data.locations.edges.map(edge => edge.node));
      }
      if (data.benefitPlan) {
        setBenefitPlans(data.benefitPlan.edges.map(edge => edge.node));
      }
    })
    .catch(err => console.error('Failed to load filters data', err));
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    refetch();
  };

  const handleResetFilters = () => {
    setFilters({
      locationId: '',
      benefitPlanId: '',
      year: '',
    });
  };

  const classes = useStyles();

  // Helper function to format numbers
  const formatNumber = (value) => {
    if (!value && value !== 0) return '0';
    return Number(value).toLocaleString('fr-FR');
  };

  
  // Calculate payment rate
  const paymentRate = totalAmount > 0 
    ? Math.round((totalAmountReceived / totalAmount) * 100)
    : 0;

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.wrapper}>
        <Container maxWidth={false} className={classes.contentArea}>
          {/* Page Header */}
          <div className={classes.pageHeader}>
            <Typography className={classes.pageTitle}>
              <AccountBalanceIcon className={classes.titleIcon} />
              Tableau de Bord - Transferts Monétaires
            </Typography>
            <Tooltip title="Actualiser les données">
              <IconButton 
                className={classes.refreshButton}
                onClick={refetch}
                disabled={isLoading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </div>

          {/* Filters */}
          <Paper className={classes.filterContainer}>
            <Typography className={classes.filterTitle}>
              <FilterListIcon className={classes.filterIcon} />
              Filtres de recherche
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

          {/* Summary Card */}
          <Fade in={!isLoading}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper className={classes.summaryCard}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Typography className={classes.summaryTitle}>
                        Total Bénéficiaires
                      </Typography>
                      <Typography className={classes.summaryValue}>
                        {formatNumber(totalBeneficiaries)}
                      </Typography>
                      <Typography className={classes.summarySubtitle}>
                        Ménages enregistrés
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography className={classes.summaryTitle}>
                        Montant Total
                      </Typography>
                      <Typography className={classes.summaryValue}>
                        {formatNumber(totalAmount)}
                      </Typography>
                      <Typography className={classes.summarySubtitle}>
                        BIF à distribuer
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography className={classes.summaryTitle}>
                        Montant Distribué
                      </Typography>
                      <Typography className={classes.summaryValue}>
                        {formatNumber(totalAmountReceived)}
                      </Typography>
                      <Typography className={classes.summarySubtitle}>
                        BIF déjà payés
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography className={classes.summaryTitle}>
                        Taux de Paiement
                      </Typography>
                      <Typography className={classes.summaryValue}>
                        {paymentRate}%
                      </Typography>
                      <div className={classes.statIndicator}>
                        <TrendingUpIcon fontSize="small" />
                        <Typography variant="caption">
                          En progression
                        </Typography>
                      </div>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Fade>

          {/* Key Metrics */}
          <Typography className={classes.sectionTitle}>
            <TrendingUpIcon className={classes.sectionIcon} />
            Indicateurs Clés
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <BoxCard
                label="Bénéficiaires"
                value={formatNumber(totalBeneficiaries)}
                className={classes.statsBox}
                icon={<Person />}
                isLoading={isLoading}
                color="#5a8dee"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <BoxCard
                label="Paiements"
                value={formatNumber(totalPayments)}
                className={classes.statsBox}
                icon={<ReceiptIcon />}
                isLoading={isLoading}
                color="#ff8f00"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <BoxCard
                label="Ménages"
                value={formatNumber(totalHouseholds)}
                className={classes.statsBox}
                icon={<HomeIcon />}
                isLoading={isLoading}
                color="#00d0bd"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <BoxCard
                label="Individus"
                value={formatNumber(totalIndividuals)}
                className={classes.statsBox}
                icon={<PeopleAltIcon />}
                isLoading={isLoading}
                color="#ff5c75"
              />
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Typography className={classes.sectionTitle}>
            <TrendingUpIcon className={classes.sectionIcon} />
            Analyses Détaillées
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper className={classes.box}>
                <TransfersChart filters={filters} compact={true} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper className={classes.box}>
                <MonetaryTransferChart filters={filters} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper className={classes.box}>
                <MonetaryTransferChartBeneficiaires filters={filters} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper className={classes.box}>
                <BenefitConsumptionByProvinces filters={filters} />
              </Paper>
            </Grid>
          </Grid>

          {/* Map Section */}
          <Typography className={classes.sectionTitle}>
            <PlaceIcon className={classes.sectionIcon} />
            Répartition Géographique
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper className={classes.box} style={{ height: 500, padding: 0, overflow: 'hidden' }}>
                <MapComponent 
                  filters={filters}
                  isLoading={isLoading}
                  fullMap={true}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </div>
    </ThemeProvider>
  );
}

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MonetaryTransfertDashboard);
