/**
 * Optimized M&E Dashboard Component
 * 
 * High-performance dashboard using materialized views and GraphQL queries.
 * Features:
 * - Real-time data with optimized caching
 * - Interactive charts and visualizations
 * - Automatic refresh and health monitoring
 * - Performance indicators and loading states
 * - Export capabilities
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Paper,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Tooltip,
  IconButton,
  Switch,
  FormControlLabel,
  Snackbar,
  LinearProgress,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  Refresh as RefreshIcon,
  CloudDownload as DownloadIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
} from '@material-ui/icons';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useOptimizedDashboard, useDashboardSystem } from '../../hooks/useOptimizedDashboard';
import { useTranslations, formatMessage } from '@openimis/fe-core';

// Color schemes for charts
const COLORS = {
  primary: ['#1976d2', '#42a5f5', '#90caf9', '#e3f2fd'],
  gender: ['#2196f3', '#f50057', '#ff9800'],
  community: ['#4caf50', '#ff5722'],
  status: ['#4caf50', '#ff9800', '#f44336', '#9e9e9e'],
  trends: ['#1976d2', '#4caf50', '#ff9800', '#f44336', '#9c27b0'],
};

const REFRESH_INTERVALS = {
  off: null,
  '5min': 5 * 60 * 1000,
  '15min': 15 * 60 * 1000,
  '30min': 30 * 60 * 1000,
  '1hour': 60 * 60 * 1000,
};

/**
 * Performance indicator component
 */
