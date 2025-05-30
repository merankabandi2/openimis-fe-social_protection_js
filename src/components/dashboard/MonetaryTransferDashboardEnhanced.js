import React, { useState, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';
import { useIntl, FormattedMessage } from 'react-intl';
import {
  Grid,
  Box,
  Typography,
  useTheme,
  Divider,
  Chip,
  Avatar,
  AvatarGroup,
} from '@material-ui/core';
import {
  AttachMoney,
  Receipt,
  People,
  TrendingUp,
  AccountBalance,
  Accessibility,
  Face,
  Wc,
  LocationOn,
  LocalOffer,
  Schedule,
  CheckCircle,
  Warning,
  Assessment,
  Group,
  Person,
} from '@material-ui/icons';
import ReactApexChart from 'react-apexcharts';
import { 
  useModulesManager,
  useGraphqlQuery,
  formatMessage,
  decodeId,
} from '@openimis/fe-core';
import BaseDashboard, { StatCard, ChartContainer } from './BaseDashboard';
import UnifiedDashboardFilters from './UnifiedDashboardFilters';
import MapComponent from './MapComponent';
import { MODULE_NAME } from '../../constants';
import { useDashboardCache } from '../../hooks/useDashboardCache';

// GraphQL Queries
const MONETARY_TRANSFER_DASHBOARD_QUERY = `
  query MonetaryTransferDashboard($filters: String) {
    benefitsSummary(filters: $filters) {
      totalTransfers
      totalAmount
      totalBeneficiaries
      averageTransferAmount
      completionRate
    }
    monetaryTransferBeneficiaryData(filters: $filters) {
      genderDistribution {
        male
        female
      }
      vulnerableGroups {
        twa
        refugees
        disabled
      }
      ageDistribution {
        category
        count
      }
    }
    transfersByStatus(filters: $filters) {
      status
      count
      amount
    }
    transfersByMonth(filters: $filters) {
      month
      transfers
      amount
      beneficiaries
    }
    transfersByProvince(filters: $filters) {
      province
      transfers
      amount
      beneficiaries
      latitude
      longitude
    }
    benefitPlans(filters: $filters) {
      edges {
        node {
          id
          code
          name
          type
          maxBeneficiaries
          budget
        }
      }
    }
  }
`;

const MonetaryTransferDashboardEnhanced = ({ rights, locations }) => {
  const theme = useTheme();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const [filters, setFilters] = useState({
    locations: [],
    benefitPlans: [],
    dateRange: { start: null, end: null },
    year: new Date().getFullYear(),
    transferStatus: [],
  });
  const [selectedMapData, setSelectedMapData] = useState(null);

  // Filter configuration
  const filterConfig = {
    locations: {
      filterType: 'location',
      component: 'location',
      type: 'array',
      locationLevel: 0,
    },
    benefitPlans: {
      filterType: 'benefitPlan',
      component: 'custom',
      type: 'array',
      renderComponent: (value, onChange) => (
        <PublishedComponent
          pubRef="socialProtection.BenefitPlanPicker"
          value={value}
          onChange={onChange}
          multiple
          readOnly={false}
        />
      ),
    },
    year: {
      filterType: 'year',
      component: 'year',
      type: 'number',
      minYear: 2020,
      maxYear: new Date().getFullYear() + 1,
    },
    dateRange: {
      filterType: 'dateRange',
      component: 'dateRange',
      type: 'object',
      default: { start: null, end: null },
    },
    transferStatus: {
      filterType: 'status',
      component: 'multiSelect',
      type: 'array',
      options: [
        { value: 'PENDING', labelKey: 'transfer.status.pending' },
        { value: 'APPROVED', labelKey: 'transfer.status.approved' },
        { value: 'TRANSFERRED', labelKey: 'transfer.status.transferred' },
        { value: 'FAILED', labelKey: 'transfer.status.failed' },
      ],
    },
  };

  // Build GraphQL filter string
  const filterString = useMemo(() => {
    const filterParts = [];
    
    if (filters.year) {
      filterParts.push(`year: ${filters.year}`);
    }
    if (Array.isArray(filters.locations) && filters.locations.length > 0) {
      filterParts.push(`parentLocation_In: ${JSON.stringify(filters.locations.map(l => l.id))}`);
      filterParts.push(`parentLocationLevel: 0`);
    }
    if (Array.isArray(filters.benefitPlans) && filters.benefitPlans.length > 0) {
      filterParts.push(`benefitPlan_In: ${JSON.stringify(filters.benefitPlans.map(bp => decodeId(bp.id)))}`);
    }
    if (filters.dateRange?.start) {
      filterParts.push(`transferDate_Gte: "${filters.dateRange.start.toISOString()}"`);
    }
    if (filters.dateRange?.end) {
      filterParts.push(`transferDate_Lte: "${filters.dateRange.end.toISOString()}"`);
    }
    if (Array.isArray(filters.transferStatus) && filters.transferStatus.length > 0) {
      filterParts.push(`status_In: ${JSON.stringify(filters.transferStatus)}`);
    }
    
    return filterParts.join(', ');
  }, [filters]);

  // Fetch dashboard data with caching
  const { data, loading, error, refresh } = useDashboardCache(
    async () => {
      const { data } = await modulesManager.getRef('core.GraphqlClient').query({
        query: MONETARY_TRANSFER_DASHBOARD_QUERY,
        variables: { filters: filterString },
        fetchPolicy: 'network-only',
      });
      return data;
    },
    `monetary-transfer-dashboard-${filterString}`,
    [filterString]
  );

  const dashboardData = data || {};
  const summary = dashboardData.benefitsSummary || {};
  const beneficiaryData = dashboardData.monetaryTransferBeneficiaryData || {};

  // Process data for charts
  const genderChartData = useMemo(() => {
    if (!beneficiaryData.genderDistribution) return [];
    return [
      { name: formatMessage(intl, MODULE_NAME, 'gender.male'), value: beneficiaryData.genderDistribution.male || 0 },
      { name: formatMessage(intl, MODULE_NAME, 'gender.female'), value: beneficiaryData.genderDistribution.female || 0 },
    ];
  }, [beneficiaryData, intl]);

  const statusChartData = useMemo(() => {
    if (!dashboardData.transfersByStatus) return [];
    return dashboardData.transfersByStatus.map(item => ({
      name: formatMessage(intl, MODULE_NAME, `transfer.status.${item.status}`),
      transfers: item.count,
      amount: item.amount,
    }));
  }, [dashboardData, intl]);

  const monthlyTrendData = useMemo(() => {
    if (!dashboardData.transfersByMonth) return [];
    return dashboardData.transfersByMonth.sort((a, b) => 
      new Date(a.month) - new Date(b.month)
    );
  }, [dashboardData]);

  const mapData = useMemo(() => {
    if (!dashboardData.transfersByProvince) return [];
    return dashboardData.transfersByProvince.map(item => ({
      name: item.province,
      coordinates: [item.longitude, item.latitude],
      value: item.amount,
      transfers: item.transfers,
      beneficiaries: item.beneficiaries,
    }));
  }, [dashboardData]);

  // Chart configurations
  const getDonutChartOptions = (title) => ({
    chart: {
      type: 'donut',
      fontFamily: theme.typography.fontFamily,
    },
    title: {
      text: title,
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: 600,
      },
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              fontSize: '16px',
              fontWeight: 600,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        return `${opts.w.config.series[opts.seriesIndex]} (${val.toFixed(1)}%)`;
      },
    },
  });

  const getAreaChartOptions = () => ({
    chart: {
      type: 'area',
      height: 350,
      fontFamily: theme.typography.fontFamily,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    xaxis: {
      categories: monthlyTrendData.map(t => t.month),
      labels: {
        formatter: function(value) {
          return new Date(value).toLocaleDateString('en-US', { month: 'short' });
        },
      },
    },
    yaxis: [
      {
        title: {
          text: formatMessage(intl, MODULE_NAME, 'dashboard.transfers'),
        },
      },
      {
        opposite: true,
        title: {
          text: formatMessage(intl, MODULE_NAME, 'dashboard.amount'),
        },
        labels: {
          formatter: function(val) {
            return '$' + val.toLocaleString();
          },
        },
      },
    ],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100]
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
  });

  // Export functionality
  const handleExport = () => {
    const exportData = {
      summary,
      beneficiaryData,
      transfersByStatus: dashboardData.transfersByStatus,
      transfersByMonth: dashboardData.transfersByMonth,
      transfersByProvince: dashboardData.transfersByProvince,
      exportDate: new Date().toISOString(),
      filters,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monetary-transfer-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Calculate change percentages
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
  };

  return (
    <BaseDashboard
      title={<FormattedMessage id="socialProtection.monetaryTransfer.dashboardTitle" />}
      subtitle={<FormattedMessage id="socialProtection.monetaryTransfer.dashboardSubtitle" />}
      module={MODULE_NAME}
      loading={loading}
      error={error}
      onRefresh={refresh}
      onExport={handleExport}
      filters={filters}
      onFiltersChange={setFilters}
      FilterComponent={UnifiedDashboardFilters}
      filterConfig={filterConfig}
      rights={rights}
      requiredRights={['159001', '159002']}
    >
      {/* Key Metrics */}
      <Grid container spacing={3} style={{ marginBottom: theme.spacing(3) }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Receipt}
            value={summary.totalTransfers || 0}
            label={formatMessage(intl, MODULE_NAME, 'dashboard.totalTransfers')}
            change={calculateChange(summary.totalTransfers, summary.previousPeriodTransfers)}
            color={theme.palette.primary.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={AttachMoney}
            value={summary.totalAmount || 0}
            label={formatMessage(intl, MODULE_NAME, 'dashboard.totalAmount')}
            format="currency"
            change={calculateChange(summary.totalAmount, summary.previousPeriodAmount)}
            color={theme.palette.success.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={People}
            value={summary.totalBeneficiaries || 0}
            label={formatMessage(intl, MODULE_NAME, 'dashboard.totalBeneficiaries')}
            change={calculateChange(summary.totalBeneficiaries, summary.previousPeriodBeneficiaries)}
            color={theme.palette.info.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={AccountBalance}
            value={summary.averageTransferAmount || 0}
            label={formatMessage(intl, MODULE_NAME, 'dashboard.averageAmount')}
            format="currency"
            color={theme.palette.warning.main}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Vulnerable Groups Stats */}
      <Grid container spacing={2} style={{ marginBottom: theme.spacing(3) }}>
        <Grid item xs={12} sm={4}>
          <Box display="flex" alignItems="center" gap={2} bgcolor="background.paper" p={2} borderRadius={1}>
            <Avatar style={{ backgroundColor: theme.palette.secondary.main }}>
              <Accessibility />
            </Avatar>
            <Box>
              <Typography variant="h6">{beneficiaryData.vulnerableGroups?.twa || 0}</Typography>
              <Typography variant="body2" color="textSecondary">
                {formatMessage(intl, MODULE_NAME, 'dashboard.twaBeneficiaries')}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box display="flex" alignItems="center" gap={2} bgcolor="background.paper" p={2} borderRadius={1}>
            <Avatar style={{ backgroundColor: theme.palette.info.main }}>
              <Group />
            </Avatar>
            <Box>
              <Typography variant="h6">{beneficiaryData.vulnerableGroups?.refugees || 0}</Typography>
              <Typography variant="body2" color="textSecondary">
                {formatMessage(intl, MODULE_NAME, 'dashboard.refugeeBeneficiaries')}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box display="flex" alignItems="center" gap={2} bgcolor="background.paper" p={2} borderRadius={1}>
            <Avatar style={{ backgroundColor: theme.palette.warning.main }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h6">{beneficiaryData.vulnerableGroups?.disabled || 0}</Typography>
              <Typography variant="body2" color="textSecondary">
                {formatMessage(intl, MODULE_NAME, 'dashboard.disabledBeneficiaries')}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} style={{ marginBottom: theme.spacing(3) }}>
        {/* Gender Distribution */}
        <Grid item xs={12} md={4}>
          <ChartContainer 
            title={formatMessage(intl, MODULE_NAME, 'dashboard.genderDistribution')}
            loading={loading}
          >
            <ReactApexChart
              options={{
                ...getDonutChartOptions(formatMessage(intl, MODULE_NAME, 'dashboard.byGender')),
                labels: genderChartData.map(d => d.name),
                colors: ['#2196f3', '#e91e63'],
              }}
              series={genderChartData.map(d => d.value)}
              type="donut"
              height={350}
            />
          </ChartContainer>
        </Grid>

        {/* Transfer Status Distribution */}
        <Grid item xs={12} md={4}>
          <ChartContainer 
            title={formatMessage(intl, MODULE_NAME, 'dashboard.transfersByStatus')}
            loading={loading}
          >
            <ReactApexChart
              options={{
                chart: {
                  type: 'bar',
                  fontFamily: theme.typography.fontFamily,
                },
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    distributed: true,
                  }
                },
                dataLabels: {
                  enabled: false,
                },
                xaxis: {
                  categories: statusChartData.map(d => d.name),
                },
                yaxis: {
                  title: {
                    text: formatMessage(intl, MODULE_NAME, 'dashboard.transfers'),
                  },
                },
                colors: statusChartData.map(d => {
                  if (d.name.includes('TRANSFERRED')) return theme.palette.success.main;
                  if (d.name.includes('APPROVED')) return theme.palette.info.main;
                  if (d.name.includes('PENDING')) return theme.palette.warning.main;
                  return theme.palette.error.main;
                }),
              }}
              series={[{
                name: formatMessage(intl, MODULE_NAME, 'dashboard.transfers'),
                data: statusChartData.map(d => d.transfers)
              }]}
              type="bar"
              height={350}
            />
          </ChartContainer>
        </Grid>

        {/* Age Distribution */}
        <Grid item xs={12} md={4}>
          <ChartContainer 
            title={formatMessage(intl, MODULE_NAME, 'dashboard.ageDistribution')}
            loading={loading}
          >
            <ReactApexChart
              options={{
                chart: {
                  type: 'pie',
                  fontFamily: theme.typography.fontFamily,
                },
                labels: beneficiaryData.ageDistribution?.map(d => d.category) || [],
                legend: {
                  position: 'bottom',
                },
                colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#dfe4ea'],
              }}
              series={beneficiaryData.ageDistribution?.map(d => d.count) || []}
              type="pie"
              height={350}
            />
          </ChartContainer>
        </Grid>
      </Grid>

      {/* Monthly Trends */}
      <Grid container spacing={3} style={{ marginBottom: theme.spacing(3) }}>
        <Grid item xs={12}>
          <ChartContainer 
            title={formatMessage(intl, MODULE_NAME, 'dashboard.monthlyTrends')}
            loading={loading}
          >
            <ReactApexChart
              options={getAreaChartOptions()}
              series={[
                {
                  name: formatMessage(intl, MODULE_NAME, 'dashboard.transfers'),
                  type: 'column',
                  data: monthlyTrendData.map(t => t.transfers)
                },
                {
                  name: formatMessage(intl, MODULE_NAME, 'dashboard.amount'),
                  type: 'area',
                  data: monthlyTrendData.map(t => t.amount)
                }
              ]}
              type="line"
              height={350}
            />
          </ChartContainer>
        </Grid>
      </Grid>

      {/* Geographic Distribution */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ChartContainer 
            title={formatMessage(intl, MODULE_NAME, 'dashboard.geographicDistribution')}
            loading={loading}
          >
            <MapComponent 
              data={mapData}
              onLocationClick={setSelectedMapData}
              height={400}
            />
          </ChartContainer>
        </Grid>
      </Grid>

      {/* Selected Location Details */}
      {selectedMapData && (
        <Box mt={3} p={2} bgcolor="background.paper" borderRadius={1}>
          <Typography variant="h6" gutterBottom>
            <LocationOn style={{ verticalAlign: 'middle', marginRight: 8 }} />
            {selectedMapData.name}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">
                {formatMessage(intl, MODULE_NAME, 'dashboard.transfers')}
              </Typography>
              <Typography variant="h6">{selectedMapData.transfers}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">
                {formatMessage(intl, MODULE_NAME, 'dashboard.amount')}
              </Typography>
              <Typography variant="h6">${selectedMapData.value.toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">
                {formatMessage(intl, MODULE_NAME, 'dashboard.beneficiaries')}
              </Typography>
              <Typography variant="h6">{selectedMapData.beneficiaries}</Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Benefit Plans Summary */}
      {dashboardData.benefitPlans?.edges?.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            {formatMessage(intl, MODULE_NAME, 'dashboard.activeBenefitPlans')}
          </Typography>
          <Divider style={{ marginBottom: theme.spacing(2) }} />
          <Grid container spacing={2}>
            {dashboardData.benefitPlans.edges.map(({ node: plan }) => (
              <Grid item xs={12} sm={6} md={4} key={plan.id}>
                <Box
                  p={2}
                  bgcolor="background.paper"
                  borderRadius={1}
                  boxShadow={1}
                  display="flex"
                  flexDirection="column"
                  gap={1}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocalOffer color="primary" />
                    <Typography variant="subtitle1" style={{ fontWeight: 500 }}>
                      {plan.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {plan.code}
                  </Typography>
                  <Box display="flex" gap={2}>
                    <Chip
                      size="small"
                      label={`${plan.maxBeneficiaries} ${formatMessage(intl, MODULE_NAME, 'dashboard.beneficiaries')}`}
                      icon={<People />}
                    />
                    <Chip
                      size="small"
                      label={`$${plan.budget?.toLocaleString()}`}
                      icon={<AttachMoney />}
                      color="primary"
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </BaseDashboard>
  );
};

const mapStateToProps = (state) => ({
  rights: state.core.user?.i_user?.rights || [],
  locations: state.core.locations,
});

export default connect(mapStateToProps)(MonetaryTransferDashboardEnhanced);