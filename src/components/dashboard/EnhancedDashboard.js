import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Fade,
  Grow,
  CircularProgress,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@material-ui/core';
import debounce from 'lodash/debounce';
import { makeStyles } from '@material-ui/core/styles';
import { useGraphqlQuery, useModulesManager } from '@openimis/fe-core';
import { FormattedMessage } from 'react-intl';
import ModernDashboardFilters from '../filters/ModernDashboardFilters';
import { useDashboardCache } from '../../hooks/useDashboardCache';

// Import existing dashboard components
import BenefitPlanChart from './BenefitPlanChart';
import MapView from './MapView';
import TransfersChart from './TransfersChart';
import MonthlyTransferChart from './MonthlyTransferChart';
import ActivitiesChart from './ActivitiesChart';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
    position: 'relative',
  },
  container: {
    position: 'relative',
  },
  header: {
    marginBottom: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 700,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
  card: {
    height: '100%',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
  },
  performanceIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: '0.75rem',
    color: theme.palette.success.main,
    fontWeight: 600,
  },
}));

// Optimized GraphQL queries with field selection
const DASHBOARD_QUERY = `
  query DashboardData($filters: String!) {
    beneficiaryDashboard(filters: $filters) {
      totalBeneficiaries
      activeBeneficiaries
      suspendedBeneficiaries
      totalTransferAmount
      averageTransferAmount
      beneficiariesByProvince {
        province
        count
        amount
      }
      beneficiariesByPlan {
        planId
        planName
        count
        amount
      }
      monthlyTransfers {
        month
        count
        amount
      }
      demographicBreakdown {
        category
        value
        count
      }
    }
  }
`;

function EnhancedDashboard() {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const modulesManager = useModulesManager();

  const [filters, setFilters] = useState({
    provinces: [],
    districts: [],
    benefitPlans: [],
    year: new Date().getFullYear(),
  });
  const [loadTimes, setLoadTimes] = useState({});

  // Build GraphQL filter string
  const filterString = useMemo(() => {
    const filterParts = [];

    if (filters.provinces.length > 0) {
      filterParts.push(`provinces: ${JSON.stringify(filters.provinces)}`);
    }
    if (filters.districts.length > 0) {
      filterParts.push(`districts: ${JSON.stringify(filters.districts)}`);
    }
    if (filters.benefitPlans.length > 0) {
      filterParts.push(`benefitPlans: ${JSON.stringify(filters.benefitPlans)}`);
    }
    if (filters.year) {
      filterParts.push(`year: ${filters.year}`);
    }

    return filterParts.join(', ');
  }, [filters]);

  // Use cached dashboard data
  const {
    data: dashboardData,
    loading,
    error,
    isStale,
    refresh,
  } = useDashboardCache(
    async () => {
      const startTime = Date.now();
      const { data } = await modulesManager.getRef('core.GraphqlClient').query({
        query: DASHBOARD_QUERY,
        variables: { filters: filterString },
        fetchPolicy: 'network-only',
      });

      // Track load time
      setLoadTimes((prev) => ({
        ...prev,
        main: Date.now() - startTime,
      }));

      return data?.beneficiaryDashboard;
    },
    `dashboard-social-protection-${filterString}`,
    [filterString],
  );

  // Debounced filter handler
  const handleFiltersChange = useCallback(
    debounce((newFilters) => {
      setFilters(newFilters);
    }, 500),
    [],
  );

  // Loading skeleton
  const renderSkeleton = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper className={classes.loadingBox} style={{ height: 120 }}>
          <CircularProgress />
        </Paper>
      </Grid>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Paper className={classes.loadingBox} style={{ height: 200 }}>
            <CircularProgress />
          </Paper>
        </Grid>
      ))}
      <Grid item xs={12} md={8}>
        <Paper className={classes.loadingBox} style={{ height: 400 }}>
          <CircularProgress />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper className={classes.loadingBox} style={{ height: 400 }}>
          <CircularProgress />
        </Paper>
      </Grid>
    </Grid>
  );

  if (loading && !dashboardData) {
    return (
      <div className={classes.root}>
        <Container maxWidth="xl" className={classes.container}>
          {renderSkeleton()}
        </Container>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <Container maxWidth="xl" className={classes.container}>
        <Fade in timeout={600}>
          <Box className={classes.header}>
            <Typography variant="h4" className={classes.title}>
              <FormattedMessage id="socialProtection.dashboard.title" />
            </Typography>
            {loadTimes.main && (
              <Typography className={classes.performanceIndicator}>
                {loadTimes.main}
                ms
              </Typography>
            )}
          </Box>
        </Fade>

        {/* Key Indicators */}
        <Grow in timeout={800}>
          <Box className={classes.section}>
            <KeyIndicators
              data={dashboardData}
              loading={loading}
              isStale={isStale}
            />
          </Box>
        </Grow>

        {/* Main Dashboard Content */}
        <Grid container spacing={3}>
          {/* Map View */}
          <Grow in timeout={1000}>
            <Grid item xs={12} md={8}>
              <Paper className={classes.card}>
                <MapView
                  data={dashboardData?.beneficiariesByProvince}
                  loading={loading}
                  filters={filters}
                />
              </Paper>
            </Grid>
          </Grow>

          {/* Benefit Plan Distribution */}
          <Grow in timeout={1200}>
            <Grid item xs={12} md={4}>
              <Paper className={classes.card}>
                <BenefitPlanChart
                  data={dashboardData?.beneficiariesByPlan}
                  loading={loading}
                />
              </Paper>
            </Grid>
          </Grow>

          {/* Monthly Transfers */}
          <Grow in timeout={1400}>
            <Grid item xs={12} md={6}>
              <Paper className={classes.card}>
                <MonthlyTransferChart
                  data={dashboardData?.monthlyTransfers}
                  loading={loading}
                  year={filters.year}
                />
              </Paper>
            </Grid>
          </Grow>

          {/* Transfer Distribution */}
          <Grow in timeout={1600}>
            <Grid item xs={12} md={6}>
              <Paper className={classes.card}>
                <TransfersChart
                  data={dashboardData}
                  loading={loading}
                />
              </Paper>
            </Grid>
          </Grow>

          {/* Activities */}
          <Grow in timeout={1800}>
            <Grid item xs={12}>
              <Paper className={classes.card}>
                <ActivitiesChart
                  filters={filters}
                  loading={loading}
                />
              </Paper>
            </Grid>
          </Grow>
        </Grid>

        {/* Modern Filter System */}
        <ModernDashboardFilters
          onFiltersChange={handleFiltersChange}
          filterTypes={['location', 'benefitPlan', 'year']}
          defaultFilters={filters}
        />
      </Container>
    </div>
  );
}

export default EnhancedDashboard;
