import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
} from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import { baseApiUrl, apiHeaders } from '@openimis/fe-core';
import RefreshIcon from '@material-ui/icons/Refresh';
import SchoolIcon from '@material-ui/icons/School';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import BuildIcon from '@material-ui/icons/Build';
import PeopleIcon from '@material-ui/icons/People';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import EventIcon from '@material-ui/icons/Event';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import CancelIcon from '@material-ui/icons/Cancel';
import FilterListIcon from '@material-ui/icons/FilterList';
import TimelineIcon from '@material-ui/icons/Timeline';
import AssessmentIcon from '@material-ui/icons/Assessment';
import FaceIcon from '@material-ui/icons/Face';
import WcIcon from '@material-ui/icons/Wc';
import AccessibilityIcon from '@material-ui/icons/Accessibility';
import AgricultureIcon from '@material-ui/icons/Eco';
import PetsIcon from '@material-ui/icons/Pets';
import StorefrontIcon from '@material-ui/icons/Storefront';
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
  tabsContainer: {
    marginBottom: theme.spacing(3),
    backgroundColor: '#fff',
    borderRadius: theme.spacing(1),
    boxShadow: '0 0 20px rgba(0,0,0,.06)',
  },
  sectionDivider: {
    margin: theme.spacing(6, 0, 4, 0),
  },
  sectionTitle: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  sectionSubtitle: {
    marginBottom: theme.spacing(3),
  },
  chartContainer: {
    height: 350,
    marginTop: theme.spacing(2),
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  sectionIcon: {
    color: theme.palette.primary.main,
  },
  statusChip: {
    fontWeight: 600,
  },
  participantBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(0.5),
    backgroundColor: theme.palette.grey[100],
    fontSize: '0.875rem',
    margin: theme.spacing(0.25),
  },
  refreshButton: {
    color: theme.palette.primary.main,
  },
}));

// Build filter string for GraphQL queries
const buildFilter = (filters) => {
  const filterParts = [];
  
  if (filters.locationId) {
    filterParts.push(`location_Uuid: "${filters.locationId}"`);
  }
  
  if (filters.startDate) {
    filterParts.push(`sensitizationDate_Gte: "${filters.startDate}"`);
    filterParts.push(`reportDate_Gte: "${filters.startDate}"`);
  }
  
  if (filters.endDate) {
    filterParts.push(`sensitizationDate_Lte: "${filters.endDate}"`);
    filterParts.push(`reportDate_Lte: "${filters.endDate}"`);
  }
  
  if (filters.validationStatus) {
    filterParts.push(`validationStatus: "${filters.validationStatus}"`);
  }
  
  return filterParts.length > 0 ? `(${filterParts.join(', ')})` : '';
};