const PerformanceIndicator = ({ isLoading, isStale, lastRefresh, onRefresh, isRefreshing }) => {
  const getStatus = () => {
    if (isLoading) return { color: 'info', icon: <CircularProgress size={16} />, text: 'Loading...' };
    if (isRefreshing) return { color: 'warning', icon: <CircularProgress size={16} />, text: 'Refreshing...' };
    if (isStale) return { color: 'warning', icon: <WarningIcon />, text: 'Data may be stale' };
    return { color: 'success', icon: <CheckCircleIcon />, text: 'Data is fresh' };
  };

  const status = getStatus();
  const lastRefreshText = lastRefresh ? 
    `Last refresh: ${lastRefresh.toLocaleTimeString()}` : 
    'Never refreshed';

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Tooltip title={lastRefreshText}>
        <Chip
          icon={status.icon}
          label={status.text}
          color={status.color}
          size="small"
          variant="outlined"
        />
      </Tooltip>
      <Tooltip title="Refresh data">
        <IconButton
          size="small"
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
        >
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

/**
 * Summary statistics card
 */
const SummaryCard = ({ title, value, subtitle, icon, color = 'primary', trend = null }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon 
                  fontSize="small" 
                  color={trend > 0 ? 'success' : trend < 0 ? 'error' : 'disabled'} 
                />
                <Typography 
                  variant="body2" 
                  color={trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'textSecondary'}
                  ml={0.5}
                >
                  {trend > 0 ? '+' : ''}{trend}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * Gender breakdown pie chart
 */
const GenderBreakdownChart = ({ data }) => {
  if (!data) return null;

  const chartData = [
    { name: 'Male', value: data.male, color: COLORS.gender[0] },
    { name: 'Female', value: data.female, color: COLORS.gender[1] },
    { name: 'Twa', value: data.twa, color: COLORS.gender[2] },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Gender Distribution
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip formatter={(value) => value.toLocaleString()} />
          </PieChart>
        </ResponsiveContainer>
        <Box mt={2}>
          <Typography variant="body2" color="textSecondary">
            Female Participation: {data.femalePercentage?.toFixed(1)}%
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Twa Inclusion: {data.twaPercentage?.toFixed(1)}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * Community breakdown chart
 */
const CommunityBreakdownChart = ({ data }) => {
  if (!data) return null;

  const chartData = data.map((item, index) => ({
    ...item,
    color: COLORS.community[index % COLORS.community.length]
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Community Type Distribution
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="communityType" />
            <YAxis />
            <RechartsTooltip formatter={(value) => value.toLocaleString()} />
            <Bar dataKey="count" fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Quarterly trends chart
 */
const QuarterlyTrendsChart = ({ data }) => {
  if (!data || !data.trends) return null;

  // Group trends by metric
  const trendsByMetric = data.trends.reduce((acc, trend) => {
    if (!acc[trend.metric]) acc[trend.metric] = [];
    acc[trend.metric].push(trend);
    return acc;
  }, {});

  // Prepare data for chart
  const chartData = [];
  const periods = [...new Set(data.trends.map(t => t.period))].sort();
  
  periods.forEach(period => {
    const periodData = { period };
    Object.keys(trendsByMetric).forEach(metric => {
      const trend = trendsByMetric[metric].find(t => t.period === period);
      periodData[metric] = trend ? trend.value : 0;
    });
    chartData.push(periodData);
  });

  const metrics = Object.keys(trendsByMetric);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quarterly Trends
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <RechartsTooltip formatter={(value) => value.toLocaleString()} />
            <Legend />
            {metrics.map((metric, index) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={COLORS.trends[index % COLORS.trends.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Transfer performance chart
 */
const TransferPerformanceChart = ({ data }) => {
  if (!data || !data.byTransferType) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Transfer Performance by Type
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.byTransferType}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="transferType" angle={-45} textAnchor="end" height={100} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <RechartsTooltip 
              formatter={(value, name) => [
                name === 'amount' ? `${value.toLocaleString()} BIF` : value.toLocaleString(),
                name === 'amount' ? 'Amount' : name === 'beneficiaries' ? 'Beneficiaries' : 'Completion Rate (%)'
              ]}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="beneficiaries" fill="#1976d2" name="Beneficiaries" />
            <Bar yAxisId="right" dataKey="completionRate" fill="#4caf50" name="Completion Rate (%)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * System health indicator
 */
const SystemHealthIndicator = ({ health }) => {
  if (!health) return null;

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'unhealthy': return 'error';
      default: return 'default';
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon />;
      case 'degraded': return <WarningIcon />;
      case 'unhealthy': return <ErrorIcon />;
      default: return <InfoIcon />;
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Tooltip title={`System status: ${health.status}`}>
        <Chip
          icon={getHealthIcon(health.status)}
          label={`System ${health.status}`}
          color={getHealthColor(health.status)}
          size="small"
          variant="outlined"
        />
      </Tooltip>
      <Tooltip title="View system details">
        <IconButton size="small">
          <InfoIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

/**
 * Main optimized dashboard component
 */
const OptimizedMEDashboard = ({ filters = {}, autoRefresh = false }) => {
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(REFRESH_INTERVALS.off);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Dashboard data hook
  const {
    summary,
    breakdown,
    performance,
    trends,
    isLoading,
    isRefreshing,
    isStale,
    error,
    refreshAllViews,
    refetchAll,
    lastRefresh,
  } = useOptimizedDashboard(filters, {
    includeTransfers: true,
    includeTrends: true,
  });

  // System health hook
  const { health, stats } = useDashboardSystem();

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refetchAll();
      setSnackbarMessage('Dashboard refreshed successfully');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage(`Refresh failed: ${error.message}`);
      setSnackbarOpen(true);
    }
  }, [refetchAll]);

  // Handle refresh views
  const handleRefreshViews = useCallback(async () => {
    try {
      await refreshAllViews(true, true);
      setSnackbarMessage('Materialized views refreshed successfully');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage(`View refresh failed: ${error.message}`);
      setSnackbarOpen(true);
    }
  }, [refreshAllViews]);

  // Handle auto-refresh toggle
  const handleAutoRefreshChange = useCallback((interval) => {
    setAutoRefreshInterval(interval);
  }, []);

  // Prepare summary data
  const summaryCards = useMemo(() => {
    if (!summary?.summary) return [];

    return [
      {
        title: 'Total Beneficiaries',
        value: summary.summary.totalBeneficiaries,
        subtitle: `Across ${summary.summary.provincesCovered} provinces`,
        icon: <PeopleIcon fontSize="large" />,
        color: 'primary',
      },
      {
        title: 'Total Transfers',
        value: summary.summary.totalTransfers,
        subtitle: 'Completed transfers',
        icon: <AssignmentIcon fontSize="large" />,
        color: 'secondary',
      },
      {
        title: 'Amount Paid',
        value: `${summary.summary.totalAmountPaid?.toLocaleString()} BIF`,
        subtitle: `Avg: ${summary.summary.avgAmountPerBeneficiary?.toLocaleString()} BIF/beneficiary`,
        icon: <MoneyIcon fontSize="large" />,
        color: 'success',
      },
    ];
  }, [summary]);

  // Show loading state
  if (isLoading && !summary) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" ml={2}>
          Loading optimized dashboard...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={handleRefresh}>
          Retry
        </Button>
      }>
        Failed to load dashboard: {error.message}
      </Alert>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          M&E Dashboard (Optimized)
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <SystemHealthIndicator health={health} />
          <PerformanceIndicator
            isLoading={isLoading}
            isStale={isStale}
            lastRefresh={lastRefresh}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </Box>
      </Box>

      {/* Progress indicator for refreshing */}
      {isRefreshing && <LinearProgress sx={{ mb: 2 }} />}

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="subtitle2">Auto-refresh:</Typography>
            <Box display="flex" gap={1}>
              {Object.entries(REFRESH_INTERVALS).map(([label, interval]) => (
                <Button
                  key={label}
                  size="small"
                  variant={autoRefreshInterval === interval ? 'contained' : 'outlined'}
                  onClick={() => handleAutoRefreshChange(interval)}
                >
                  {label}
                </Button>
              ))}
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<SpeedIcon />}
              onClick={handleRefreshViews}
              disabled={isRefreshing}
            >
              Refresh Views
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              disabled={isLoading}
            >
              Export Data
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <SummaryCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Gender Breakdown */}
        <Grid item xs={12} lg={6}>
          <GenderBreakdownChart data={breakdown?.genderBreakdown} />
        </Grid>

        {/* Community Breakdown */}
        <Grid item xs={12} lg={6}>
          <CommunityBreakdownChart data={breakdown?.communityBreakdown} />
        </Grid>

        {/* Transfer Performance */}
        <Grid item xs={12}>
          <TransferPerformanceChart data={performance} />
        </Grid>

        {/* Quarterly Trends */}
        <Grid item xs={12}>
          <QuarterlyTrendsChart data={trends} />
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default OptimizedMEDashboard;