import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Container,
  Grid,
  makeStyles,
  ThemeProvider,
  Paper,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  Card,
  CardContent,
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import { baseApiUrl, apiHeaders } from '@openimis/fe-core';
import RefreshIcon from '@material-ui/icons/Refresh';
import AssessmentIcon from '@material-ui/icons/Assessment';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import FlagIcon from '@material-ui/icons/Flag';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import WorkIcon from '@material-ui/icons/Work';
import EcoIcon from '@material-ui/icons/Eco';
import WarningIcon from '@material-ui/icons/Warning';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import EditIcon from '@material-ui/icons/Edit';
import InfoIcon from '@material-ui/icons/Info';
import TimelineIcon from '@material-ui/icons/Timeline';
import BarChartIcon from '@material-ui/icons/BarChart';
import ReactApexChart from 'react-apexcharts';

const REQUESTED_WITH = 'webapp';

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
    warning: {
      main: '#ffb800',
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
  sectionCard: {
    marginBottom: theme.spacing(3),
    boxShadow: '0 0 20px rgba(0,0,0,.06)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 5px 25px rgba(0,0,0,.1)',
    },
  },
  sectionHeader: {
    padding: theme.spacing(2, 3),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  sectionIcon: {
    fontSize: '2rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  indicatorCard: {
    height: '100%',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 30px rgba(0,0,0,.12)',
    },
  },
  indicatorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(2),
  },
  indicatorName: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
    lineHeight: 1.4,
    flex: 1,
  },
  indicatorStatus: {
    marginLeft: theme.spacing(1),
  },
  progressContainer: {
    marginBottom: theme.spacing(2),
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.palette.grey[200],
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  progressValue: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  statItem: {
    flex: 1,
    textAlign: 'center',
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.grey[50],
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  statLabel: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
  },
  summaryCard: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1,
  },
  summaryLabel: {
    fontSize: '0.875rem',
    opacity: 0.9,
    marginTop: theme.spacing(1),
  },
  chartContainer: {
    height: 350,
    marginTop: theme.spacing(2),
  },
  observationText: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    marginTop: theme.spacing(1),
  },
  accordionRoot: {
    marginBottom: theme.spacing(2),
    boxShadow: '0 0 20px rgba(0,0,0,.06)',
    '&:before': {
      display: 'none',
    },
  },
  accordionSummary: {
    backgroundColor: theme.palette.grey[50],
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  refreshButton: {
    color: theme.palette.primary.main,
  },
}));

// Get section icon based on section ID
const getSectionIcon = (sectionId) => {
  switch (sectionId) {
    case 1: return <GroupWorkIcon />;
    case 2: return <AssessmentIcon />;
    case 3: return <WorkIcon />;
    case 4: return <WarningIcon />;
    case 5: return <TimelineIcon />;
    default: return <FlagIcon />;
  }
};

// Get section color based on section ID
const getSectionColor = (sectionId) => {
  switch (sectionId) {
    case 1: return '#5a8dee';
    case 2: return '#00d0bd';
    case 3: return '#ff8f00';
    case 4: return '#ff5c75';
    case 5: return '#764ba2';
    default: return '#667eea';
  }
};

// Calculate progress percentage
const calculateProgress = (current, target) => {
  if (!target || target === 0) return 0;
  const progress = (current / target) * 100;
  return Math.min(Math.round(progress), 100);
};

// Get progress color based on percentage
const getProgressColor = (progress) => {
  if (progress >= 80) return '#00d0bd';
  if (progress >= 60) return '#ffb800';
  if (progress >= 40) return '#ff8f00';
  return '#ff5c75';
};