// Load activities data from backend
const loadActivitiesData = async (filters = {}) => {
  const csrfToken = localStorage.getItem('csrfToken');
  const baseHeaders = apiHeaders();
  const filterString = buildFilter(filters);

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
          locations(type: "D") {
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
        }
      `,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch activities data');
  }

  const { data } = await response.json();
  return data;
};

// Get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'VALIDATED': return 'primary';
    case 'PENDING': return 'warning';
    case 'REJECTED': return 'error';
    default: return 'default';
  }
};

// Get status icon
const getStatusIcon = (status) => {
  switch (status) {
    case 'VALIDATED': return <CheckCircleIcon />;
    case 'PENDING': return <HourglassEmptyIcon />;
    case 'REJECTED': return <CancelIcon />;
    default: return null;
  }
};

// Dashboard component
function ActivitiesDashboard() {
  const intl = useIntl();
  const [data, setData] = useState({
    sensitizationTraining: [],
    behaviorChangePromotion: [],
    microProject: [],
    locations: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    locationId: '',
    startDate: '',
    endDate: '',
    validationStatus: '',
  });
  const classes = useStyles();

  // Helper function to translate category values
  const translateCategory = (category) => {
    if (!category) return '-';
    
    // Try both lowercase and uppercase keys
    const keys = [
      `sensitizationTraining.category.${category}`,
      `sensitizationTraining.category.${category.toLowerCase()}`
    ];
    
    for (const key of keys) {
      try {
        const translated = intl.formatMessage({ id: key });
        // If translation is found and different from key, return it
        if (translated !== key) {
          return translated;
        }
      } catch (e) {
        // If translation fails, continue to next key
      }
    }
    
    // Fallback: Replace underscores with spaces and capitalize
    return category
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await loadActivitiesData(filters);
      
      setData({
        sensitizationTraining: result.sensitizationTraining.edges.map(edge => edge.node),
        behaviorChangePromotion: result.behaviorChangePromotion.edges.map(edge => edge.node),
        microProject: result.microProject.edges.map(edge => edge.node),
        locations: result.locations.edges.map(edge => edge.node).filter(l => l.type === 'D'),
      });
    } catch (error) {
      console.error('Failed to load activities data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      locationId: '',
      startDate: '',
      endDate: '',
      validationStatus: '',
    });
  };

  // Calculate summary statistics
  const calculateStats = () => {
    const stats = {
      // Sensitization Training Stats
      totalTrainings: data.sensitizationTraining.length,
      trainingParticipants: data.sensitizationTraining.reduce((sum, t) => 
        sum + t.maleParticipants + t.femaleParticipants + t.twaParticipants, 0),
      trainingMale: data.sensitizationTraining.reduce((sum, t) => sum + t.maleParticipants, 0),
      trainingFemale: data.sensitizationTraining.reduce((sum, t) => sum + t.femaleParticipants, 0),
      trainingTwa: data.sensitizationTraining.reduce((sum, t) => sum + t.twaParticipants, 0),
      trainingValidated: data.sensitizationTraining.filter(t => t.validationStatus === 'VALIDATED').length,
      trainingPending: data.sensitizationTraining.filter(t => t.validationStatus === 'PENDING').length,
      trainingRejected: data.sensitizationTraining.filter(t => t.validationStatus === 'REJECTED').length,

      // Behavior Change Stats
      totalBehaviorChanges: data.behaviorChangePromotion.length,
      behaviorParticipants: data.behaviorChangePromotion.reduce((sum, b) => 
        sum + b.maleParticipants + b.femaleParticipants + b.twaParticipants, 0),
      behaviorMale: data.behaviorChangePromotion.reduce((sum, b) => sum + b.maleParticipants, 0),
      behaviorFemale: data.behaviorChangePromotion.reduce((sum, b) => sum + b.femaleParticipants, 0),
      behaviorTwa: data.behaviorChangePromotion.reduce((sum, b) => sum + b.twaParticipants, 0),
      behaviorValidated: data.behaviorChangePromotion.filter(b => b.validationStatus === 'VALIDATED').length,
      behaviorPending: data.behaviorChangePromotion.filter(b => b.validationStatus === 'PENDING').length,
      behaviorRejected: data.behaviorChangePromotion.filter(b => b.validationStatus === 'REJECTED').length,

      // Micro Project Stats
      totalMicroProjects: data.microProject.length,
      microProjectParticipants: data.microProject.reduce((sum, m) => 
        sum + m.maleParticipants + m.femaleParticipants + m.twaParticipants, 0),
      microProjectMale: data.microProject.reduce((sum, m) => sum + m.maleParticipants, 0),
      microProjectFemale: data.microProject.reduce((sum, m) => sum + m.femaleParticipants, 0),
      microProjectTwa: data.microProject.reduce((sum, m) => sum + m.twaParticipants, 0),
      microProjectValidated: data.microProject.filter(m => m.validationStatus === 'VALIDATED').length,
      microProjectPending: data.microProject.filter(m => m.validationStatus === 'PENDING').length,
      microProjectRejected: data.microProject.filter(m => m.validationStatus === 'REJECTED').length,
      
      // Project Type Stats
      agricultureProjects: data.microProject.reduce((sum, m) => sum + m.agricultureBeneficiaries, 0),
      livestockProjects: data.microProject.reduce((sum, m) => sum + m.livestockBeneficiaries, 0),
      commerceProjects: data.microProject.reduce((sum, m) => sum + m.commerceServicesBeneficiaries, 0),

      // Overall Stats
      totalActivities: data.sensitizationTraining.length + data.behaviorChangePromotion.length + data.microProject.length,
      totalParticipants: 0,
      totalMale: 0,
      totalFemale: 0,
      totalTwa: 0,
    };

    stats.totalParticipants = stats.trainingParticipants + stats.behaviorParticipants + stats.microProjectParticipants;
    stats.totalMale = stats.trainingMale + stats.behaviorMale + stats.microProjectMale;
    stats.totalFemale = stats.trainingFemale + stats.behaviorFemale + stats.microProjectFemale;
    stats.totalTwa = stats.trainingTwa + stats.behaviorTwa + stats.microProjectTwa;

    return stats;
  };

  const stats = calculateStats();

  // Prepare chart data
  const prepareChartData = () => {
    // Activities by Type
    const activitiesByType = {
      series: [{
        data: [
          stats.totalTrainings,
          stats.totalBehaviorChanges,
          stats.totalMicroProjects
        ]
      }],
      labels: ['Sensibilisation/Formation', 'Changement de comportement', 'Micro-projets']
    };

    // Participants by Gender
    const participantsByGender = {
      series: [stats.totalMale, stats.totalFemale],
      labels: ['Hommes', 'Femmes']
    };

    // Validation Status
    const validationStatus = {
      series: [{
        name: 'Validé',
        data: [stats.trainingValidated, stats.behaviorValidated, stats.microProjectValidated]
      }, {
        name: 'En attente',
        data: [stats.trainingPending, stats.behaviorPending, stats.microProjectPending]
      }, {
        name: 'Rejeté',
        data: [stats.trainingRejected, stats.behaviorRejected, stats.microProjectRejected]
      }],
      categories: ['Formation', 'Comportement', 'Micro-projets']
    };

    // Activities by Month
    const activitiesByMonth = {};
    [...data.sensitizationTraining, ...data.behaviorChangePromotion, ...data.microProject].forEach(activity => {
      const date = new Date(activity.sensitizationDate || activity.reportDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      activitiesByMonth[monthKey] = (activitiesByMonth[monthKey] || 0) + 1;
    });

    const sortedMonths = Object.keys(activitiesByMonth).sort();
    const monthlyData = {
      series: [{
        name: 'Activités',
        data: sortedMonths.map(month => activitiesByMonth[month])
      }],
      categories: sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        const monthName = new Date(year, monthNum - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        return monthName;
      })
    };

    // Minority Participation by Activity Type
    const minorityParticipation = {
      series: [{
        name: 'Participants Twa',
        data: [stats.trainingTwa, stats.behaviorTwa, stats.microProjectTwa]
      }, {
        name: 'Total Participants',
        data: [stats.trainingParticipants, stats.behaviorParticipants, stats.microProjectParticipants]
      }],
      categories: ['Formation', 'Comportement', 'Micro-projets']
    };

    return { activitiesByType, participantsByGender, validationStatus, monthlyData, minorityParticipation };
  };

  const chartData = prepareChartData();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderSensitizationTable = () => {
    // Sort by date and take only the 10 most recent
    const recentTrainings = [...data.sensitizationTraining]
      .sort((a, b) => new Date(b.sensitizationDate) - new Date(a.sensitizationDate))
      .slice(0, 10);

    return (
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Localité</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Animateur</TableCell>
              <TableCell align="center">Participants</TableCell>
              <TableCell align="center">Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentTrainings.map((training) => (
              <TableRow key={training.id}>
              <TableCell>{new Date(training.sensitizationDate).toLocaleDateString('fr-FR')}</TableCell>
              <TableCell>
                {training.location.name}
                {training.location.parent && ` (${training.location.parent.name})`}
              </TableCell>
              <TableCell>{translateCategory(training.category)}</TableCell>
              <TableCell>{training.facilitator}</TableCell>
              <TableCell align="center">
                <Box display="flex" justifyContent="center" flexWrap="wrap">
                  <span className={classes.participantBadge}>
                    <FaceIcon fontSize="small" /> {training.maleParticipants}
                  </span>
                  <span className={classes.participantBadge}>
                    <WcIcon fontSize="small" /> {training.femaleParticipants}
                  </span>
                  {training.twaParticipants > 0 && (
                    <span className={classes.participantBadge} style={{ backgroundColor: '#e3f2fd' }}>
                      <AccessibilityIcon fontSize="small" /> {training.twaParticipants} Twa
                    </span>
                  )}
                </Box>
              </TableCell>
              <TableCell align="center">
                <Chip 
                  label={training.validationStatusDisplay}
                  color={getStatusColor(training.validationStatus)}
                  size="small"
                  icon={getStatusIcon(training.validationStatus)}
                  className={classes.statusChip}
                />
              </TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderBehaviorChangeTable = () => {
    // Sort by date and take only the 10 most recent
    const recentBehaviors = [...data.behaviorChangePromotion]
      .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate))
      .slice(0, 10);

    return (
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Localité</TableCell>
              <TableCell align="center">Participants</TableCell>
              <TableCell>Commentaires</TableCell>
              <TableCell align="center">Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentBehaviors.map((behavior) => (
              <TableRow key={behavior.id}>
              <TableCell>{new Date(behavior.reportDate).toLocaleDateString('fr-FR')}</TableCell>
              <TableCell>
                {behavior.location.name}
                {behavior.location.parent && ` (${behavior.location.parent.name})`}
              </TableCell>
              <TableCell align="center">
                <Box display="flex" justifyContent="center" flexWrap="wrap">
                  <span className={classes.participantBadge}>
                    <FaceIcon fontSize="small" /> {behavior.maleParticipants}
                  </span>
                  <span className={classes.participantBadge}>
                    <WcIcon fontSize="small" /> {behavior.femaleParticipants}
                  </span>
                  {behavior.twaParticipants > 0 && (
                    <span className={classes.participantBadge} style={{ backgroundColor: '#e3f2fd' }}>
                      <AccessibilityIcon fontSize="small" /> {behavior.twaParticipants} Twa
                    </span>
                  )}
                </Box>
              </TableCell>
              <TableCell>{behavior.comments || '-'}</TableCell>
              <TableCell align="center">
                <Chip 
                  label={behavior.validationStatusDisplay}
                  color={getStatusColor(behavior.validationStatus)}
                  size="small"
                  icon={getStatusIcon(behavior.validationStatus)}
                  className={classes.statusChip}
                />
              </TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderMicroProjectTable = () => {
    // Sort by date and take only the 10 most recent
    const recentProjects = [...data.microProject]
      .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate))
      .slice(0, 10);

    return (
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Localité</TableCell>
              <TableCell align="center">Participants</TableCell>
              <TableCell align="center">Type de Projets</TableCell>
              <TableCell align="center">Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentProjects.map((project) => (
              <TableRow key={project.id}>
              <TableCell>{new Date(project.reportDate).toLocaleDateString('fr-FR')}</TableCell>
              <TableCell>
                {project.location.name}
                {project.location.parent && ` (${project.location.parent.name})`}
              </TableCell>
              <TableCell align="center">
                <Box display="flex" justifyContent="center" flexWrap="wrap">
                  <span className={classes.participantBadge}>
                    <FaceIcon fontSize="small" /> {project.maleParticipants}
                  </span>
                  <span className={classes.participantBadge}>
                    <WcIcon fontSize="small" /> {project.femaleParticipants}
                  </span>
                  {project.twaParticipants > 0 && (
                    <span className={classes.participantBadge} style={{ backgroundColor: '#e3f2fd' }}>
                      <AccessibilityIcon fontSize="small" /> {project.twaParticipants} Twa
                    </span>
                  )}
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box display="flex" justifyContent="center" flexWrap="wrap">
                  {project.agricultureBeneficiaries > 0 && (
                    <span className={classes.participantBadge}>
                      <AgricultureIcon fontSize="small" /> {project.agricultureBeneficiaries}
                    </span>
                  )}
                  {project.livestockBeneficiaries > 0 && (
                    <span className={classes.participantBadge}>
                      <PetsIcon fontSize="small" /> {project.livestockBeneficiaries}
                    </span>
                  )}
                  {project.commerceServicesBeneficiaries > 0 && (
                    <span className={classes.participantBadge}>
                      <StorefrontIcon fontSize="small" /> {project.commerceServicesBeneficiaries}
                    </span>
                  )}
                </Box>
              </TableCell>
              <TableCell align="center">
                <Chip 
                  label={project.validationStatusDisplay}
                  color={getStatusColor(project.validationStatus)}
                  size="small"
                  icon={getStatusIcon(project.validationStatus)}
                  className={classes.statusChip}
                />
              </TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.wrapper}>
        <Container maxWidth={false} className={classes.contentArea}>
          {/* Page Header */}
          <div className={classes.pageHeader}>
            <Typography className={classes.pageTitle}>
              <GroupWorkIcon className={classes.titleIcon} />
              Tableau de Bord des Activités
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

          {/* Filters */}
          <Paper className={classes.filterContainer}>
            <Typography className={classes.filterTitle}>
              <FilterListIcon className={classes.filterIcon} />
              Filtres
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
                    {data.locations.map(loc => (
                      <MenuItem key={loc.uuid} value={loc.uuid}>{loc.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl variant="outlined" className={classes.filterFormControl} fullWidth size="small">
                  <InputLabel id="status-label">Statut</InputLabel>
                  <Select
                    labelId="status-label"
                    name="validationStatus"
                    value={filters.validationStatus}
                    onChange={handleFilterChange}
                    label="Statut"
                  >
                    <MenuItem value="">
                      <em>Tous les statuts</em>
                    </MenuItem>
                    <MenuItem value="VALIDATED">Validé</MenuItem>
                    <MenuItem value="PENDING">En attente</MenuItem>
                    <MenuItem value="REJECTED">Rejeté</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Date début"
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className={classes.filterFormControl}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Date fin"
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className={classes.filterFormControl}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={12} md={3}>
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
                    onClick={loadData}
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
            <Paper className={classes.summaryCard}>
              <div className={classes.summaryGrid}>
                <div className={classes.summaryItem}>
                  <Typography className={classes.summaryValue}>
                    {stats.totalActivities}
                  </Typography>
                  <Typography className={classes.summaryLabel}>
                    Activités Total
                  </Typography>
                </div>
                <div className={classes.summaryItem}>
                  <Typography className={classes.summaryValue}>
                    {stats.totalParticipants.toLocaleString('fr-FR')}
                  </Typography>
                  <Typography className={classes.summaryLabel}>
                    Participants Total
                  </Typography>
                </div>
                <div className={classes.summaryItem}>
                  <Typography className={classes.summaryValue}>
                    {Math.round((stats.totalFemale / (stats.totalMale + stats.totalFemale)) * 100) || 0}%
                  </Typography>
                  <Typography className={classes.summaryLabel}>
                    Participation Féminine
                  </Typography>
                </div>
                <div className={classes.summaryItem}>
                  <Typography className={classes.summaryValue}>
                    {stats.totalTwa.toLocaleString('fr-FR')}
                  </Typography>
                  <Typography className={classes.summaryLabel}>
                    Participants Twa (Minorité)
                  </Typography>
                </div>
              </div>
            </Paper>
          </Fade>

          {/* Statistics Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card className={classes.statsCard}>
                <CardContent>
                  <div className={classes.statsCardHeader}>
                    <Typography className={classes.statsCardTitle}>
                      Sensibilisation/Formation
                    </Typography>
                    <Avatar style={{ backgroundColor: '#5a8dee' }}>
                      <SchoolIcon />
                    </Avatar>
                  </div>
                  <Typography className={classes.statsCardValue}>
                    {stats.totalTrainings}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Sessions réalisées
                  </Typography>
                  <Box mt={2}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.trainingValidated / stats.totalTrainings) * 100 || 0}
                      style={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {stats.trainingValidated} validées sur {stats.totalTrainings}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card className={classes.statsCard}>
                <CardContent>
                  <div className={classes.statsCardHeader}>
                    <Typography className={classes.statsCardTitle}>
                      Changement de Comportement
                    </Typography>
                    <Avatar style={{ backgroundColor: '#ff8f00' }}>
                      <TrendingUpIcon />
                    </Avatar>
                  </div>
                  <Typography className={classes.statsCardValue}>
                    {stats.totalBehaviorChanges}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Activités réalisées
                  </Typography>
                  <Box mt={2}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.behaviorValidated / stats.totalBehaviorChanges) * 100 || 0}
                      style={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {stats.behaviorValidated} validées sur {stats.totalBehaviorChanges}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card className={classes.statsCard}>
                <CardContent>
                  <div className={classes.statsCardHeader}>
                    <Typography className={classes.statsCardTitle}>
                      Micro-projets
                    </Typography>
                    <Avatar style={{ backgroundColor: '#00d0bd' }}>
                      <BuildIcon />
                    </Avatar>
                  </div>
                  <Typography className={classes.statsCardValue}>
                    {stats.totalMicroProjects}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Projets appuyés
                  </Typography>
                  <Box mt={2}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.microProjectValidated / stats.totalMicroProjects) * 100 || 0}
                      style={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {stats.microProjectValidated} validés sur {stats.totalMicroProjects}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} style={{ marginTop: 24 }}>
            <Grid item xs={12} md={6}>
              <Paper style={{ padding: 24 }}>
                <Typography variant="h6" gutterBottom>
                  Répartition des Participants par Genre
                </Typography>
                <div className={classes.chartContainer}>
                  <ReactApexChart
                    options={{
                      chart: { type: 'donut' },
                      labels: chartData.participantsByGender.labels,
                      colors: ['#5a8dee', '#ff5c75'],
                      legend: { position: 'bottom' },
                      dataLabels: { enabled: true },
                    }}
                    series={chartData.participantsByGender.series}
                    type="donut"
                    height="100%"
                  />
                </div>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper style={{ padding: 24 }}>
                <Typography variant="h6" gutterBottom>
                  Statut de Validation par Type d'Activité
                </Typography>
                <div className={classes.chartContainer}>
                  <ReactApexChart
                    options={{
                      chart: { type: 'bar', stacked: true },
                      xaxis: { categories: chartData.validationStatus.categories },
                      colors: ['#00d0bd', '#ffb800', '#ff5c75'],
                      legend: { position: 'top' },
                    }}
                    series={chartData.validationStatus.series}
                    type="bar"
                    height="100%"
                  />
                </div>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper style={{ padding: 24 }}>
                <Typography variant="h6" gutterBottom>
                  Participation des Minorités (Twa) par Activité
                </Typography>
                <div className={classes.chartContainer}>
                  <ReactApexChart
                    options={{
                      chart: { 
                        type: 'bar',
                        toolbar: { show: false }
                      },
                      plotOptions: {
                        bar: {
                          horizontal: false,
                          columnWidth: '55%',
                          endingShape: 'rounded'
                        },
                      },
                      xaxis: { categories: chartData.minorityParticipation.categories },
                      yaxis: {
                        title: {
                          text: 'Nombre de participants'
                        }
                      },
                      colors: ['#e3f2fd', '#5a8dee'],
                      legend: { 
                        position: 'bottom',
                        labels: {
                          colors: '#333'
                        }
                      },
                      dataLabels: {
                        enabled: false
                      },
                      tooltip: {
                        y: {
                          formatter: function (val) {
                            return val + " participants"
                          }
                        }
                      }
                    }}
                    series={chartData.minorityParticipation.series}
                    type="bar"
                    height="100%"
                  />
                </div>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper style={{ padding: 24 }}>
                <Typography variant="h6" gutterBottom>
                  Évolution Mensuelle des Activités
                </Typography>
                <div className={classes.chartContainer}>
                  <ReactApexChart
                    options={{
                      chart: { type: 'area' },
                      xaxis: { categories: chartData.monthlyData.categories },
                      colors: ['#5a8dee'],
                      stroke: { curve: 'smooth' },
                      fill: {
                        type: 'gradient',
                        gradient: {
                          shadeIntensity: 1,
                          opacityFrom: 0.7,
                          opacityTo: 0.3,
                        }
                      },
                    }}
                    series={chartData.monthlyData.series}
                    type="area"
                    height="100%"
                  />
                </div>
              </Paper>
            </Grid>
          </Grid>

          {/* Section Divider */}
          <Box mt={6} mb={4}>
            <Divider />
            <Typography 
              variant="h5" 
              align="center" 
              style={{ 
                marginTop: theme.spacing(4), 
                marginBottom: theme.spacing(2),
                fontWeight: 600,
                color: theme.palette.text.primary
              }}
            >
              <TimelineIcon style={{ verticalAlign: 'middle', marginRight: theme.spacing(1), color: theme.palette.primary.main }} />
              Activités Récentes
            </Typography>
            <Typography 
              variant="body2" 
              align="center" 
              color="textSecondary"
              style={{ marginBottom: theme.spacing(3) }}
            >
              Les 10 dernières activités enregistrées par type
            </Typography>
          </Box>

          {/* Activity Tables */}
          <Paper className={classes.tabsContainer}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab 
                label={
                  <Badge badgeContent={stats.totalTrainings} color="primary">
                    Sensibilisation/Formation
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={stats.totalBehaviorChanges} color="primary">
                    Changement de Comportement
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={stats.totalMicroProjects} color="primary">
                    Micro-projets
                  </Badge>
                } 
              />
            </Tabs>
            
            <Box p={3}>
              {activeTab === 0 && (
                <>
                  {renderSensitizationTable()}
                  {data.sensitizationTraining.length > 10 && (
                    <Typography 
                      variant="caption" 
                      color="textSecondary" 
                      align="center" 
                      display="block"
                      style={{ marginTop: theme.spacing(2) }}
                    >
                      Affichage des 10 activités les plus récentes sur {data.sensitizationTraining.length} au total
                    </Typography>
                  )}
                </>
              )}
              {activeTab === 1 && (
                <>
                  {renderBehaviorChangeTable()}
                  {data.behaviorChangePromotion.length > 10 && (
                    <Typography 
                      variant="caption" 
                      color="textSecondary" 
                      align="center" 
                      display="block"
                      style={{ marginTop: theme.spacing(2) }}
                    >
                      Affichage des 10 activités les plus récentes sur {data.behaviorChangePromotion.length} au total
                    </Typography>
                  )}
                </>
              )}
              {activeTab === 2 && (
                <>
                  {renderMicroProjectTable()}
                  {data.microProject.length > 10 && (
                    <Typography 
                      variant="caption" 
                      color="textSecondary" 
                      align="center" 
                      display="block"
                      style={{ marginTop: theme.spacing(2) }}
                    >
                      Affichage des 10 projets les plus récents sur {data.microProject.length} au total
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Container>
      </div>
    </ThemeProvider>
  );
}

// Add missing import
import { TextField } from '@material-ui/core';

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ActivitiesDashboard);