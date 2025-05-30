import React, { useState, useEffect } from 'react';
import {
  Drawer,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  TextField,
  Button,
  Badge,
  Fab,
  Zoom,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  alpha,
  CircularProgress,
  Radio,
  RadioGroup,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  FilterList,
  Close,
  ExpandMore,
  LocationOn,
  Category,
  ContactPhone,
  CalendarToday,
  Clear,
  Flag,
  PriorityHigh,
  Assignment,
  Warning,
  Person,
  LocalOffer,
  AttachMoney,
  CheckCircle,
} from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { PublishedComponent, useModulesManager, useGraphqlQuery, formatMessage } from '@openimis/fe-core';
import { useIntl } from 'react-intl';

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: 420,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 420,
    background: theme.palette.background.default,
    borderLeft: 'none',
    boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.08)',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2, 2, 2, 3),
    background: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  filterContent: {
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(10),
  },
  filterFab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 1200,
  },
  filterChips: {
    position: 'fixed',
    top: theme.spacing(9),
    left: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 1100,
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    background: alpha(theme.palette.background.paper, 0.95),
    backdropFilter: 'blur(10px)',
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    maxWidth: 'calc(100vw - 32px)',
    overflowX: 'auto',
  },
  chip: {
    borderRadius: theme.shape.borderRadius * 2,
    fontWeight: 500,
  },
  accordion: {
    background: theme.palette.background.paper,
    boxShadow: 'none',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1.5),
    '&:before': {
      display: 'none',
    },
  },
  accordionSummary: {
    minHeight: 56,
  },
  accordionDetails: {
    padding: theme.spacing(0, 2, 2),
  },
  sectionIcon: {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1),
  },
  filterCount: {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: '0.75rem',
    fontWeight: 600,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  actionButtons: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: 420,
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    gap: theme.spacing(2),
  },
  priorityOption: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.08),
    },
  },
  prioritySelected: {
    background: alpha(theme.palette.primary.main, 0.12),
  },
}));

// Filter type configurations
const FILTER_TYPES = {
  dateRange: {
    icon: CalendarToday,
    component: 'dateRange',
  },
  location: {
    icon: LocationOn,
    component: 'location',
  },
  status: {
    icon: Assignment,
    component: 'multiSelect',
  },
  category: {
    icon: Category,
    component: 'multiSelect',
  },
  channel: {
    icon: ContactPhone,
    component: 'multiSelect',
  },
  priority: {
    icon: PriorityHigh,
    component: 'priority',
  },
  benefitPlan: {
    icon: LocalOffer,
    component: 'benefitPlan',
  },
  boolean: {
    icon: CheckCircle,
    component: 'boolean',
  },
  year: {
    icon: CalendarToday,
    component: 'year',
  },
};