// Load data from backend
const loadResultsFrameworkData = async () => {
  const csrfToken = localStorage.getItem('csrfToken');
  const baseHeaders = apiHeaders();

  const response = await fetch(`${baseApiUrl}/graphql`, {
    method: 'post',
    headers: { ...baseHeaders, 'X-Requested-With': REQUESTED_WITH, 'X-CSRFToken': csrfToken },
    body: JSON.stringify({
      query: `
        {
          section {
            edges {
              node {
                id
                name
              }
            }
          }
          indicator {
            edges {
              node {
                id
                section {
                  id
                  name
                }
                name
                pbc
                baseline
                target
                observation
              }
            }
          }
          indicatorAchievement {
            edges {
              node {
                id
                indicator {
                  id
                }
                achieved
                date
                comment
              }
            }
          }
        }
      `,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch results framework data');
  }

  const { data } = await response.json();
  return data;
};

// Dashboard component
function ResultsFrameworkDashboard() {
  const [data, setData] = useState({ sections: [], indicators: [], achievements: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const classes = useStyles();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await loadResultsFrameworkData();
      
      // Process the data
      const sections = result.section.edges.map(edge => edge.node);
      const indicators = result.indicator.edges.map(edge => edge.node);
      const achievements = result.indicatorAchievement.edges.map(edge => edge.node);

      // Group indicators by section and calculate current values
      const processedIndicators = indicators.map(indicator => {
        const indicatorAchievements = achievements.filter(a => a.indicator.id === indicator.id);
        const latestAchievement = indicatorAchievements.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        const currentValue = latestAchievement ? parseFloat(latestAchievement.achieved) : parseFloat(indicator.baseline);
        
        return {
          ...indicator,
          currentValue,
          achievements: indicatorAchievements,
          progress: calculateProgress(currentValue, parseFloat(indicator.target)),
        };
      });

      setData({
        sections,
        indicators: processedIndicators,
        achievements,
      });
    } catch (error) {
      console.error('Failed to load results framework data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSectionToggle = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Calculate overall statistics
  const overallStats = {
    totalIndicators: data.indicators.length,
    achievedIndicators: data.indicators.filter(i => i.progress >= 100).length,
    inProgressIndicators: data.indicators.filter(i => i.progress > 0 && i.progress < 100).length,
    notStartedIndicators: data.indicators.filter(i => i.progress === 0).length,
    averageProgress: data.indicators.length > 0 
      ? Math.round(data.indicators.reduce((sum, i) => sum + i.progress, 0) / data.indicators.length)
      : 0,
  };

  // Prepare data for charts
  const chartData = {
    progressBySectionSeries: data.sections.map(section => {
      const sectionIndicators = data.indicators.filter(i => i.section.id === section.id);
      const avgProgress = sectionIndicators.length > 0
        ? Math.round(sectionIndicators.reduce((sum, i) => sum + i.progress, 0) / sectionIndicators.length)
        : 0;
      return avgProgress;
    }),
    progressBySectionLabels: data.sections.map(s => s.name.substring(0, 30) + '...'),
  };

  const progressChartOptions = {
    chart: {
      type: 'radialBar',
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: "#e7e7e7",
          strokeWidth: '97%',
          margin: 5,
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            color: '#999',
            opacity: 0.2,
            blur: 2
          }
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            offsetY: -2,
            fontSize: '22px',
            fontWeight: 700,
            formatter: function (val) {
              return val + "%";
            }
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        shadeIntensity: 0.4,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 53, 91]
      },
    },
    labels: ['Progression Moyenne'],
  };

  const sectionChartOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        barHeight: '60%',
        borderRadius: 8,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val + "%";
      },
      style: {
        fontSize: '12px',
        fontWeight: 600,
      },
    },
    xaxis: {
      categories: chartData.progressBySectionLabels,
      max: 100,
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    colors: ['#5a8dee', '#00d0bd', '#ff8f00', '#ff5c75', '#764ba2'],
    tooltip: {
      y: {
        formatter: function (val) {
          return val + "% de progression";
        },
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.wrapper}>
        <Container maxWidth={false} className={classes.contentArea}>
          {/* Page Header */}
          <div className={classes.pageHeader}>
            <Typography className={classes.pageTitle}>
              <AssessmentIcon className={classes.titleIcon} />
              Cadre de Résultats
            </Typography>
            <Tooltip title="Actualiser les données">
              <IconButton 
                className={classes.refreshButton}
                onClick={loadData}
                disabled={isLoading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </div>

          {/* Summary Card */}
          <Fade in={!isLoading}>
            <Paper className={classes.summaryCard}>
              <div className={classes.summaryGrid}>
                <div className={classes.summaryItem}>
                  <Typography className={classes.summaryValue}>
                    {overallStats.totalIndicators}
                  </Typography>
                  <Typography className={classes.summaryLabel}>
                    Indicateurs Total
                  </Typography>
                </div>
                <div className={classes.summaryItem}>
                  <Typography className={classes.summaryValue}>
                    {overallStats.achievedIndicators}
                  </Typography>
                  <Typography className={classes.summaryLabel}>
                    Objectifs Atteints
                  </Typography>
                </div>
                <div className={classes.summaryItem}>
                  <Typography className={classes.summaryValue}>
                    {overallStats.inProgressIndicators}
                  </Typography>
                  <Typography className={classes.summaryLabel}>
                    En Cours
                  </Typography>
                </div>
                <div className={classes.summaryItem}>
                  <Typography className={classes.summaryValue}>
                    {overallStats.averageProgress}%
                  </Typography>
                  <Typography className={classes.summaryLabel}>
                    Progression Moyenne
                  </Typography>
                </div>
              </div>
            </Paper>
          </Fade>

          {/* Progress Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper style={{ padding: 24, height: '100%' }}>
                <Typography variant="h6" gutterBottom style={{ textAlign: 'center' }}>
                  Progression Globale
                </Typography>
                <div className={classes.chartContainer}>
                  <ReactApexChart
                    options={progressChartOptions}
                    series={[overallStats.averageProgress]}
                    type="radialBar"
                    height="100%"
                  />
                </div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper style={{ padding: 24, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Progression par Section
                </Typography>
                <div className={classes.chartContainer}>
                  <ReactApexChart
                    options={sectionChartOptions}
                    series={[{ data: chartData.progressBySectionSeries }]}
                    type="bar"
                    height="100%"
                  />
                </div>
              </Paper>
            </Grid>
          </Grid>

          {/* Indicators by Section */}
          {data.sections.map(section => {
            const sectionIndicators = data.indicators.filter(i => i.section.id === section.id);
            const isExpanded = expandedSections[section.id] !== false; // Default to expanded
            
            return (
              <Accordion
                key={section.id}
                className={classes.accordionRoot}
                expanded={isExpanded}
                onChange={() => handleSectionToggle(section.id)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  className={classes.accordionSummary}
                >
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <Avatar style={{ backgroundColor: getSectionColor(section.id) }}>
                      {getSectionIcon(section.id)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6">{section.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {sectionIndicators.length} indicateur{sectionIndicators.length > 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${Math.round(
                        sectionIndicators.reduce((sum, i) => sum + i.progress, 0) / sectionIndicators.length || 0
                      )}%`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3} style={{ padding: theme.spacing(2) }}>
                    {sectionIndicators.map(indicator => (
                      <Grid item xs={12} md={6} key={indicator.id}>
                        <Card 
                          className={classes.indicatorCard}
                          onClick={() => setSelectedIndicator(indicator)}
                        >
                          <CardContent>
                            <div className={classes.indicatorHeader}>
                              <Typography className={classes.indicatorName}>
                                {indicator.name}
                              </Typography>
                              {indicator.progress >= 100 ? (
                                <CheckCircleIcon color="primary" className={classes.indicatorStatus} />
                              ) : (
                                <RadioButtonUncheckedIcon color="action" className={classes.indicatorStatus} />
                              )}
                            </div>

                            <div className={classes.progressContainer}>
                              <div className={classes.progressLabel}>
                                <Typography className={classes.progressValue}>
                                  Actuel: {indicator.currentValue.toLocaleString('fr-FR')}
                                </Typography>
                                <Typography className={classes.progressValue}>
                                  Cible: {parseFloat(indicator.target).toLocaleString('fr-FR')}
                                </Typography>
                              </div>
                              <LinearProgress
                                variant="determinate"
                                value={indicator.progress}
                                className={classes.progressBar}
                                style={{
                                  backgroundColor: '#e0e0e0',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: getProgressColor(indicator.progress),
                                  },
                                }}
                              />
                            </div>

                            <div className={classes.statsRow}>
                              <div className={classes.statItem}>
                                <Typography className={classes.statValue}>
                                  {parseFloat(indicator.baseline).toLocaleString('fr-FR')}
                                </Typography>
                                <Typography className={classes.statLabel}>
                                  Base
                                </Typography>
                              </div>
                              <div className={classes.statItem}>
                                <Typography className={classes.statValue}>
                                  {indicator.progress}%
                                </Typography>
                                <Typography className={classes.statLabel}>
                                  Progrès
                                </Typography>
                              </div>
                              <div className={classes.statItem}>
                                <Typography className={classes.statValue}>
                                  {indicator.achievements.length}
                                </Typography>
                                <Typography className={classes.statLabel}>
                                  Mesures
                                </Typography>
                              </div>
                            </div>

                            {indicator.observation && (
                              <Typography className={classes.observationText}>
                                <InfoIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                {indicator.observation}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            );
          })}

          {/* Indicator Detail Dialog */}
          <Dialog
            open={!!selectedIndicator}
            onClose={() => setSelectedIndicator(null)}
            maxWidth="md"
            fullWidth
          >
            {selectedIndicator && (
              <>
                <DialogTitle>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar style={{ backgroundColor: getSectionColor(selectedIndicator.section.id) }}>
                      {getSectionIcon(selectedIndicator.section.id)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{selectedIndicator.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {selectedIndicator.section.name}
                      </Typography>
                    </Box>
                  </Box>
                </DialogTitle>
                <DialogContent dividers>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Valeur de base
                      </Typography>
                      <Typography variant="h6">
                        {parseFloat(selectedIndicator.baseline).toLocaleString('fr-FR')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Valeur cible
                      </Typography>
                      <Typography variant="h6">
                        {parseFloat(selectedIndicator.target).toLocaleString('fr-FR')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Valeur actuelle
                      </Typography>
                      <Typography variant="h6">
                        {selectedIndicator.currentValue.toLocaleString('fr-FR')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Progression
                      </Typography>
                      <Typography variant="h6">
                        {selectedIndicator.progress}%
                      </Typography>
                    </Grid>
                    {selectedIndicator.observation && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Observation
                        </Typography>
                        <Typography variant="body1">
                          {selectedIndicator.observation}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Historique des mesures
                      </Typography>
                      <List>
                        {selectedIndicator.achievements.length === 0 ? (
                          <ListItem>
                            <ListItemText 
                              primary="Aucune mesure enregistrée"
                              secondary="La valeur actuelle correspond à la valeur de base"
                            />
                          </ListItem>
                        ) : (
                          selectedIndicator.achievements
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map(achievement => (
                              <ListItem key={achievement.id} divider>
                                <ListItemIcon>
                                  <TimelineIcon />
                                </ListItemIcon>
                                <ListItemText
                                  primary={`${parseFloat(achievement.achieved).toLocaleString('fr-FR')} - ${new Date(achievement.date).toLocaleDateString('fr-FR')}`}
                                  secondary={achievement.comment}
                                />
                              </ListItem>
                            ))
                        )}
                      </List>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setSelectedIndicator(null)} color="primary">
                    Fermer
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </Container>
      </div>
    </ThemeProvider>
  );
}

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ResultsFrameworkDashboard);