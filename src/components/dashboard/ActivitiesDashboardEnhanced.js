import React, { useState, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';
import { useIntl, FormattedMessage } from 'react-intl';
import {
  Grid,
  Box,
  Typography,
  Tabs,
  Tab,
  Badge,
  Chip,
  useTheme,
  Avatar,
  AvatarGroup,
} from '@material-ui/core';
import {
  School,
  GroupWork,
  Build,
  People,
  LocationOn,
  Event,
  TrendingUp,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Assessment,
  Face,
  Wc,
  Accessibility,
  Eco,
  Pets,
  Storefront,
  MonetizationOn,
  LocalFlorist,
} from '@material-ui/icons';
import ReactApexChart from 'react-apexcharts';
import {
  useModulesManager,
  formatMessage,
  baseApiUrl,
  apiHeaders,
} from '@openimis/fe-core';
import BaseDashboard, { StatCard, ChartContainer } from './BaseDashboard';
import UnifiedDashboardFilters from './UnifiedDashboardFilters';
import { MODULE_NAME } from '../../constants';

// Activity types
const ACTIVITY_TYPES = {
  SENSITIZATION: 'sensitization',
  BEHAVIOR_CHANGE: 'behaviorChange',
  MICRO_PROJECTS: 'microProjects',
};

// Project category icons
const projectCategoryIcons = {
  agriculture: Eco,
  livestock: Pets,
  commerce: Storefront,
  crafts: Build,
  services: GroupWork,
  other: MonetizationOn,
};

const REQUESTED_WITH = 'webapp';

function ActivitiesDashboardEnhanced({ rights }) {
  const theme = useTheme();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    locations: [],
    dateRange: { start: null, end: null },
    validationStatus: [],
    projectCategories: [],
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter configuration
  const filterConfig = {
    locations: {
      filterType: 'location',
      component: 'location',
      type: 'array',
      locationLevel: 0,
    },
    dateRange: {
      filterType: 'dateRange',
      component: 'dateRange',
      type: 'object',
      default: { start: null, end: null },
    },
    validationStatus: {
      filterType: 'status',
      component: 'multiSelect',
      type: 'array',
      options: [
        { value: 'PENDING', labelKey: 'activities.status.pending' },
        { value: 'VALIDATED', labelKey: 'activities.status.validated' },
        { value: 'REJECTED', labelKey: 'activities.status.rejected' },
      ],
    },
    projectCategories: {
      filterType: 'category',
      component: 'multiSelect',
      type: 'array',
      options: [
        { value: 'agriculture', labelKey: 'activities.category.agriculture' },
        { value: 'livestock', labelKey: 'activities.category.livestock' },
        { value: 'commerce', labelKey: 'activities.category.commerce' },
        { value: 'crafts', labelKey: 'activities.category.crafts' },
        { value: 'services', labelKey: 'activities.category.services' },
      ],
    },
  };

  // Build GraphQL filter string
  const filterString = useMemo(() => {
    const filterParts = [];

    if (Array.isArray(filters.locations) && filters.locations.length > 0) {
      filterParts.push(`location_Uuid: "${filters.locations[0].uuid}"`);
    }
    if (filters.dateRange?.start) {
      filterParts.push(`sensitizationDate_Gte: "${filters.dateRange.start.toISOString().split('T')[0]}"`);
      filterParts.push(`reportDate_Gte: "${filters.dateRange.start.toISOString().split('T')[0]}"`);
    }
    if (filters.dateRange?.end) {
      filterParts.push(`sensitizationDate_Lte: "${filters.dateRange.end.toISOString().split('T')[0]}"`);
      filterParts.push(`reportDate_Lte: "${filters.dateRange.end.toISOString().split('T')[0]}"`);
    }
    if (Array.isArray(filters.validationStatus) && filters.validationStatus.length > 0) {
      filterParts.push(`validationStatus: "${filters.validationStatus[0]}"`);
    }

    return filterParts.length > 0 ? `(${filterParts.join(', ')})` : '';
  }, [filters]);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    const csrfToken = localStorage.getItem('csrfToken');
    const baseHeaders = apiHeaders();
    
    try {
      const response = await fetch(`${baseApiUrl}/graphql`, {
        method: 'post',
        headers: { ...baseHeaders, 'X-Requested-With': REQUESTED_WITH, 'X-CSRFToken': csrfToken },
        body: JSON.stringify({
          query: `
            {
              sensitizationTraining${filterString} {
                edges {
                  node {
                    id
                    sensitizationDate
                    location {
                      id
                      name
                      code
                      parent {
                        name
                      }
                    }
                    category
                    modules
                    facilitator
                    maleParticipants
                    femaleParticipants
                    twaParticipants
                    observations
                    validationStatus
                    validationStatusDisplay
                    validatedBy {
                      username
                    }
                    validationDate
                    validationComment
                  }
                }
              }
              behaviorChangePromotion${filterString} {
                edges {
                  node {
                    id
                    reportDate
                    location {
                      id
                      name
                      code
                      parent {
                        name
                      }
                    }
                    maleParticipants
                    femaleParticipants
                    twaParticipants
                    comments
                    validationStatus
                    validationStatusDisplay
                    validatedBy {
                      username
                    }
                    validationDate
                    validationComment
                  }
                }
              }
              microProject${filterString} {
                edges {
                  node {
                    id
                    reportDate
                    location {
                      id
                      name
                      code
                      parent {
                        name
                      }
                    }
                    maleParticipants
                    femaleParticipants
                    twaParticipants
                    agricultureBeneficiaries
                    livestockBeneficiaries
                    livestockGoatBeneficiaries
                    livestockPigBeneficiaries
                    livestockRabbitBeneficiaries
                    livestockPoultryBeneficiaries
                    livestockCattleBeneficiaries
                    commerceServicesBeneficiaries
                    validationStatus
                    validationStatusDisplay
                    validatedBy {
                      username
                    }
                    validationDate
                    validationComment
                  }
                }
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activities data');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err);
      console.error('Failed to load activities data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterString]);

  // Process activity data
  const processedData = useMemo(() => {
    if (!data) return null;

    const sensitization = data.sensitizationTraining?.edges?.map((e) => e.node) || [];
    const behaviorChange = data.behaviorChangePromotion?.edges?.map((e) => e.node) || [];
    const microProjects = data.microProject?.edges?.map((e) => e.node) || [];

    // Calculate statistics
    const stats = {
      sensitization: {
        total: sensitization.length,
        participants: sensitization.reduce((sum, a) => sum + (a.maleParticipants || 0) + (a.femaleParticipants || 0) + (a.twaParticipants || 0), 0),
        maleParticipants: sensitization.reduce((sum, a) => sum + (a.maleParticipants || 0), 0),
        femaleParticipants: sensitization.reduce((sum, a) => sum + (a.femaleParticipants || 0), 0),
        twaParticipants: sensitization.reduce((sum, a) => sum + (a.twaParticipants || 0), 0),
        approved: sensitization.filter((a) => a.validationStatus === 'VALIDATED').length,
        pending: sensitization.filter((a) => a.validationStatus === 'PENDING').length,
      },
      behaviorChange: {
        total: behaviorChange.length,
        participants: behaviorChange.reduce((sum, a) => sum + (a.maleParticipants || 0) + (a.femaleParticipants || 0) + (a.twaParticipants || 0), 0),
        maleParticipants: behaviorChange.reduce((sum, a) => sum + (a.maleParticipants || 0), 0),
        femaleParticipants: behaviorChange.reduce((sum, a) => sum + (a.femaleParticipants || 0), 0),
        twaParticipants: behaviorChange.reduce((sum, a) => sum + (a.twaParticipants || 0), 0),
        approved: behaviorChange.filter((a) => a.validationStatus === 'VALIDATED').length,
        pending: behaviorChange.filter((a) => a.validationStatus === 'PENDING').length,
      },
      microProjects: {
        total: microProjects.length,
        beneficiaries: microProjects.reduce((sum, p) => sum + (p.maleParticipants || 0) + (p.femaleParticipants || 0) + (p.twaParticipants || 0), 0),
        totalAmount: 0, // No amount field in the current schema
        active: microProjects.filter((p) => p.validationStatus === 'VALIDATED').length,
        completed: microProjects.filter((p) => p.validationStatus === 'VALIDATED').length,
        byCategory: {
          agriculture: microProjects.reduce((sum, p) => sum + (p.agricultureBeneficiaries || 0), 0),
          livestock: microProjects.reduce((sum, p) => sum + (p.livestockBeneficiaries || 0), 0),
          commerce: microProjects.reduce((sum, p) => sum + (p.commerceServicesBeneficiaries || 0), 0),
        },
      },
    };

    // Monthly trends
    const monthlyTrends = {};
    [...sensitization, ...behaviorChange].forEach((activity) => {
      const dateField = activity.sensitizationDate || activity.reportDate;
      if (!dateField) return;
      
      const month = new Date(dateField).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!monthlyTrends[month]) {
        monthlyTrends[month] = {
          sensitization: 0,
          behaviorChange: 0,
          participants: 0,
        };
      }

      if (sensitization.includes(activity)) {
        monthlyTrends[month].sensitization += 1;
      } else {
        monthlyTrends[month].behaviorChange += 1;
      }
      monthlyTrends[month].participants += (activity.maleParticipants || 0) + (activity.femaleParticipants || 0) + (activity.twaParticipants || 0);
    });

    return {
      sensitization,
      behaviorChange,
      microProjects,
      stats,
      monthlyTrends: Object.entries(monthlyTrends)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([month, data]) => ({ month, ...data })),
    };
  }, [data]);

  // Current activity type
  const currentActivityType = [
    'sensitization',
    'behaviorChange',
    'microProjects',
  ][tabValue];

  // Get current stats
  const currentStats = processedData?.stats[currentActivityType] || {};
  
  // Add refetch function
  const refetch = () => fetchData();

  // Chart configurations
  const getGenderDonutOptions = () => ({
    chart: {
      type: 'donut',
      fontFamily: theme.typography.fontFamily,
    },
    labels: [
      formatMessage(intl, MODULE_NAME, 'gender.male'),
      formatMessage(intl, MODULE_NAME, 'gender.female'),
    ],
    colors: ['#2196f3', '#e91e63'],
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: formatMessage(intl, MODULE_NAME, 'activities.totalParticipants'),
              fontSize: '16px',
              fontWeight: 600,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter(val, opts) {
        return `${opts.w.config.series[opts.seriesIndex]} (${val.toFixed(1)}%)`;
      },
    },
    legend: {
      position: 'bottom',
    },
  });

  const getValidationStatusOptions = () => ({
    chart: {
      type: 'bar',
      stacked: true,
      fontFamily: theme.typography.fontFamily,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: [
        formatMessage(intl, MODULE_NAME, 'activities.sensitization'),
        formatMessage(intl, MODULE_NAME, 'activities.behaviorChange'),
      ],
    },
    yaxis: {
      title: {
        text: formatMessage(intl, MODULE_NAME, 'activities.count'),
      },
    },
    colors: [theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main],
    legend: {
      position: 'top',
      horizontalAlign: 'center',
    },
  });

  const getMonthlyTrendsOptions = () => ({
    chart: {
      type: 'area',
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
      categories: processedData?.monthlyTrends?.map((t) => t.month) || [],
    },
    yaxis: {
      title: {
        text: formatMessage(intl, MODULE_NAME, 'activities.count'),
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    colors: [theme.palette.primary.main, theme.palette.secondary.main],
  });

  // Export functionality
  const handleExport = () => {
    const exportData = {
      statistics: processedData?.stats,
      activities: {
        sensitization: processedData?.sensitization,
        behaviorChange: processedData?.behaviorChange,
        microProjects: processedData?.microProjects,
      },
      monthlyTrends: processedData?.monthlyTrends,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activities-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <BaseDashboard
      title={<FormattedMessage id="socialProtection.activities.dashboardTitle" />}
      subtitle={<FormattedMessage id="socialProtection.activities.dashboardSubtitle" />}
      module={MODULE_NAME}
      loading={loading}
      error={error}
      onRefresh={refetch}
      onExport={handleExport}
      filters={filters}
      onFiltersChange={setFilters}
      FilterComponent={UnifiedDashboardFilters}
      filterConfig={filterConfig}
      rights={rights}
      requiredRights={[]}
    >
      {/* Activity Type Tabs */}
      <Box marginBottom={3}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            icon={<School />}
            label={(
              <Box display="flex" alignItems="center" gap={1}>
                <FormattedMessage id="socialProtection.activities.sensitization" />
                <Badge badgeContent={processedData?.stats.sensitization.total} color="primary" />
              </Box>
            )}
          />
          <Tab
            icon={<GroupWork />}
            label={(
              <Box display="flex" alignItems="center" gap={1}>
                <FormattedMessage id="socialProtection.activities.behaviorChange" />
                <Badge badgeContent={processedData?.stats.behaviorChange.total} color="primary" />
              </Box>
            )}
          />
          <Tab
            icon={<Build />}
            label={(
              <Box display="flex" alignItems="center" gap={1}>
                <FormattedMessage id="socialProtection.activities.microProjects" />
                <Badge badgeContent={processedData?.stats.microProjects.total} color="primary" />
              </Box>
            )}
          />
        </Tabs>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} style={{ marginBottom: theme.spacing(3) }}>
        {tabValue < 2 ? (
          // Sensitization and Behavior Change metrics
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={Event}
                value={currentStats.total || 0}
                label={formatMessage(intl, MODULE_NAME, 'activities.totalActivities')}
                color={theme.palette.primary.main}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={People}
                value={currentStats.participants || 0}
                label={formatMessage(intl, MODULE_NAME, 'activities.totalParticipants')}
                color={theme.palette.info.main}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={CheckCircle}
                value={currentStats.approved || 0}
                label={formatMessage(intl, MODULE_NAME, 'activities.approved')}
                color={theme.palette.success.main}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={Accessibility}
                value={currentStats.twaParticipants || 0}
                label={formatMessage(intl, MODULE_NAME, 'activities.twaParticipants')}
                color={theme.palette.secondary.main}
                loading={loading}
              />
            </Grid>
          </>
        ) : (
          // Micro Projects metrics
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={Build}
                value={currentStats.total || 0}
                label={formatMessage(intl, MODULE_NAME, 'activities.totalProjects')}
                color={theme.palette.primary.main}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={People}
                value={currentStats.beneficiaries || 0}
                label={formatMessage(intl, MODULE_NAME, 'activities.totalBeneficiaries')}
                color={theme.palette.info.main}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={MonetizationOn}
                value={currentStats.totalAmount || 0}
                label={formatMessage(intl, MODULE_NAME, 'activities.totalAmount')}
                format="currency"
                color={theme.palette.success.main}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={CheckCircle}
                value={currentStats.completed || 0}
                label={formatMessage(intl, MODULE_NAME, 'activities.completed')}
                color={theme.palette.success.dark}
                loading={loading}
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Participant Badges (for activities) */}
      {tabValue < 2 && (
        <Grid container spacing={2} style={{ marginBottom: theme.spacing(3) }}>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center" gap={2} bgcolor="background.paper" p={2} borderRadius={1}>
              <Avatar style={{ backgroundColor: '#2196f3' }}>
                <Face />
              </Avatar>
              <Box>
                <Typography variant="h6">{currentStats.maleParticipants || 0}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {formatMessage(intl, MODULE_NAME, 'activities.maleParticipants')}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center" gap={2} bgcolor="background.paper" p={2} borderRadius={1}>
              <Avatar style={{ backgroundColor: '#e91e63' }}>
                <Wc />
              </Avatar>
              <Box>
                <Typography variant="h6">{currentStats.femaleParticipants || 0}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {formatMessage(intl, MODULE_NAME, 'activities.femaleParticipants')}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center" gap={2} bgcolor="background.paper" p={2} borderRadius={1}>
              <Avatar style={{ backgroundColor: theme.palette.secondary.main }}>
                <Accessibility />
              </Avatar>
              <Box>
                <Typography variant="h6">{currentStats.twaParticipants || 0}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {formatMessage(intl, MODULE_NAME, 'activities.minorityParticipants')}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Charts */}
      <Grid container spacing={3}>
        {tabValue < 2 ? (
          // Activity charts
          <>
            {/* Gender Distribution */}
            <Grid item xs={12} md={4}>
              <ChartContainer
                title={formatMessage(intl, MODULE_NAME, 'activities.genderDistribution')}
                loading={loading}
              >
                <ReactApexChart
                  options={getGenderDonutOptions()}
                  series={[
                    currentStats.maleParticipants || 0,
                    currentStats.femaleParticipants || 0,
                  ]}
                  type="donut"
                  height={350}
                />
              </ChartContainer>
            </Grid>

            {/* Validation Status */}
            <Grid item xs={12} md={4}>
              <ChartContainer
                title={formatMessage(intl, MODULE_NAME, 'activities.validationStatus')}
                loading={loading}
              >
                <ReactApexChart
                  options={getValidationStatusOptions()}
                  series={[
                    {
                      name: formatMessage(intl, MODULE_NAME, 'activities.approved'),
                      data: [
                        processedData?.stats.sensitization.approved || 0,
                        processedData?.stats.behaviorChange.approved || 0,
                      ],
                    },
                    {
                      name: formatMessage(intl, MODULE_NAME, 'activities.pending'),
                      data: [
                        processedData?.stats.sensitization.pending || 0,
                        processedData?.stats.behaviorChange.pending || 0,
                      ],
                    },
                    {
                      name: formatMessage(intl, MODULE_NAME, 'activities.rejected'),
                      data: [
                        (processedData?.stats.sensitization.total || 0)
                        - (processedData?.stats.sensitization.approved || 0)
                        - (processedData?.stats.sensitization.pending || 0),
                        (processedData?.stats.behaviorChange.total || 0)
                        - (processedData?.stats.behaviorChange.approved || 0)
                        - (processedData?.stats.behaviorChange.pending || 0),
                      ],
                    },
                  ]}
                  type="bar"
                  height={350}
                />
              </ChartContainer>
            </Grid>

            {/* Minority Participation */}
            <Grid item xs={12} md={4}>
              <ChartContainer
                title={formatMessage(intl, MODULE_NAME, 'activities.minorityParticipation')}
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
                      },
                    },
                    dataLabels: {
                      enabled: true,
                      offsetX: -6,
                      style: {
                        fontSize: '12px',
                        colors: ['#fff'],
                      },
                    },
                    xaxis: {
                      categories: [
                        formatMessage(intl, MODULE_NAME, 'activities.sensitization'),
                        formatMessage(intl, MODULE_NAME, 'activities.behaviorChange'),
                      ],
                    },
                    colors: [theme.palette.secondary.main],
                  }}
                  series={[{
                    name: formatMessage(intl, MODULE_NAME, 'activities.twaParticipants'),
                    data: [
                      processedData?.stats.sensitization.twaParticipants || 0,
                      processedData?.stats.behaviorChange.twaParticipants || 0,
                    ],
                  }]}
                  type="bar"
                  height={350}
                />
              </ChartContainer>
            </Grid>
          </>
        ) : (
          // Micro Projects charts
          <>
            {/* Project Categories */}
            <Grid item xs={12} md={6}>
              <ChartContainer
                title={formatMessage(intl, MODULE_NAME, 'activities.projectsByCategory')}
                loading={loading}
              >
                <ReactApexChart
                  options={{
                    chart: {
                      type: 'pie',
                      fontFamily: theme.typography.fontFamily,
                    },
                    labels: Object.keys(processedData?.stats.microProjects.byCategory || {}).map((cat) => formatMessage(intl, MODULE_NAME, `activities.category.${cat}`)),
                    legend: {
                      position: 'bottom',
                    },
                  }}
                  series={Object.values(processedData?.stats.microProjects.byCategory || {})}
                  type="pie"
                  height={350}
                />
              </ChartContainer>
            </Grid>

            {/* Project Status Distribution */}
            <Grid item xs={12} md={6}>
              <ChartContainer
                title={formatMessage(intl, MODULE_NAME, 'activities.projectStatus')}
                loading={loading}
              >
                <Box display="flex" flexDirection="column" gap={2} p={2}>
                  {Object.entries(processedData?.stats.microProjects.byCategory || {}).map(([category, count]) => {
                    const Icon = projectCategoryIcons[category] || MonetizationOn;
                    const percentage = ((count / processedData?.stats.microProjects.total) * 100).toFixed(1);

                    return (
                      <Box key={category} display="flex" alignItems="center" gap={2}>
                        <Avatar style={{ backgroundColor: theme.palette.primary.light }}>
                          <Icon />
                        </Avatar>
                        <Box flexGrow={1}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1">
                              {formatMessage(intl, MODULE_NAME, `activities.category.${category}`)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {count}
                              {' '}
                              (
                              {percentage}
                              %)
                            </Typography>
                          </Box>
                          <Box
                            height={8}
                            bgcolor="grey.200"
                            borderRadius={1}
                            overflow="hidden"
                            mt={0.5}
                          >
                            <Box
                              height="100%"
                              bgcolor="primary.main"
                              width={`${percentage}%`}
                              style={{ transition: 'width 0.3s ease' }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </ChartContainer>
            </Grid>
          </>
        )}

        {/* Monthly Trends (for activities) */}
        {tabValue < 2 && (
          <Grid item xs={12}>
            <ChartContainer
              title={formatMessage(intl, MODULE_NAME, 'activities.monthlyTrends')}
              loading={loading}
            >
              <ReactApexChart
                options={getMonthlyTrendsOptions()}
                series={[
                  {
                    name: formatMessage(intl, MODULE_NAME, 'activities.sensitization'),
                    data: processedData?.monthlyTrends?.map((t) => t.sensitization) || [],
                  },
                  {
                    name: formatMessage(intl, MODULE_NAME, 'activities.behaviorChange'),
                    data: processedData?.monthlyTrends?.map((t) => t.behaviorChange) || [],
                  },
                ]}
                type="area"
                height={350}
              />
            </ChartContainer>
          </Grid>
        )}
      </Grid>

      {/* Recent Activities/Projects List */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          {formatMessage(intl, MODULE_NAME, `activities.recent${tabValue === 2 ? 'Projects' : 'Activities'}`)}
        </Typography>
        <Grid container spacing={2}>
          {(tabValue === 0 ? processedData?.sensitization
            : tabValue === 1 ? processedData?.behaviorChange
              : processedData?.microProjects)?.slice(0, 6).map((item) => {
            const isProject = tabValue === 2;
            const Icon = isProject ? projectCategoryIcons[item.category] || MonetizationOn : Event;

            return (
              <Grid item xs={12} md={6} key={item.id}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={2}
                  p={2}
                  bgcolor="background.paper"
                  borderRadius={1}
                  boxShadow={1}
                >
                  <Avatar style={{ backgroundColor: theme.palette.primary.light }}>
                    <Icon />
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="subtitle1" style={{ fontWeight: 500 }}>
                      {item.facilitator || item.location?.name || '-'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <LocationOn style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }} />
                      {item.location?.name || '-'}
                    </Typography>
                    {isProject ? (
                      <Box display="flex" gap={2} mt={0.5}>
                        <Chip
                          size="small"
                          icon={<People />}
                          label={`${(item.maleParticipants || 0) + (item.femaleParticipants || 0) + (item.twaParticipants || 0)} ${formatMessage(intl, MODULE_NAME, 'activities.beneficiaries')}`}
                        />
                        {item.agricultureBeneficiaries > 0 && (
                          <Chip
                            size="small"
                            icon={<Eco />}
                            label={`${item.agricultureBeneficiaries}`}
                            color="primary"
                          />
                        )}
                        {item.livestockBeneficiaries > 0 && (
                          <Chip
                            size="small"
                            icon={<Pets />}
                            label={`${item.livestockBeneficiaries}`}
                            color="primary"
                          />
                        )}
                      </Box>
                    ) : (
                      <Box display="flex" gap={2} mt={0.5}>
                        <Chip
                          size="small"
                          icon={<People />}
                          label={`${(item.maleParticipants || 0) + (item.femaleParticipants || 0) + (item.twaParticipants || 0)} ${formatMessage(intl, MODULE_NAME, 'activities.participants')}`}
                        />
                        <Chip
                          size="small"
                          label={formatMessage(intl, MODULE_NAME, `activities.status.${item.validationStatus?.toLowerCase()}`)}
                          color={item.validationStatus === 'VALIDATED' ? 'primary' : 'default'}
                        />
                      </Box>
                    )}
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="caption" color="textSecondary">
                      {new Date(item.sensitizationDate || item.reportDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </BaseDashboard>
  );
}

const mapStateToProps = (state) => ({
  rights: state.core.user?.i_user?.rights || [],
});

export default connect(mapStateToProps)(ActivitiesDashboardEnhanced);
