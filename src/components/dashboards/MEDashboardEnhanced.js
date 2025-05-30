import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import {
  Grid,
  Box,
  Typography,
  useTheme,
  Divider,
} from '@material-ui/core';
import {
  People,
  WcOutlined,
  EmojiPeople,
  Assessment,
  Group,
  LocalOffer,
  TrendingUp,
  HomeWork,
  Nature,
} from '@material-ui/icons';
import ReactApexChart from 'react-apexcharts';
import { 
  useModulesManager,
  formatMessage,
  baseApiUrl,
  apiHeaders,
} from '@openimis/fe-core';
import { useIntl } from 'react-intl';
import BaseDashboard, { StatCard, ChartContainer } from './BaseDashboard';
import UnifiedDashboardFilters from './UnifiedDashboardFilters';
import { useDashboardCache } from '../../hooks/useDashboardCache';
import * as XLSX from 'xlsx';

const MODULE_NAME = 'socialProtection';
const REQUESTED_WITH = 'webapp';

// API Endpoints
const API_ENDPOINTS = {
  summary: '/api/social-protection/me/dashboard/summary/',
  beneficiary: '/api/social-protection/me/dashboard/beneficiary/',
  refugee: '/api/social-protection/me/dashboard/refugee/',
  quarterly: '/api/social-protection/me/dashboard/quarterly/',
  twametrics: '/api/social-protection/me/dashboard/twametrics/',
  aggregated: '/api/social-protection/me/dashboard/aggregated/',
};

