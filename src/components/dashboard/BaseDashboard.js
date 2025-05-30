import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import {
  Refresh,
  Speed,
  GetApp,
  Print,
  MoreVert,
  ErrorOutline,
  CheckCircle,
  TrendingUp,
} from '@material-ui/icons';
import { formatMessage } from '@openimis/fe-core';
import { useIntl, FormattedMessage } from 'react-intl';
import debounce from 'lodash/debounce';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    background: theme.palette.background.default,
    minHeight: '100vh',
    paddingBottom: theme.spacing(4),
  },
  container: {
    paddingTop: theme.spacing(2),
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap',
    gap: theme.spacing(2),
  },
  title: {
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: '1.75rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.5rem',
    },
  },
  subtitle: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    marginTop: theme.spacing(0.5),
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    flexWrap: 'wrap',
  },
  performanceChip: {
    fontWeight: 500,
    '& .MuiChip-icon': {
      fontSize: 18,
    },
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  errorContainer: {
    padding: theme.spacing(4),
    textAlign: 'center',
  },
  statCard: {
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  },
  statIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontSize: 48,
    opacity: 0.1,
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: theme.spacing(0.5),
  },
  statLabel: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statChange: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
    fontSize: '0.75rem',
  },
  chartPaper: {
    padding: theme.spacing(3),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  chartTitle: {
    fontSize: '1.125rem',
    fontWeight: 500,
  },
  skeletonCard: {
    height: 140,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonChart: {
    height: 400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

// Stat Card Component
export const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  change, 
  color, 
  loading,
  onClick,
  format = 'number'
}) => {
  const classes = useStyles({ color });
  const intl = useIntl();
  
  const formatValue = useCallback((val) => {
    if (val === null || val === undefined) return '0';
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat(intl.locale, {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percentage':
        return `${val}%`;
      case 'number':
      default:
        return val.toLocaleString(intl.locale);
    }
  }, [intl.locale, format]);
  
  if (loading) {
    return (
      <Card className={classes.skeletonCard}>
        <CircularProgress />
      </Card>
    );
  }
  
  return (
    <Card 
      className={classes.statCard}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <CardContent>
        {Icon && <Icon className={classes.statIcon} style={{ color }} />}
        <Typography className={classes.statValue} style={{ color }}>
          {formatValue(value)}
        </Typography>
        <Typography className={classes.statLabel}>
          {label}
        </Typography>
        {change !== undefined && change !== null && (
          <Box className={classes.statChange}>
            <TrendingUp style={{ 
              color: change >= 0 ? '#4caf50' : '#f44336',
              transform: change < 0 ? 'rotate(180deg)' : 'none',
              fontSize: 16,
            }} />
            <Typography style={{ color: change >= 0 ? '#4caf50' : '#f44336' }}>
              {Math.abs(change)}% <FormattedMessage id="dashboard.fromLastPeriod" />
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Chart Container Component
export const ChartContainer = ({ title, children, actions, loading }) => {
  const classes = useStyles();
  
  return (
    <Paper className={classes.chartPaper}>
      <Box className={classes.chartHeader}>
        <Typography className={classes.chartTitle}>{title}</Typography>
        {actions && <Box>{actions}</Box>}
      </Box>
      {loading ? (
        <Box className={classes.skeletonChart}>
          <CircularProgress />
        </Box>
      ) : (
        <Box flex={1}>{children}</Box>
      )}
    </Paper>
  );
};

// Base Dashboard Component
const BaseDashboard = ({
  title,
  subtitle,
  module,
  children,
  filters,
  onFiltersChange,
  FilterComponent,
  filterConfig,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  onPrint,
  showPerformance = true,
  loadTime,
  customActions,
  rights = [],
  requiredRights = [],
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const intl = useIntl();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [menuAnchor, setMenuAnchor] = useState(null);

  // Check rights
  const hasAccess = requiredRights.length === 0 || 
    requiredRights.every(right => rights.includes(right));

  // Debounced filter handler
  const handleFiltersChange = useCallback(
    debounce((newFilters) => {
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
    }, 500),
    [onFiltersChange]
  );

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleExport = () => {
    handleMenuClose();
    if (onExport) onExport();
  };

  const handlePrint = () => {
    handleMenuClose();
    if (onPrint) onPrint();
  };

  if (!hasAccess) {
    return (
      <Container className={classes.container}>
        <Alert severity="error">
          <FormattedMessage id="dashboard.accessDenied" />
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={classes.container}>
        <Box className={classes.errorContainer}>
          <ErrorOutline style={{ fontSize: 64, color: theme.palette.error.main }} />
          <Typography variant="h6" gutterBottom>
            <FormattedMessage id="dashboard.errorOccurred" />
          </Typography>
          <Typography color="textSecondary" paragraph>
            {error.message || error}
          </Typography>
          {onRefresh && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={onRefresh}
              startIcon={<Refresh />}
            >
              <FormattedMessage id="dashboard.retry" />
            </Button>
          )}
        </Box>
      </Container>
    );
  }

  return (
    <div className={classes.root}>
      <Container maxWidth="xl" className={classes.container}>
        {loading && (
          <Box className={classes.loadingOverlay}>
            <CircularProgress size={60} />
          </Box>
        )}
        
        <Fade in timeout={600}>
          <Box className={classes.header}>
            <Box>
              <Typography variant="h4" className={classes.title}>
                {title}
              </Typography>
              {subtitle && (
                <Typography className={classes.subtitle}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            <Box className={classes.headerActions}>
              {showPerformance && loadTime && (
                <Chip
                  icon={<Speed />}
                  label={`${loadTime}ms`}
                  size="small"
                  className={classes.performanceChip}
                  color={loadTime < 500 ? 'primary' : 'default'}
                />
              )}
              
              {customActions}
              
              {onRefresh && (
                <Tooltip title={formatMessage(intl, module, 'dashboard.refresh')}>
                  <IconButton
                    onClick={onRefresh}
                    disabled={loading}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              )}
              
              {(onExport || onPrint) && (
                <>
                  <IconButton onClick={handleMenuOpen}>
                    <MoreVert />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleMenuClose}
                  >
                    {onExport && (
                      <MenuItem onClick={handleExport}>
                        <ListItemIcon>
                          <GetApp />
                        </ListItemIcon>
                        <ListItemText>
                          <FormattedMessage id="dashboard.export" />
                        </ListItemText>
                      </MenuItem>
                    )}
                    {onPrint && (
                      <MenuItem onClick={handlePrint}>
                        <ListItemIcon>
                          <Print />
                        </ListItemIcon>
                        <ListItemText>
                          <FormattedMessage id="dashboard.print" />
                        </ListItemText>
                      </MenuItem>
                    )}
                  </Menu>
                </>
              )}
            </Box>
          </Box>
        </Fade>

        {children}

        {/* Filter Component */}
        {FilterComponent && (
          <FilterComponent
            onFiltersChange={handleFiltersChange}
            defaultFilters={filters}
            filterConfig={filterConfig}
            module={module}
          />
        )}
      </Container>
    </div>
  );
};

export default BaseDashboard;