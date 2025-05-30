import React, { useState, useMemo } from 'react';
import { connect } from 'react-redux';
import { useIntl, FormattedMessage } from 'react-intl';
import {
  Grid,
  Box,
  Typography,
  Fade,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
} from '@material-ui/core';
import {
  Assessment,
  CheckCircle,
  RadioButtonUnchecked,
  TrendingUp,
  Flag,
  GroupWork,
  Work,
  Eco,
  Warning,
  ExpandMore,
  Info,
  Timeline,
  BarChart,
  PriorityHigh,
  Star,
  StarBorder,
} from '@material-ui/icons';
import { 
  useModulesManager,
  useGraphqlQuery,
  formatMessage,
} from '@openimis/fe-core';
import BaseDashboard, { StatCard, ChartContainer } from './BaseDashboard';
import UnifiedDashboardFilters from './UnifiedDashboardFilters';
import ReactApexChart from 'react-apexcharts';
import { MODULE_NAME } from '../../constants';

// GraphQL Queries
const RESULTS_FRAMEWORK_QUERY = `
  query ResultsFramework($filters: String) {
    sections(filters: $filters) {
      edges {
        node {
          id
          code
          title
          description
          order
          isActive
          indicators {
            edges {
              node {
                id
                code
                title
                description
                targetValue
                unit
                category
                frequency
                isActive
                achievements {
                  edges {
                    node {
                      id
                      value
                      period
                      notes
                      dateReported
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Section icons mapping
const sectionIcons = {
  'social': GroupWork,
  'economic': Work,
  'environmental': Eco,
  'governance': Flag,
  'health': CheckCircle,
  'education': Assessment,
};

const ResultsFrameworkDashboardEnhanced = ({ rights }) => {
  const theme = useTheme();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    sections: [],
    categories: [],
    isActive: true,
  });

  // Filter configuration
  const filterConfig = {
    sections: {
      filterType: 'category',
      component: 'multiSelect',
      type: 'array',
      options: [
        { value: 'social', labelKey: 'resultsFramework.section.social' },
        { value: 'economic', labelKey: 'resultsFramework.section.economic' },
        { value: 'environmental', labelKey: 'resultsFramework.section.environmental' },
        { value: 'governance', labelKey: 'resultsFramework.section.governance' },
      ],
    },
    categories: {
      filterType: 'category',
      component: 'multiSelect',
      type: 'array',
      options: [
        { value: 'output', labelKey: 'resultsFramework.category.output' },
        { value: 'outcome', labelKey: 'resultsFramework.category.outcome' },
        { value: 'impact', labelKey: 'resultsFramework.category.impact' },
      ],
    },
    isActive: {
      filterType: 'boolean',
      component: 'boolean',
      type: 'boolean',
      default: true,
    },
  };

  // Build GraphQL filter string
  const filterString = useMemo(() => {
    const filterParts = [];
    
    if (Array.isArray(filters.sections) && filters.sections.length > 0) {
      filterParts.push(`category_In: ${JSON.stringify(filters.sections)}`);
    }
    if (filters.isActive !== null) {
      filterParts.push(`isActive: ${filters.isActive}`);
    }
    
    return filterParts.join(', ');
  }, [filters]);

  // Fetch data
  const { data, loading, error, refetch } = useGraphqlQuery(
    RESULTS_FRAMEWORK_QUERY,
    { filters: filterString },
    { fetchPolicy: 'cache-and-network' }
  );

  const sections = data?.sections?.edges?.map(edge => edge.node) || [];

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    let totalTarget = 0;
    let totalAchieved = 0;
    
    sections.forEach(section => {
      section.indicators?.edges?.forEach(({ node: indicator }) => {
        const targetValue = parseFloat(indicator.targetValue) || 0;
        totalTarget += targetValue;
        
        const latestAchievement = indicator.achievements?.edges?.[0]?.node;
        if (latestAchievement) {
          totalAchieved += parseFloat(latestAchievement.value) || 0;
        }
      });
    });
    
    return totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;
  }, [sections]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      totalSections: sections.length,
      totalIndicators: 0,
      activeIndicators: 0,
      achievedIndicators: 0,
      inProgressIndicators: 0,
      notStartedIndicators: 0,
      averageProgress: 0,
    };
    
    let totalProgress = 0;
    let indicatorCount = 0;
    
    sections.forEach(section => {
      const indicators = section.indicators?.edges || [];
      stats.totalIndicators += indicators.length;
      
      indicators.forEach(({ node: indicator }) => {
        if (indicator.isActive) {
          stats.activeIndicators++;
        }
        
        const targetValue = parseFloat(indicator.targetValue) || 0;
        const latestAchievement = indicator.achievements?.edges?.[0]?.node;
        const achievedValue = latestAchievement ? parseFloat(latestAchievement.value) || 0 : 0;
        const progress = targetValue > 0 ? (achievedValue / targetValue) * 100 : 0;
        
        if (progress >= 100) {
          stats.achievedIndicators++;
        } else if (progress > 0) {
          stats.inProgressIndicators++;
        } else {
          stats.notStartedIndicators++;
        }
        
        totalProgress += progress;
        indicatorCount++;
      });
    });
    
    stats.averageProgress = indicatorCount > 0 ? Math.round(totalProgress / indicatorCount) : 0;
    
    return stats;
  }, [sections]);

  // Chart data
  const progressBySectionData = useMemo(() => {
    return sections.map(section => {
      let sectionProgress = 0;
      let indicatorCount = 0;
      
      section.indicators?.edges?.forEach(({ node: indicator }) => {
        const targetValue = parseFloat(indicator.targetValue) || 0;
        const latestAchievement = indicator.achievements?.edges?.[0]?.node;
        const achievedValue = latestAchievement ? parseFloat(latestAchievement.value) || 0 : 0;
        const progress = targetValue > 0 ? (achievedValue / targetValue) * 100 : 0;
        
        sectionProgress += progress;
        indicatorCount++;
      });
      
      return {
        name: section.title,
        progress: indicatorCount > 0 ? Math.round(sectionProgress / indicatorCount) : 0,
      };
    });
  }, [sections]);

  // Radial bar chart options
  const radialChartOptions = {
    chart: {
      type: 'radialBar',
      fontFamily: theme.typography.fontFamily,
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 225,
        hollow: {
          margin: 0,
          size: '70%',
          background: '#fff',
          image: undefined,
          imageOffsetX: 0,
          imageOffsetY: 0,
          position: 'front',
          dropShadow: {
            enabled: true,
            top: 3,
            left: 0,
            blur: 4,
            opacity: 0.24
          }
        },
        track: {
          background: '#fff',
          strokeWidth: '67%',
          margin: 0,
          dropShadow: {
            enabled: true,
            top: -3,
            left: 0,
            blur: 4,
            opacity: 0.35
          }
        },
        dataLabels: {
          show: true,
          name: {
            offsetY: -10,
            show: true,
            color: '#888',
            fontSize: '17px'
          },
          value: {
            formatter: function(val) {
              return parseInt(val) + '%';
            },
            color: '#111',
            fontSize: '36px',
            show: true,
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#ABE5A1'],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round'
    },
    labels: [formatMessage(intl, MODULE_NAME, 'resultsFramework.overallProgress')],
  };

  // Handle section expansion
  const handleSectionExpand = (sectionId) => (event, isExpanded) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: isExpanded,
    }));
  };

  // Handle indicator detail view
  const handleIndicatorClick = (indicator) => {
    setSelectedIndicator(indicator);
    setDetailDialogOpen(true);
  };

  // Calculate indicator progress
  const calculateIndicatorProgress = (indicator) => {
    const targetValue = parseFloat(indicator.targetValue) || 0;
    const latestAchievement = indicator.achievements?.edges?.[0]?.node;
    const achievedValue = latestAchievement ? parseFloat(latestAchievement.value) || 0 : 0;
    
    return targetValue > 0 ? Math.min(100, Math.round((achievedValue / targetValue) * 100)) : 0;
  };

  // Get indicator status
  const getIndicatorStatus = (progress) => {
    if (progress >= 100) return { label: 'Achieved', color: theme.palette.success.main, icon: CheckCircle };
    if (progress >= 75) return { label: 'On Track', color: theme.palette.info.main, icon: TrendingUp };
    if (progress >= 50) return { label: 'In Progress', color: theme.palette.warning.main, icon: Timeline };
    if (progress > 0) return { label: 'Started', color: theme.palette.warning.light, icon: RadioButtonUnchecked };
    return { label: 'Not Started', color: theme.palette.grey[400], icon: RadioButtonUnchecked };
  };

  // Export functionality
  const handleExport = () => {
    const exportData = {
      overallProgress,
      statistics,
      sections: sections.map(section => ({
        title: section.title,
        code: section.code,
        indicators: section.indicators?.edges?.map(({ node: indicator }) => ({
          code: indicator.code,
          title: indicator.title,
          targetValue: indicator.targetValue,
          latestValue: indicator.achievements?.edges?.[0]?.node?.value || 0,
          progress: calculateIndicatorProgress(indicator),
        })) || [],
      })),
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results-framework-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <BaseDashboard
      title={<FormattedMessage id="socialProtection.resultsFramework.title" />}
      subtitle={<FormattedMessage id="socialProtection.resultsFramework.subtitle" />}
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
      requiredRights={['159001', '159002']}
    >
      {/* Key Metrics */}
      <Grid container spacing={3} style={{ marginBottom: theme.spacing(3) }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Assessment}
            value={statistics.totalIndicators}
            label={formatMessage(intl, MODULE_NAME, 'resultsFramework.totalIndicators')}
            color={theme.palette.primary.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={CheckCircle}
            value={statistics.achievedIndicators}
            label={formatMessage(intl, MODULE_NAME, 'resultsFramework.achievedIndicators')}
            color={theme.palette.success.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Timeline}
            value={statistics.inProgressIndicators}
            label={formatMessage(intl, MODULE_NAME, 'resultsFramework.inProgressIndicators')}
            color={theme.palette.warning.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TrendingUp}
            value={statistics.averageProgress}
            label={formatMessage(intl, MODULE_NAME, 'resultsFramework.averageProgress')}
            format="percentage"
            color={theme.palette.info.main}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Progress Charts */}
      <Grid container spacing={3} style={{ marginBottom: theme.spacing(3) }}>
        {/* Overall Progress */}
        <Grid item xs={12} md={4}>
          <ChartContainer 
            title={formatMessage(intl, MODULE_NAME, 'resultsFramework.overallProgress')}
            loading={loading}
          >
            <ReactApexChart
              options={radialChartOptions}
              series={[overallProgress]}
              type="radialBar"
              height={350}
            />
          </ChartContainer>
        </Grid>

        {/* Progress by Section */}
        <Grid item xs={12} md={8}>
          <ChartContainer 
            title={formatMessage(intl, MODULE_NAME, 'resultsFramework.progressBySection')}
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
                    distributed: true,
                    dataLabels: {
                      position: 'top',
                    },
                  }
                },
                dataLabels: {
                  enabled: true,
                  formatter: function(val) {
                    return val + "%";
                  },
                  offsetX: -6,
                  style: {
                    fontSize: '12px',
                    colors: ['#fff']
                  }
                },
                xaxis: {
                  categories: progressBySectionData.map(d => d.name),
                  max: 100,
                },
                yaxis: {
                  labels: {
                    style: {
                      fontSize: '12px',
                    }
                  }
                },
                colors: progressBySectionData.map(d => {
                  if (d.progress >= 80) return theme.palette.success.main;
                  if (d.progress >= 60) return theme.palette.info.main;
                  if (d.progress >= 40) return theme.palette.warning.main;
                  return theme.palette.error.main;
                }),
                tooltip: {
                  y: {
                    formatter: function(val) {
                      return val + "% progress";
                    }
                  }
                }
              }}
              series={[{
                name: formatMessage(intl, MODULE_NAME, 'resultsFramework.progress'),
                data: progressBySectionData.map(d => d.progress)
              }]}
              type="bar"
              height={350}
            />
          </ChartContainer>
        </Grid>
      </Grid>

      {/* Sections and Indicators */}
      <Box>
        <Typography variant="h6" gutterBottom>
          {formatMessage(intl, MODULE_NAME, 'resultsFramework.sectionsAndIndicators')}
        </Typography>
        {sections.map((section) => {
          const SectionIcon = sectionIcons[section.category] || Assessment;
          const sectionIndicators = section.indicators?.edges || [];
          const activeIndicators = sectionIndicators.filter(({ node }) => node.isActive).length;
          
          return (
            <Accordion
              key={section.id}
              expanded={expandedSections[section.id] || false}
              onChange={handleSectionExpand(section.id)}
              style={{ marginBottom: theme.spacing(2) }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls={`section-${section.id}-content`}
                id={`section-${section.id}-header`}
              >
                <Box display="flex" alignItems="center" width="100%">
                  <SectionIcon style={{ marginRight: theme.spacing(2), color: theme.palette.primary.main }} />
                  <Box flexGrow={1}>
                    <Typography variant="h6">{section.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {section.description}
                    </Typography>
                  </Box>
                  <Badge badgeContent={activeIndicators} color="primary" style={{ marginRight: theme.spacing(2) }}>
                    <Chip
                      size="small"
                      label={formatMessage(intl, MODULE_NAME, 'resultsFramework.indicators')}
                    />
                  </Badge>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{formatMessage(intl, MODULE_NAME, 'resultsFramework.indicator')}</TableCell>
                        <TableCell align="center">{formatMessage(intl, MODULE_NAME, 'resultsFramework.category')}</TableCell>
                        <TableCell align="center">{formatMessage(intl, MODULE_NAME, 'resultsFramework.target')}</TableCell>
                        <TableCell align="center">{formatMessage(intl, MODULE_NAME, 'resultsFramework.achieved')}</TableCell>
                        <TableCell align="center">{formatMessage(intl, MODULE_NAME, 'resultsFramework.progress')}</TableCell>
                        <TableCell align="center">{formatMessage(intl, MODULE_NAME, 'resultsFramework.status')}</TableCell>
                        <TableCell align="center">{formatMessage(intl, MODULE_NAME, 'resultsFramework.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sectionIndicators.map(({ node: indicator }) => {
                        const progress = calculateIndicatorProgress(indicator);
                        const status = getIndicatorStatus(progress);
                        const StatusIcon = status.icon;
                        const latestAchievement = indicator.achievements?.edges?.[0]?.node;
                        
                        return (
                          <TableRow key={indicator.id} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" style={{ fontWeight: 500 }}>
                                  {indicator.code} - {indicator.title}
                                </Typography>
                                {indicator.description && (
                                  <Typography variant="caption" color="textSecondary">
                                    {indicator.description}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                size="small"
                                label={formatMessage(intl, MODULE_NAME, `resultsFramework.category.${indicator.category}`)}
                                color={indicator.category === 'impact' ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {indicator.targetValue} {indicator.unit}
                            </TableCell>
                            <TableCell align="center">
                              {latestAchievement?.value || 0} {indicator.unit}
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" alignItems="center" justifyContent="center">
                                <LinearProgress
                                  variant="determinate"
                                  value={progress}
                                  style={{ width: 60, marginRight: theme.spacing(1) }}
                                />
                                <Typography variant="body2">{progress}%</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                size="small"
                                icon={<StatusIcon style={{ fontSize: 16 }} />}
                                label={status.label}
                                style={{ color: status.color, borderColor: status.color }}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title={formatMessage(intl, MODULE_NAME, 'resultsFramework.viewDetails')}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleIndicatorClick(indicator)}
                                >
                                  <Info />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {/* Indicator Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedIndicator && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Assessment style={{ marginRight: theme.spacing(1) }} />
                {selectedIndicator.title}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {formatMessage(intl, MODULE_NAME, 'resultsFramework.code')}: {selectedIndicator.code}
                  </Typography>
                  {selectedIndicator.description && (
                    <Typography variant="body1" paragraph>
                      {selectedIndicator.description}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        {formatMessage(intl, MODULE_NAME, 'resultsFramework.targetValue')}
                      </Typography>
                      <Typography variant="h5">
                        {selectedIndicator.targetValue} {selectedIndicator.unit}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        {formatMessage(intl, MODULE_NAME, 'resultsFramework.frequency')}
                      </Typography>
                      <Typography variant="h5">
                        {formatMessage(intl, MODULE_NAME, `resultsFramework.frequency.${selectedIndicator.frequency}`)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {formatMessage(intl, MODULE_NAME, 'resultsFramework.achievementHistory')}
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{formatMessage(intl, MODULE_NAME, 'resultsFramework.period')}</TableCell>
                          <TableCell align="right">{formatMessage(intl, MODULE_NAME, 'resultsFramework.value')}</TableCell>
                          <TableCell>{formatMessage(intl, MODULE_NAME, 'resultsFramework.notes')}</TableCell>
                          <TableCell>{formatMessage(intl, MODULE_NAME, 'resultsFramework.dateReported')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedIndicator.achievements?.edges?.map(({ node: achievement }) => (
                          <TableRow key={achievement.id}>
                            <TableCell>{achievement.period}</TableCell>
                            <TableCell align="right">{achievement.value} {selectedIndicator.unit}</TableCell>
                            <TableCell>{achievement.notes || '-'}</TableCell>
                            <TableCell>{new Date(achievement.dateReported).toLocaleDateString()}</TableCell>
                          </TableRow>
                        )) || (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              <Typography variant="body2" color="textSecondary">
                                {formatMessage(intl, MODULE_NAME, 'resultsFramework.noAchievements')}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>
                {formatMessage(intl, MODULE_NAME, 'common.close')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </BaseDashboard>
  );
};

const mapStateToProps = (state) => ({
  rights: state.core.user?.i_user?.rights || [],
});

export default connect(mapStateToProps)(ResultsFrameworkDashboardEnhanced);