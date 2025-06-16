import React, { useEffect, useState, useMemo } from 'react';
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
import { baseApiUrl, apiHeaders, formatMessage, decodeId } from '@openimis/fe-core';
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
import TimelineIcon from '@material-ui/icons/Timeline';
import AssessmentIcon from '@material-ui/icons/Assessment';
import FaceIcon from '@material-ui/icons/Face';
import WcIcon from '@material-ui/icons/Wc';
import AccessibilityIcon from '@material-ui/icons/Accessibility';
import AgricultureIcon from '@material-ui/icons/Eco';
import PetsIcon from '@material-ui/icons/Pets';
import StorefrontIcon from '@material-ui/icons/Storefront';
import ReactApexChart from 'react-apexcharts';
import ModernDashboardFilters from '../filters/ModernDashboardFilters';
import { MODULE_NAME } from '../../constants';

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
const buildFilter = (filters, dateField = null) => {
  const filterParts = [];
  
  // Handle hierarchical location filters using numeric IDs
  // GraphQL converts Django's double underscore to camelCase with underscores
  if (Array.isArray(filters.collines) && filters.collines.length > 0) {
    // Decode Base64 UUIDs to get numeric IDs
    const numericIds = filters.collines.map(id => parseInt(decodeId(id))).join(', ');
    filterParts.push(`location_Id_In: [${numericIds}]`);
  } else if (Array.isArray(filters.communes) && filters.communes.length > 0) {
    // Decode Base64 UUIDs to get numeric IDs
    const numericIds = filters.communes.map(id => parseInt(decodeId(id))).join(', ');
    filterParts.push(`location_Parent_Id_In: [${numericIds}]`);
  } else if (Array.isArray(filters.provinces) && filters.provinces.length > 0) {
    // Decode Base64 UUIDs to get numeric IDs
    const numericIds = filters.provinces.map(id => parseInt(decodeId(id))).join(', ');
    filterParts.push(`location_Parent_Parent_Id_In: [${numericIds}]`);
  }
  
  // Apply date filters based on the specific date field for each query type
  if (dateField && filters.dateRange?.start) {
    let startDate = filters.dateRange.start;
    if (startDate instanceof Date) {
      startDate = startDate.toISOString().split('T')[0];
    } else if (typeof startDate === 'object' && startDate.toISOString) {
      // Handle DatePicker object that has toISOString method
      startDate = startDate.toISOString().split('T')[0];
    } else if (typeof startDate === 'string') {
      // Already a string, use as is
    }
    if (startDate && startDate !== 'Invalid Date') {
      filterParts.push(`${dateField}_Gte: "${startDate}"`);
    }
  }
  
  if (dateField && filters.dateRange?.end) {
    let endDate = filters.dateRange.end;
    if (endDate instanceof Date) {
      endDate = endDate.toISOString().split('T')[0];
    } else if (typeof endDate === 'object' && endDate.toISOString) {
      // Handle DatePicker object that has toISOString method
      endDate = endDate.toISOString().split('T')[0];
    } else if (typeof endDate === 'string') {
      // Already a string, use as is
    }
    if (endDate && endDate !== 'Invalid Date') {
      filterParts.push(`${dateField}_Lte: "${endDate}"`);
    }
  }
  
  if (Array.isArray(filters.status) && filters.status.length > 0) {
    filterParts.push(`validationStatus_In: [${filters.status.map(s => `"${s}"`).join(', ')}]`);
  }
  
  return filterParts.length > 0 ? `(${filterParts.join(', ')})` : '';
};