const UnifiedDashboardFilters = ({
  onFiltersChange,
  defaultFilters = {},
  filterConfig = {},
  module = 'core',
}) => {
  const classes = useStyles();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState(() => {
    // Initialize filters based on filterConfig
    const initialFilters = {};
    Object.entries(filterConfig).forEach(([key, config]) => {
      if (config.type === 'array') {
        initialFilters[key] = [];
      } else if (config.type === 'object') {
        initialFilters[key] = config.default || {};
      } else {
        initialFilters[key] = config.default || null;
      }
    });
    
    // Merge with defaultFilters
    return { ...initialFilters, ...defaultFilters };
  });
  
  const [expandedSections, setExpandedSections] = useState(() => {
    const sections = {};
    Object.keys(filterConfig).forEach((key, index) => {
      sections[key] = index === 0; // Expand first section by default
    });
    return sections;
  });

  // Calculate active filter count
  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    const config = filterConfig[key];
    if (!config) return count;
    
    if (value === null || value === undefined) return count;
    if (Array.isArray(value) && value.length > 0) return count + value.length;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (config.component === 'dateRange' && (value.start || value.end)) return count + 1;
      return count;
    }
    if (config.component === 'boolean' && value === true) return count + 1;
    if (config.component === 'year' && value !== new Date().getFullYear()) return count + 1;
    if (value !== false && value !== '') return count + 1;
    return count;
  }, 0);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    setOpen(false);
  };

  const handleClearAll = () => {
    const clearedFilters = {};
    Object.entries(filterConfig).forEach(([key, config]) => {
      if (config.type === 'array') {
        clearedFilters[key] = [];
      } else if (config.component === 'dateRange') {
        clearedFilters[key] = { start: null, end: null };
      } else if (config.component === 'boolean') {
        clearedFilters[key] = false;
      } else if (config.component === 'year') {
        clearedFilters[key] = new Date().getFullYear();
      } else {
        clearedFilters[key] = null;
      }
    });
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleRemoveFilter = (filterType, value) => {
    const config = filterConfig[filterType];
    if (Array.isArray(filters[filterType])) {
      handleFilterChange(
        filterType,
        filters[filterType].filter(v => v !== value)
      );
    } else if (config.component === 'dateRange') {
      handleFilterChange(filterType, { start: null, end: null });
    } else if (config.component === 'year') {
      handleFilterChange(filterType, new Date().getFullYear());
    } else {
      handleFilterChange(filterType, null);
    }
  };

  const renderFilterComponent = (key, config) => {
    const value = filters[key];
    
    switch (config.component) {
      case 'dateRange':
        return (
          <Box display="flex" gap={2}>
            <PublishedComponent
              pubRef="core.DatePicker"
              label={formatMessage(intl, module, `filter.${key}.start`)}
              value={value?.start || null}
              onChange={(date) => handleFilterChange(key, { ...(value || {}), start: date })}
            />
            <PublishedComponent
              pubRef="core.DatePicker"
              label={formatMessage(intl, module, `filter.${key}.end`)}
              value={value?.end || null}
              onChange={(date) => handleFilterChange(key, { ...(value || {}), end: date })}
            />
          </Box>
        );
        
      case 'location':
        return (
          <PublishedComponent
            pubRef="location.LocationPicker"
            value={value}
            onChange={(location) => handleFilterChange(key, location)}
            locationLevel={config.locationLevel || 0}
            required={false}
          />
        );
        
      case 'multiSelect':
        return (
          <FormGroup>
            {config.options.map(option => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={Array.isArray(value) && value.includes(option.value)}
                    onChange={(e) => {
                      const currentValue = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        handleFilterChange(key, [...currentValue, option.value]);
                      } else {
                        handleFilterChange(key, currentValue.filter(v => v !== option.value));
                      }
                    }}
                    color="primary"
                  />
                }
                label={formatMessage(intl, module, option.labelKey || `filter.${key}.${option.value}`)}
              />
            ))}
          </FormGroup>
        );
        
      case 'priority':
        return (
          <Grid container spacing={1}>
            {config.options.map(option => (
              <Grid item xs={6} key={option.value}>
                <Box
                  className={`${classes.priorityOption} ${
                    Array.isArray(value) && value.includes(option.value) ? classes.prioritySelected : ''
                  }`}
                  onClick={() => {
                    const currentValue = Array.isArray(value) ? value : [];
                    if (currentValue.includes(option.value)) {
                      handleFilterChange(key, currentValue.filter(v => v !== option.value));
                    } else {
                      handleFilterChange(key, [...currentValue, option.value]);
                    }
                  }}
                  style={{
                    border: `2px solid ${
                      Array.isArray(value) && value.includes(option.value) ? option.color : 'transparent'
                    }`
                  }}
                >
                  <Typography variant="h6">{option.icon}</Typography>
                  <Typography>{formatMessage(intl, module, option.labelKey || `filter.${key}.${option.value}`)}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        );
        
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={value === true}
                onChange={(e) => handleFilterChange(key, e.target.checked)}
                color="primary"
              />
            }
            label={formatMessage(intl, module, `filter.${key}`)}
          />
        );
        
      case 'year':
        return (
          <TextField
            type="number"
            value={value || new Date().getFullYear()}
            onChange={(e) => handleFilterChange(key, parseInt(e.target.value))}
            inputProps={{
              min: config.minYear || 2020,
              max: config.maxYear || new Date().getFullYear(),
            }}
            fullWidth
            variant="outlined"
            size="small"
          />
        );
        
      case 'custom':
        if (config.renderComponent) {
          return config.renderComponent(value, (newValue) => handleFilterChange(key, newValue));
        }
        return null;
        
      default:
        return null;
    }
  };

  const renderFilterChips = () => {
    const chips = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      const config = filterConfig[key];
      if (!config) return;
      
      const Icon = FILTER_TYPES[config.filterType]?.icon || Flag;
      
      if (Array.isArray(value)) {
        value.forEach(v => {
          const option = config.options?.find(opt => opt.value === v);
          chips.push(
            <Chip
              key={`${key}-${v}`}
              label={option?.label || formatMessage(intl, module, `filter.${key}.${v}`)}
              icon={<Icon />}
              onDelete={() => handleRemoveFilter(key, v)}
              className={classes.chip}
              color={config.chipColor || 'primary'}
              variant="outlined"
            />
          );
        });
      } else if (config.component === 'dateRange' && value && (value.start || value.end)) {
        const dateLabel = `${value.start?.toLocaleDateString() || '...'} - ${
          value.end?.toLocaleDateString() || '...'
        }`;
        chips.push(
          <Chip
            key={key}
            label={dateLabel}
            icon={<Icon />}
            onDelete={() => handleRemoveFilter(key)}
            className={classes.chip}
            variant="outlined"
          />
        );
      } else if (config.component === 'boolean' && value === true) {
        chips.push(
          <Chip
            key={key}
            label={formatMessage(intl, module, `filter.${key}`)}
            icon={<Icon />}
            onDelete={() => handleRemoveFilter(key)}
            className={classes.chip}
            color={config.chipColor || 'primary'}
            variant={config.chipVariant || 'outlined'}
          />
        );
      } else if (config.component === 'year' && value !== new Date().getFullYear()) {
        chips.push(
          <Chip
            key={key}
            label={`${formatMessage(intl, module, `filter.${key}`)}: ${value}`}
            icon={<Icon />}
            onDelete={() => handleRemoveFilter(key)}
            className={classes.chip}
            variant="outlined"
          />
        );
      } else if (value && config.component === 'location') {
        chips.push(
          <Chip
            key={key}
            label={value.name || value}
            icon={<Icon />}
            onDelete={() => handleRemoveFilter(key)}
            className={classes.chip}
            color="primary"
            variant="outlined"
          />
        );
      }
    });
    
    return chips;
  };

  return (
    <>
      {/* Filter FAB */}
      <Zoom in={!open}>
        <Fab
          color="primary"
          className={classes.filterFab}
          onClick={() => setOpen(true)}
        >
          <Badge badgeContent={activeFilterCount} color="secondary">
            <FilterList />
          </Badge>
        </Fab>
      </Zoom>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && !open && (
        <Paper className={classes.filterChips} elevation={0}>
          {renderFilterChips()}
          {activeFilterCount > 1 && (
            <Chip
              label={formatMessage(intl, module, 'filter.clearAll')}
              icon={<Clear />}
              onClick={handleClearAll}
              className={classes.chip}
              size="small"
            />
          )}
        </Paper>
      )}

      {/* Filter Drawer */}
      <Drawer
        className={classes.drawer}
        variant="temporary"
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <Typography variant="h6" style={{ flex: 1 }}>
            {formatMessage(intl, module, 'filter.title')}
          </Typography>
          {activeFilterCount > 0 && (
            <Box className={classes.filterCount}>{activeFilterCount}</Box>
          )}
          <IconButton onClick={() => setOpen(false)} size="small">
            <Close />
          </IconButton>
        </div>

        <div className={classes.filterContent}>
          {Object.entries(filterConfig).map(([key, config]) => {
            const Icon = FILTER_TYPES[config.filterType]?.icon || Flag;
            const filterCount = Array.isArray(filters[key]) ? filters[key].length : 
                               (filters[key] ? 1 : 0);
            
            return (
              <Accordion
                key={key}
                expanded={expandedSections[key]}
                onChange={() => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))}
                className={classes.accordion}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  className={classes.accordionSummary}
                >
                  <Icon className={classes.sectionIcon} />
                  <Typography>
                    {formatMessage(intl, module, `filter.${key}.title`)}
                  </Typography>
                  {filterCount > 0 && (
                    <Box className={classes.filterCount}>
                      {filterCount}
                    </Box>
                  )}
                </AccordionSummary>
                <AccordionDetails className={classes.accordionDetails}>
                  {renderFilterComponent(key, config)}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className={classes.actionButtons}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleClearAll}
            disabled={activeFilterCount === 0}
          >
            {formatMessage(intl, module, 'filter.clear')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleApplyFilters}
          >
            {formatMessage(intl, module, 'filter.apply')}
          </Button>
        </div>
      </Drawer>
    </>
  );
};

export default UnifiedDashboardFilters;