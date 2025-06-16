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
  Fade,
} from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import { decodeId } from '@openimis/fe-core';
import RefreshIcon from '@material-ui/icons/Refresh';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import MapComponent from './MapComponent';
import BoxCard from './BoxCard';
import MonetaryTransferChart from './MonetaryTransferChart';
import MonetaryTransferChartBeneficiaires from './MonetaryTransferChartBeneficiaires';
import BenefitConsumptionByProvinces from './BenefitConsumptionByProvinces';
import TransfersChart from './TransfersChart';
import { useMonetaryTransfersDashboard } from '../../hooks/useMonetaryTransfersDashboard';
import { useOptimizedDashboard } from '../../hooks/useOptimizedDashboard';
import ModernDashboardFilters from '../filters/ModernDashboardFilters';

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
function TransfertDashboard() {
  const [filters, setFilters] = useState({
    provinces: [],
    communes: [],
    collines: [],
    benefitPlan: null,
    year: null,
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

  // Use optimized dashboard hook for performance metrics
  const {
    performance,
    summary,
    breakdown,
    isLoading: performanceLoading,
    refetchAll,
  } = useOptimizedDashboard(optimizedFilters, {
    includeTransfers: true,
  });

  // Legacy monetary transfers hook for compatibility with existing charts
  const legacyFilters = useMemo(() => {
    const converted = {
      locationId: filters.provinces?.length > 0 ? filters.provinces[0] : '',
      benefitPlanId: filters.benefitPlan || '',
      year: filters.year || '',
    };
    console.log('Legacy filters conversion:', { originalFilters: filters, converted });
    return converted;
  }, [filters]);

  const {
    totalBeneficiaries,
    totalPayments,
    totalAmount,
    totalAmountReceived,
    totalHouseholds,
    totalIndividuals,
    monetaryTransferData,
    isLoading: legacyLoading,
    error,
  } = useMonetaryTransfersDashboard(legacyFilters);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = async () => {
    await refetchAll();
  };

  const classes = useStyles();
  const isLoading = performanceLoading || legacyLoading;

  // Helper function to format numbers
  const formatNumber = (value) => {
    if (!value && value !== 0) return '0';
    return Number(value).toLocaleString('fr-FR');
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '0 BIF';
    return `${formatNumber(amount)} BIF`;
  };

  // Debug logging to see what data is available
  console.log('TransfertDashboard data:', {
    optimizedFilters,
    performance,
    legacyData: {
      totalBeneficiaries,
      totalPayments,
      totalAmount,
      totalAmountReceived,
      totalHouseholds,
      totalIndividuals,
    },
    error
  });

  // Use optimized data as primary source, fallback to legacy data
  const optimizedMetrics = performance?.overallMetrics || {};
  const summaryData = summary?.summary || {};
  
  const displayData = {
    totalBeneficiaries: optimizedMetrics.totalBeneficiaries || summaryData.totalBeneficiaries || totalBeneficiaries || 0,
    totalPayments: optimizedMetrics.totalPaymentCycles || totalPayments || 0,
    totalAmount: optimizedMetrics.totalAmountDue || summaryData.totalAmount || totalAmount || 0,
    totalAmountReceived: optimizedMetrics.totalAmountPaid || summaryData.totalAmountReceived || totalAmountReceived || 0,
    totalHouseholds: optimizedMetrics.totalHouseholds || totalHouseholds || 0,
    totalIndividuals: optimizedMetrics.totalIndividuals || totalIndividuals || 0,
  };

  // Calculate payment rate
  const paymentRate = displayData.totalAmount > 0 
    ? Math.round((displayData.totalAmountReceived / displayData.totalAmount) * 100)
    : 0;

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.wrapper}>
        <Container maxWidth={false} className={classes.contentArea}>
          {/* Page Header */}
          <div className={classes.pageHeader}>
            <Typography className={classes.pageTitle}>
              <AccountBalanceIcon className={classes.titleIcon} />
              Tableau de Bord - Transferts
            </Typography>
            <Tooltip title="Actualiser les données">
              <IconButton 
                className={classes.refreshButton}
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </div>

          {/* Modern Dashboard Filters */}
          <ModernDashboardFilters
            onFiltersChange={handleFilterChange}
            defaultFilters={filters}
            filterTypes={['location', 'benefitPlan', 'year']}
          />

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
                        {formatNumber(displayData.totalBeneficiaries)}
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
                        {formatCurrency(displayData.totalAmount)}
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
                        {formatCurrency(displayData.totalAmountReceived)}
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

          {/* Charts Section */}
          <Typography className={classes.sectionTitle}>
            <TrendingUpIcon className={classes.sectionIcon} />
            Analyses Détaillées
          </Typography>
          <Grid container spacing={3}>
            {/*  <Grid item xs={12} md={6}>
              <Paper className={classes.box}>
                <TransfersChart 
                  filters={filters} 
                  compact={true} 
                  optimizedData={performance?.overallMetrics}
                />
              </Paper>
            </Grid> */}
           <Grid item xs={12} md={6}>
              <Paper className={classes.box}>
                <MonetaryTransferChart 
                  filters={legacyFilters}
                  monetaryTransferData={monetaryTransferData}
                />
              </Paper>
            </Grid>
             {/* <Grid item xs={12} md={6}>
              <Paper className={classes.box}>
                <MonetaryTransferChartBeneficiaires 
                  filters={legacyFilters}
                  monetaryTransferData={monetaryTransferData}
                />
              </Paper>
            </Grid> */}
            <Grid item xs={12} md={6}>
              <Paper className={classes.box}>
                <BenefitConsumptionByProvinces 
                  filters={legacyFilters} 
                  optimizedData={breakdown?.locationBreakdown}
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

export default connect(mapStateToProps, mapDispatchToProps)(TransfertDashboard);