// Load activities data from backend
const loadActivitiesData = async (filters = {}) => {
  const csrfToken = localStorage.getItem('csrfToken');
  const baseHeaders = apiHeaders();
  
  // Build filters for optimized query
  const dashboardFilters = {};
  
  if (filters.provinces?.length > 0) {
    // Decode the Base64 UUID to get the numeric ID
    const provinceId = parseInt(decodeId(filters.provinces[0]));
    dashboardFilters.provinceId = provinceId;
  }
  if (filters.communes?.length > 0) {
    // Decode the Base64 UUID to get the numeric ID
    const communeId = parseInt(decodeId(filters.communes[0]));
    dashboardFilters.communeId = communeId;
  }
  if (filters.collines?.length > 0) {
    // Decode the Base64 UUID to get the numeric ID
    const collineId = parseInt(decodeId(filters.collines[0]));
    dashboardFilters.collineId = collineId;
  }
  if (filters.year) {
    dashboardFilters.year = filters.year;
  }
  
  // Add date range filters for the dashboard query
  if (filters.dateRange?.start) {
    let startDate = filters.dateRange.start;
    if (startDate instanceof Date) {
      dashboardFilters.startDate = startDate.toISOString().split('T')[0];
    } else if (typeof startDate === 'object' && startDate.toISOString) {
      dashboardFilters.startDate = startDate.toISOString().split('T')[0];
    } else if (typeof startDate === 'string') {
      dashboardFilters.startDate = startDate;
    }
  }
  
  if (filters.dateRange?.end) {
    let endDate = filters.dateRange.end;
    if (endDate instanceof Date) {
      dashboardFilters.endDate = endDate.toISOString().split('T')[0];
    } else if (typeof endDate === 'object' && endDate.toISOString) {
      dashboardFilters.endDate = endDate.toISOString().split('T')[0];
    } else if (typeof endDate === 'string') {
      dashboardFilters.endDate = endDate;
    }
  }
  
  // Build filter strings for latest activities queries
  const sensitizationFilterString = buildFilter(filters, 'sensitizationDate');
  const behaviorFilterString = buildFilter(filters, 'reportDate');
  const microProjectFilterString = buildFilter(filters, 'reportDate');
  
  // Debug: Log filter strings
  console.log('Filter strings:', {
    dashboardFilters,
    sensitization: sensitizationFilterString,
    behavior: behaviorFilterString,
    microProject: microProjectFilterString,
    filters: filters,
    decodedProvinceId: filters.provinces?.length > 0 ? parseInt(decodeId(filters.provinces[0])) : null
  });

  const graphqlQuery = `
    query ActivitiesDashboard($filters: DashboardFiltersInput) {
      optimizedActivitiesDashboard(filters: $filters) {
        overall {
          totalActivities
          totalParticipants
          totalMale
          totalFemale
          totalTwa
          totalValidated
          totalPending
          totalRejected
        }
        byType {
          sensitizationTraining {
            total
            participants
            male
            female
            twa
            validated
            pending
            rejected
          }
          behaviorChangePromotion {
            total
            participants
            male
            female
            twa
            validated
            pending
            rejected
          }
          microProject {
            total
            participants
            male
            female
            twa
            validated
            pending
            rejected
            agriculture
            livestock
            commerce
          }
        }
        monthlyTrends {
          year
          month
          activityType
          activityCount
          totalParticipants
        }
        lastUpdated
      }
      sensitizationTrainingLatest: sensitizationTraining(first: 10, orderBy: "-sensitizationDate"${sensitizationFilterString ? ', ' + sensitizationFilterString.slice(1, -1) : ''}) {
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
      behaviorChangePromotionLatest: behaviorChangePromotion(first: 10, orderBy: "-reportDate"${behaviorFilterString ? ', ' + behaviorFilterString.slice(1, -1) : ''}) {
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
      microProjectLatest: microProject(first: 10, orderBy: "-reportDate"${microProjectFilterString ? ', ' + microProjectFilterString.slice(1, -1) : ''}) {
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
  `;

  console.log('Full GraphQL Query:', graphqlQuery);

  const response = await fetch(`${baseApiUrl}/graphql`, {
    method: 'post',
    headers: { ...baseHeaders, 'X-Requested-With': REQUESTED_WITH, 'X-CSRFToken': csrfToken },
    body: JSON.stringify({
      query: graphqlQuery,
      variables: { filters: dashboardFilters }
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch activities data');
  }

  const result = await response.json();
  
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error('Failed to fetch activities data');
  }
  
  const { data } = result;
  const dashboardData = data.optimizedActivitiesDashboard;
  
  // Transform optimized data to match expected structure
  const transformedData = {
    // Use optimized counts
    sensitizationTraining: { totalCount: dashboardData.byType.sensitizationTraining.total },
    behaviorChangePromotion: { totalCount: dashboardData.byType.behaviorChangePromotion.total },
    microProject: { totalCount: dashboardData.byType.microProject.total },
    
    // Create stats arrays that match the expected structure for calculateStats
    sensitizationTrainingStats: {
      edges: Array(dashboardData.byType.sensitizationTraining.validated)
        .fill({ node: { validationStatus: 'VALIDATED', maleParticipants: 0, femaleParticipants: 0, twaParticipants: 0 } })
        .concat(Array(dashboardData.byType.sensitizationTraining.pending)
          .fill({ node: { validationStatus: 'PENDING', maleParticipants: 0, femaleParticipants: 0, twaParticipants: 0 } }))
        .concat(Array(dashboardData.byType.sensitizationTraining.rejected)
          .fill({ node: { validationStatus: 'REJECTED', maleParticipants: 0, femaleParticipants: 0, twaParticipants: 0 } }))
        .map((item, idx) => {
          if (idx === 0) {
            return {
              node: {
                ...item.node,
                maleParticipants: dashboardData.byType.sensitizationTraining.male,
                femaleParticipants: dashboardData.byType.sensitizationTraining.female,
                twaParticipants: dashboardData.byType.sensitizationTraining.twa,
              }
            };
          }
          return item;
        })
    },
    
    behaviorChangePromotionStats: {
      edges: Array(dashboardData.byType.behaviorChangePromotion.validated)
        .fill({ node: { validationStatus: 'VALIDATED', maleParticipants: 0, femaleParticipants: 0, twaParticipants: 0 } })
        .concat(Array(dashboardData.byType.behaviorChangePromotion.pending)
          .fill({ node: { validationStatus: 'PENDING', maleParticipants: 0, femaleParticipants: 0, twaParticipants: 0 } }))
        .concat(Array(dashboardData.byType.behaviorChangePromotion.rejected)
          .fill({ node: { validationStatus: 'REJECTED', maleParticipants: 0, femaleParticipants: 0, twaParticipants: 0 } }))
        .map((item, idx) => {
          if (idx === 0) {
            return {
              node: {
                ...item.node,
                maleParticipants: dashboardData.byType.behaviorChangePromotion.male,
                femaleParticipants: dashboardData.byType.behaviorChangePromotion.female,
                twaParticipants: dashboardData.byType.behaviorChangePromotion.twa,
              }
            };
          }
          return item;
        })
    },
    
    microProjectStats: {
      edges: Array(dashboardData.byType.microProject.validated)
        .fill({ node: { validationStatus: 'VALIDATED', maleParticipants: 0, femaleParticipants: 0, twaParticipants: 0, agricultureBeneficiaries: 0, livestockBeneficiaries: 0, commerceServicesBeneficiaries: 0 } })
        .concat(Array(dashboardData.byType.microProject.pending)
          .fill({ node: { validationStatus: 'PENDING', maleParticipants: 0, femaleParticipants: 0, twaParticipants: 0, agricultureBeneficiaries: 0, livestockBeneficiaries: 0, commerceServicesBeneficiaries: 0 } }))
        .concat(Array(dashboardData.byType.microProject.rejected)
          .fill({ node: { validationStatus: 'REJECTED', maleParticipants: 0, femaleParticipants: 0, twaParticipants: 0, agricultureBeneficiaries: 0, livestockBeneficiaries: 0, commerceServicesBeneficiaries: 0 } }))
        .map((item, idx) => {
          if (idx === 0) {
            return {
              node: {
                ...item.node,
                maleParticipants: dashboardData.byType.microProject.male,
                femaleParticipants: dashboardData.byType.microProject.female,
                twaParticipants: dashboardData.byType.microProject.twa,
                agricultureBeneficiaries: dashboardData.byType.microProject.agriculture,
                livestockBeneficiaries: dashboardData.byType.microProject.livestock,
                commerceServicesBeneficiaries: dashboardData.byType.microProject.commerce,
              }
            };
          }
          return item;
        })
    },
    
    // Latest activities for display
    sensitizationTrainingLatest: data.sensitizationTrainingLatest,
    behaviorChangePromotionLatest: data.behaviorChangePromotionLatest,
    microProjectLatest: data.microProjectLatest,
    
    // Locations
    locations: data.locations,
    
    // Monthly trends from optimized data
    monthlyTrends: dashboardData.monthlyTrends
  };
  
  // Debug: Log response counts
  console.log('Response counts from optimized query:', {
    sensitizationTrainingTotal: dashboardData.byType.sensitizationTraining.total,
    behaviorChangePromotionTotal: dashboardData.byType.behaviorChangePromotion.total,
    microProjectTotal: dashboardData.byType.microProject.total,
    totalActivities: dashboardData.overall.totalActivities,
    participants: {
      total: dashboardData.overall.totalParticipants,
      male: dashboardData.overall.totalMale,
      female: dashboardData.overall.totalFemale,
      twa: dashboardData.overall.totalTwa,
    },
    validationStats: {
      validated: dashboardData.overall.totalValidated,
      pending: dashboardData.overall.totalPending,
      rejected: dashboardData.overall.totalRejected,
    },
    latestRecords: {
      sensitizationTraining: data.sensitizationTrainingLatest?.edges?.length || 0,
      behaviorChangePromotion: data.behaviorChangePromotionLatest?.edges?.length || 0,
      microProject: data.microProjectLatest?.edges?.length || 0,
    },
    monthlyTrends: dashboardData.monthlyTrends?.length || 0,
    lastUpdated: dashboardData.lastUpdated
  });
  
  return transformedData;
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
    counts: {
      sensitizationTraining: 0,
      behaviorChangePromotion: 0,
      microProject: 0,
    },
    stats: {
      sensitizationTraining: [],
      behaviorChangePromotion: [],
      microProject: [],
    },
    monthlyTrends: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    provinces: [],
    communes: [],
    collines: [],
    benefitPlan: null,
    year: null,
    yearRange: [2020, new Date().getFullYear()],
    status: [],
    dateRange: { start: null, end: null },
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
        sensitizationTraining: result.sensitizationTrainingLatest?.edges?.map(edge => edge.node) || [],
        behaviorChangePromotion: result.behaviorChangePromotionLatest?.edges?.map(edge => edge.node) || [],
        microProject: result.microProjectLatest?.edges?.map(edge => edge.node) || [],
        locations: result.locations?.edges?.map(edge => edge.node).filter(l => l.type === 'D') || [],
        counts: {
          sensitizationTraining: result.sensitizationTraining?.totalCount || 0,
          behaviorChangePromotion: result.behaviorChangePromotion?.totalCount || 0,
          microProject: result.microProject?.totalCount || 0,
        },
        stats: {
          sensitizationTraining: result.sensitizationTrainingStats?.edges?.map(edge => edge.node) || [],
          behaviorChangePromotion: result.behaviorChangePromotionStats?.edges?.map(edge => edge.node) || [],
          microProject: result.microProjectStats?.edges?.map(edge => edge.node) || [],
        },
        monthlyTrends: result.monthlyTrends || [],
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

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    loadData();
  };

  // Define filter options for ModernDashboardFilters
  const filterOptions = {
    status: [
      { value: 'PENDING', label: formatMessage(intl, MODULE_NAME, 'activities.status.pending') },
      { value: 'VALIDATED', label: formatMessage(intl, MODULE_NAME, 'activities.status.validated') },
      { value: 'REJECTED', label: formatMessage(intl, MODULE_NAME, 'activities.status.rejected') },
    ],
  };

  // Calculate summary statistics
  const calculateStats = () => {
    const stats = {
      // Sensitization Training Stats
      totalTrainings: data.counts.sensitizationTraining,
      trainingParticipants: data.stats.sensitizationTraining.reduce((sum, t) => 
        sum + t.maleParticipants + t.femaleParticipants + t.twaParticipants, 0),
      trainingMale: data.stats.sensitizationTraining.reduce((sum, t) => sum + t.maleParticipants, 0),
      trainingFemale: data.stats.sensitizationTraining.reduce((sum, t) => sum + t.femaleParticipants, 0),
      trainingTwa: data.stats.sensitizationTraining.reduce((sum, t) => sum + t.twaParticipants, 0),
      trainingValidated: data.stats.sensitizationTraining.filter(t => t.validationStatus === 'VALIDATED').length,
      trainingPending: data.stats.sensitizationTraining.filter(t => t.validationStatus === 'PENDING').length,
      trainingRejected: data.stats.sensitizationTraining.filter(t => t.validationStatus === 'REJECTED').length,

      // Behavior Change Stats
      totalBehaviorChanges: data.counts.behaviorChangePromotion,
      behaviorParticipants: data.stats.behaviorChangePromotion.reduce((sum, b) => 
        sum + b.maleParticipants + b.femaleParticipants + b.twaParticipants, 0),
      behaviorMale: data.stats.behaviorChangePromotion.reduce((sum, b) => sum + b.maleParticipants, 0),
      behaviorFemale: data.stats.behaviorChangePromotion.reduce((sum, b) => sum + b.femaleParticipants, 0),
      behaviorTwa: data.stats.behaviorChangePromotion.reduce((sum, b) => sum + b.twaParticipants, 0),
      behaviorValidated: data.stats.behaviorChangePromotion.filter(b => b.validationStatus === 'VALIDATED').length,
      behaviorPending: data.stats.behaviorChangePromotion.filter(b => b.validationStatus === 'PENDING').length,
      behaviorRejected: data.stats.behaviorChangePromotion.filter(b => b.validationStatus === 'REJECTED').length,

      // Micro Project Stats
      totalMicroProjects: data.counts.microProject,
      microProjectParticipants: data.stats.microProject.reduce((sum, m) => 
        sum + m.maleParticipants + m.femaleParticipants + m.twaParticipants, 0),
      microProjectMale: data.stats.microProject.reduce((sum, m) => sum + m.maleParticipants, 0),
      microProjectFemale: data.stats.microProject.reduce((sum, m) => sum + m.femaleParticipants, 0),
      microProjectTwa: data.stats.microProject.reduce((sum, m) => sum + m.twaParticipants, 0),
      microProjectValidated: data.stats.microProject.filter(m => m.validationStatus === 'VALIDATED').length,
      microProjectPending: data.stats.microProject.filter(m => m.validationStatus === 'PENDING').length,
      microProjectRejected: data.stats.microProject.filter(m => m.validationStatus === 'REJECTED').length,
      
      // Project Type Stats
      agricultureProjects: data.stats.microProject.reduce((sum, m) => sum + m.agricultureBeneficiaries, 0),
      livestockProjects: data.stats.microProject.reduce((sum, m) => sum + m.livestockBeneficiaries, 0),
      commerceProjects: data.stats.microProject.reduce((sum, m) => sum + m.commerceServicesBeneficiaries, 0),

      // Overall Stats
      totalActivities: data.counts.sensitizationTraining + data.counts.behaviorChangePromotion + data.counts.microProject,
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

    // Activities by Month - Use optimized monthly trends data if available
    let monthlyData;
    
    if (data.monthlyTrends && data.monthlyTrends.length > 0) {
      // Use optimized monthly trends from materialized view
      const trendsByMonth = {};
      data.monthlyTrends.forEach(trend => {
        const monthKey = `${trend.year}-${String(trend.month).padStart(2, '0')}`;
        trendsByMonth[monthKey] = (trendsByMonth[monthKey] || 0) + trend.activityCount;
      });
      
      const sortedMonths = Object.keys(trendsByMonth).sort();
      monthlyData = {
        series: [{
          name: 'Activités',
          data: sortedMonths.map(month => trendsByMonth[month])
        }],
        categories: sortedMonths.map(month => {
          const [year, monthNum] = month.split('-');
          const monthName = new Date(year, monthNum - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
          return monthName;
        })
      };
    } else {
      // Fallback to calculating from individual activities
      const activitiesByMonth = {};
      [...data.sensitizationTraining, ...data.behaviorChangePromotion, ...data.microProject].forEach(activity => {
        const date = new Date(activity.sensitizationDate || activity.reportDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        activitiesByMonth[monthKey] = (activitiesByMonth[monthKey] || 0) + 1;
      });

      const sortedMonths = Object.keys(activitiesByMonth).sort();
      monthlyData = {
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
    }

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
    // Data is already sorted and limited by the server
    const recentTrainings = data.sensitizationTraining;

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
    // Data is already sorted and limited by the server
    const recentBehaviors = data.behaviorChangePromotion;

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
    // Data is already sorted and limited by the server
    const recentProjects = data.microProject;

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

          {/* ModernDashboardFilters component */}
          <ModernDashboardFilters
            onFiltersChange={handleFiltersChange}
            filterOptions={filterOptions}
            defaultFilters={filters}
            filterTypes={['location', 'dateRange', 'status']}
          />

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