const MEDashboardEnhanced = ({ rights }) => {
  const theme = useTheme();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const [filters, setFilters] = useState({
    locations: [],
    dateRange: { start: null, end: null },
    year: new Date().getFullYear(),
    autoAggregate: false,
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [loadTime, setLoadTime] = useState(null);

  // Filter configuration
  const filterConfig = {
    locations: {
      filterType: 'location',
      component: 'location',
      type: 'array',
      locationLevel: 0, // Province level
    },
    dateRange: {
      filterType: 'dateRange',
      component: 'dateRange',
      type: 'object',
      default: { start: null, end: null },
    },
    year: {
      filterType: 'year',
      component: 'year',
      type: 'number',
      minYear: 2020,
      maxYear: new Date().getFullYear() + 1,
    },
    autoAggregate: {
      filterType: 'boolean',
      component: 'boolean',
      type: 'boolean',
      default: false,
    },
  };

  // Build query parameters
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    
    if (filters.locations?.length > 0) {
      params.append('location_ids', filters.locations.map(l => l.id).join(','));
    }
    if (filters.dateRange?.start) {
      params.append('start_date', filters.dateRange.start.toISOString().split('T')[0]);
    }
    if (filters.dateRange?.end) {
      params.append('end_date', filters.dateRange.end.toISOString().split('T')[0]);
    }
    if (filters.year) {
      params.append('year', filters.year);
    }
    if (filters.autoAggregate) {
      params.append('auto_aggregate', 'true');
    }
    
    return params.toString();
  }, [filters]);

  // Fetch dashboard data with caching
  const { data, loading, error, refresh } = useDashboardCache(
    async () => {
      const startTime = Date.now();
      const endpoint = filters.autoAggregate ? API_ENDPOINTS.aggregated : API_ENDPOINTS.summary;
      
      const response = await fetch(
        `${baseApiUrl}${endpoint}?${queryParams}`,
        {
          method: 'GET',
          headers: {
            ...apiHeaders,
            'X-Requested-With': REQUESTED_WITH,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Fetch additional data if not auto-aggregated
      if (!filters.autoAggregate && data.success) {
        const [beneficiaryData, refugeeData, quarterlyData, twaData] = await Promise.all([
          fetch(`${baseApiUrl}${API_ENDPOINTS.beneficiary}?${queryParams}`, {
            headers: { ...apiHeaders, 'X-Requested-With': REQUESTED_WITH },
          }).then(res => res.json()),
          fetch(`${baseApiUrl}${API_ENDPOINTS.refugee}?${queryParams}`, {
            headers: { ...apiHeaders, 'X-Requested-With': REQUESTED_WITH },
          }).then(res => res.json()),
          fetch(`${baseApiUrl}${API_ENDPOINTS.quarterly}?${queryParams}`, {
            headers: { ...apiHeaders, 'X-Requested-With': REQUESTED_WITH },
          }).then(res => res.json()),
          fetch(`${baseApiUrl}${API_ENDPOINTS.twametrics}?${queryParams}`, {
            headers: { ...apiHeaders, 'X-Requested-With': REQUESTED_WITH },
          }).then(res => res.json()),
        ]);
        
        data.beneficiaryData = beneficiaryData.data;
        data.refugeeData = refugeeData.data;
        data.quarterlyData = quarterlyData.data;
        data.twaData = twaData.data;
      }
      
      setLoadTime(Date.now() - startTime);
      return data;
    },
    `me-dashboard-${queryParams}`,
    [queryParams]
  );

  useEffect(() => {
    if (data) {
      setDashboardData(data.data || data);
    }
  }, [data]);

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
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
  });

  const getBarChartOptions = (categories) => ({
    chart: {
      type: 'bar',
      fontFamily: theme.typography.fontFamily,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories,
    },
    yaxis: {
      title: {
        text: formatMessage(intl, MODULE_NAME, 'dashboard.beneficiaries'),
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " " + formatMessage(intl, MODULE_NAME, 'dashboard.beneficiaries');
        },
      },
    },
  });

  // Export functionality
  const handleExport = () => {
    if (!dashboardData) return;
    
    const wb = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Beneficiaries', dashboardData.totalBeneficiaries || 0],
      ['Total Amount', dashboardData.totalAmount || 0],
      ['Average per Beneficiary', dashboardData.averagePerBeneficiary || 0],
      ['Communities Covered', dashboardData.communitiesCovered || 0],
      ['Export Date', new Date().toLocaleDateString()],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    
    // Gender distribution sheet
    if (dashboardData.genderDistribution) {
      const genderData = [
        ['Gender', 'Count', 'Percentage'],
        ...Object.entries(dashboardData.genderDistribution).map(([gender, count]) => [
          gender,
          count,
          `${((count / dashboardData.totalBeneficiaries) * 100).toFixed(2)}%`
        ])
      ];
      const genderSheet = XLSX.utils.aoa_to_sheet(genderData);
      XLSX.utils.book_append_sheet(wb, genderSheet, 'Gender Distribution');
    }
    
    // Quarterly trends sheet
    if (dashboardData.quarterlyData) {
      const quarterlyData = [
        ['Quarter', 'Beneficiaries', 'Amount'],
        ...dashboardData.quarterlyData.map(q => [q.quarter, q.beneficiaries, q.amount])
      ];
      const quarterlySheet = XLSX.utils.aoa_to_sheet(quarterlyData);
      XLSX.utils.book_append_sheet(wb, quarterlySheet, 'Quarterly Trends');
    }
    
    // Export file
    XLSX.writeFile(wb, `me-dashboard-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Process data for charts
  const genderData = useMemo(() => {
    if (!dashboardData?.genderDistribution) return [];
    return Object.entries(dashboardData.genderDistribution).map(([gender, count]) => ({
      name: formatMessage(intl, MODULE_NAME, `gender.${gender}`),
      value: count,
    }));
  }, [dashboardData, intl]);

  const minorityData = useMemo(() => {
    if (!dashboardData?.twaData) return [];
    return [
      { name: 'Twa', value: dashboardData.twaData.twaCount || 0 },
      { name: 'Non-Twa', value: (dashboardData.totalBeneficiaries || 0) - (dashboardData.twaData.twaCount || 0) },
    ];
  }, [dashboardData]);

  const quarterlyData = useMemo(() => {
    if (!dashboardData?.quarterlyData) return [];
    return dashboardData.quarterlyData;
  }, [dashboardData]);

  const communityData = useMemo(() => {
    if (!dashboardData?.communityTypes) return [];
    return Object.entries(dashboardData.communityTypes).map(([type, count]) => ({
      name: formatMessage(intl, MODULE_NAME, `community.${type}`),
      value: count,
    }));
  }, [dashboardData, intl]);

  return (
    <BaseDashboard
      title={formatMessage(intl, MODULE_NAME, 'medashboard.title')}
      subtitle={formatMessage(intl, MODULE_NAME, 'medashboard.subtitle')}
      module={MODULE_NAME}
      loading={loading}
      error={error}
      onRefresh={refresh}
      onExport={handleExport}
      loadTime={loadTime}
      filters={filters}
      onFiltersChange={setFilters}
      FilterComponent={UnifiedDashboardFilters}
      filterConfig={filterConfig}
      rights={rights}
      requiredRights={['159001', '159002']} // Social protection view rights
    >
      {/* Key Metrics */}
      <Grid container spacing={3} style={{ marginBottom: theme.spacing(3) }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={People}
            value={dashboardData?.totalBeneficiaries || 0}
            label={formatMessage(intl, MODULE_NAME, 'dashboard.totalBeneficiaries')}
            color={theme.palette.primary.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={LocalOffer}
            value={dashboardData?.totalAmount || 0}
            label={formatMessage(intl, MODULE_NAME, 'dashboard.totalAmount')}
            format="currency"
            color={theme.palette.success.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Assessment}
            value={dashboardData?.averagePerBeneficiary || 0}
            label={formatMessage(intl, MODULE_NAME, 'dashboard.averagePerBeneficiary')}
            format="currency"
            color={theme.palette.info.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={HomeWork}
            value={dashboardData?.communitiesCovered || 0}
            label={formatMessage(intl, MODULE_NAME, 'dashboard.communitiesCovered')}
            color={theme.palette.warning.main}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Secondary Metrics */}
      <Grid container spacing={3} style={{ marginBottom: theme.spacing(3) }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={Group}
            value={dashboardData?.refugeeData?.refugeeCount || 0}
            label={formatMessage(intl, MODULE_NAME, 'dashboard.refugeeBeneficiaries')}
            color={theme.palette.secondary.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={EmojiPeople}
            value={dashboardData?.twaData?.twaCount || 0}
            label={formatMessage(intl, MODULE_NAME, 'dashboard.twaBeneficiaries')}
            color={theme.palette.primary.dark}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={TrendingUp}
            value={dashboardData?.growthRate || 0}
            label={formatMessage(intl, MODULE_NAME, 'dashboard.growthRate')}
            format="percentage"
            color={theme.palette.success.dark}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Gender Distribution */}
        <Grid item xs={12} md={6}>
          <ChartContainer 
            title={formatMessage(intl, MODULE_NAME, 'dashboard.genderDistribution')}
            loading={loading}
          >
            <ReactApexChart
              options={{
                ...getDonutChartOptions(formatMessage(intl, MODULE_NAME, 'dashboard.byGender')),
                labels: genderData.map(d => d.name),
                colors: ['#2196f3', '#e91e63'],
              }}
              series={genderData.map(d => d.value)}
              type="donut"
              height={350}
            />
          </ChartContainer>
        </Grid>

        {/* Minority Groups */}
        <Grid item xs={12} md={6}>
          <ChartContainer 
            title={formatMessage(intl, MODULE_NAME, 'dashboard.minorityGroups')}
            loading={loading}
          >
            <ReactApexChart
              options={{
                ...getDonutChartOptions(formatMessage(intl, MODULE_NAME, 'dashboard.byMinority')),
                labels: minorityData.map(d => d.name),
                colors: ['#9c27b0', '#e0e0e0'],
              }}
              series={minorityData.map(d => d.value)}
              type="donut"
              height={350}
            />
          </ChartContainer>
        </Grid>

        {/* Quarterly Trends */}
        <Grid item xs={12}>
          <ChartContainer 
            title={formatMessage(intl, MODULE_NAME, 'dashboard.quarterlyTrends')}
            loading={loading}
          >
            <ReactApexChart
              options={{
                ...getBarChartOptions(quarterlyData.map(q => q.quarter)),
                colors: [theme.palette.primary.main, theme.palette.success.main],
              }}
              series={[
                {
                  name: formatMessage(intl, MODULE_NAME, 'dashboard.beneficiaries'),
                  data: quarterlyData.map(q => q.beneficiaries),
                },
                {
                  name: formatMessage(intl, MODULE_NAME, 'dashboard.amount'),
                  data: quarterlyData.map(q => q.amount),
                },
              ]}
              type="bar"
              height={350}
            />
          </ChartContainer>
        </Grid>

        {/* Community Types */}
        <Grid item xs={12} md={6}>
          <ChartContainer 
            title={formatMessage(intl, MODULE_NAME, 'dashboard.communityTypes')}
            loading={loading}
          >
            <ReactApexChart
              options={{
                chart: {
                  type: 'pie',
                  fontFamily: theme.typography.fontFamily,
                },
                labels: communityData.map(d => d.name),
                colors: ['#ffd93d', '#6bcf7f', '#ff6b6b', '#4ecdc4'],
                legend: {
                  position: 'bottom',
                },
              }}
              series={communityData.map(d => d.value)}
              type="pie"
              height={350}
            />
          </ChartContainer>
        </Grid>

        {/* Refugee Distribution by Location */}
        {dashboardData?.refugeeData?.locationDistribution && (
          <Grid item xs={12} md={6}>
            <ChartContainer 
              title={formatMessage(intl, MODULE_NAME, 'dashboard.refugeeByLocation')}
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
                      horizontal: true,
                      dataLabels: {
                        position: 'top',
                      },
                    }
                  },
                  dataLabels: {
                    enabled: true,
                    offsetX: -6,
                    style: {
                      fontSize: '12px',
                      colors: ['#fff']
                    }
                  },
                  xaxis: {
                    categories: Object.keys(dashboardData.refugeeData.locationDistribution),
                  },
                  colors: [theme.palette.secondary.main],
                }}
                series={[{
                  name: formatMessage(intl, MODULE_NAME, 'dashboard.refugees'),
                  data: Object.values(dashboardData.refugeeData.locationDistribution)
                }]}
                type="bar"
                height={350}
              />
            </ChartContainer>
          </Grid>
        )}
      </Grid>

      {/* Summary Statistics */}
      {dashboardData?.detailedMetrics && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            {formatMessage(intl, MODULE_NAME, 'dashboard.detailedMetrics')}
          </Typography>
          <Divider style={{ marginBottom: theme.spacing(2) }} />
          <Grid container spacing={2}>
            {Object.entries(dashboardData.detailedMetrics).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={3} key={key}>
                <Box p={2} bgcolor="background.paper" borderRadius={1}>
                  <Typography variant="body2" color="textSecondary">
                    {formatMessage(intl, MODULE_NAME, `dashboard.metric.${key}`)}
                  </Typography>
                  <Typography variant="h6">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </Typography>
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
});

export default connect(mapStateToProps)(MEDashboardEnhanced);