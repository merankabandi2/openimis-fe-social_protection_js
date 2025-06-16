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
import {
  PublishedComponent, useModulesManager, useGraphqlQuery, formatMessage,
} from '@openimis/fe-core';
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
// Add queries for GraphQL data fetching
const BENEFIT_PLANS_QUERY = `
  query BenefitPlans {
    benefitPlan {
      edges {
        node {
          id
          code
          name
          type
          isDeleted
        }
      }
    }
  }
`;

const LOCATIONS_QUERY = `
  query Locations($type: String!, $parentUuid: String) {
    locations(type: $type, parent_Uuid: $parentUuid) {
      edges {
        node {
          id
          uuid
          code
          name
          type
        }
      }
    }
  }
`;

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

function UnifiedDashboardFilters({
  onFiltersChange,
  defaultFilters = {},
  filterConfig = {},
  module = 'core',
}) {
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

  // Add state for GraphQL data
  const [benefitPlans, setBenefitPlans] = useState([]);
  const [locations, setLocations] = useState({
    provinces: [],
    communes: [],
    collines: [],
  });

  // Calculate active filter count
  // Load benefit plans if needed
  const { data: benefitPlansData, loading: loadingBenefitPlans } = useGraphqlQuery(
    BENEFIT_PLANS_QUERY,
    {},
    { skip: !filterConfig.benefitPlan },
  );

  // Load locations if needed - provinces (Districts)
  const { data: provincesData, loading: loadingProvinces } = useGraphqlQuery(
    LOCATIONS_QUERY,
    { type: 'D' },
    { skip: !filterConfig.provinces },
  );

  // Load communes based on selected provinces
  const { data: communesData, loading: loadingCommunes } = useGraphqlQuery(
    LOCATIONS_QUERY,
    {
      type: 'W',
      parentUuid: Array.isArray(filters.provinces) && filters.provinces.length === 1
        ? locations.provinces.find((p) => p.id === filters.provinces[0])?.uuid
        : null,
    },
    { skip: !filterConfig.communes || !Array.isArray(filters.provinces) || filters.provinces.length !== 1 },
  );

  // Load collines based on selected communes
  const { data: collinesData, loading: loadingCollines } = useGraphqlQuery(
    LOCATIONS_QUERY,
    {
      type: 'V',
      parentUuid: Array.isArray(filters.communes) && filters.communes.length === 1
        ? locations.communes.find((c) => c.id === filters.communes[0])?.uuid
        : null,
    },
    { skip: !filterConfig.collines || !Array.isArray(filters.communes) || filters.communes.length !== 1 },
  );

  // Update benefit plans when data changes
  useEffect(() => {
    if (benefitPlansData?.benefitPlan?.edges) {
      setBenefitPlans(
        benefitPlansData.benefitPlan.edges
          .map((edge) => edge.node)
          .filter((plan) => !plan.isDeleted),
      );
    }
  }, [benefitPlansData]);

  // Update locations when data changes
  useEffect(() => {
    if (provincesData?.locations?.edges) {
      setLocations((prev) => ({
        ...prev,
        provinces: provincesData.locations.edges.map((edge) => edge.node),
      }));
    }
  }, [provincesData]);

  useEffect(() => {
    if (communesData?.locations?.edges) {
      setLocations((prev) => ({
        ...prev,
        communes: communesData.locations.edges.map((edge) => edge.node),
      }));
    }
  }, [communesData]);

  useEffect(() => {
    if (collinesData?.locations?.edges) {
      setLocations((prev) => ({
        ...prev,
        collines: collinesData.locations.edges.map((edge) => edge.node),
      }));
    }
  }, [collinesData]);

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
    if (config.component === 'year' && value && value !== null) return count + 1;
    if (value !== false && value !== '') return count + 1;
    return count;
  }, 0);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [filterType]: value };

      // Clear dependent filters when parent changes (for hierarchical locations)
      if (filterType === 'provinces') {
        if (!Array.isArray(value) || value.length !== 1) {
          newFilters.communes = [];
          newFilters.collines = [];
        } else if (prev.provinces?.length === 1 && prev.provinces[0] !== value[0]) {
          newFilters.communes = [];
          newFilters.collines = [];
        }
      }

      if (filterType === 'communes') {
        if (!Array.isArray(value) || value.length !== 1) {
          newFilters.collines = [];
        } else if (prev.communes?.length === 1 && prev.communes[0] !== value[0]) {
          newFilters.collines = [];
        }
      }

      return newFilters;
    });
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
        clearedFilters[key] = null;
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
        filters[filterType].filter((v) => v !== value),
      );
    } else if (config.component === 'dateRange') {
      handleFilterChange(filterType, { start: null, end: null });
    } else if (config.component === 'year') {
      handleFilterChange(filterType, null);
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
        // Handle hierarchical location filters (provinces, communes, collines)
        const isProvinces = key === 'provinces';
        const isCommunes = key === 'communes';
        const isCollines = key === 'collines';
        
        if (isProvinces || isCommunes || isCollines) {
          let options = [];
          let loading = false;
          
          if (isProvinces) {
            options = locations.provinces;
            loading = loadingProvinces;
          } else if (isCommunes) {
            options = locations.communes;
            loading = loadingCommunes;
          } else if (isCollines) {
            options = locations.collines;
            loading = loadingCollines;
          }
          
          return (
            <Autocomplete
              multiple
              options={options}
              getOptionLabel={(option) => option.name}
              value={options.filter((o) => Array.isArray(value) && value.includes(o.id))}
              onChange={(e, newValue) => handleFilterChange(key, newValue.map((v) => v.id))}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={formatMessage(intl, module, `filter.${key}`)}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          );
        }
        
        // Fallback to default location picker
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
            {config.options.map((option) => (
              <FormControlLabel
                key={option.value}
                control={(
                  <Checkbox
                    checked={Array.isArray(value) && value.includes(option.value)}
                    onChange={(e) => {
                      const currentValue = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        handleFilterChange(key, [...currentValue, option.value]);
                      } else {
                        handleFilterChange(key, currentValue.filter((v) => v !== option.value));
                      }
                    }}
                    color="primary"
                  />
                )}
                label={formatMessage(intl, module, option.labelKey || `filter.${key}.${option.value}`)}
              />
            ))}
          </FormGroup>
        );

      case 'priority':
        return (
          <Grid container spacing={1}>
            {config.options.map((option) => (
              <Grid item xs={6} key={option.value}>
                <Box
                  className={`${classes.priorityOption} ${
                    Array.isArray(value) && value.includes(option.value) ? classes.prioritySelected : ''
                  }`}
                  onClick={() => {
                    const currentValue = Array.isArray(value) ? value : [];
                    if (currentValue.includes(option.value)) {
                      handleFilterChange(key, currentValue.filter((v) => v !== option.value));
                    } else {
                      handleFilterChange(key, [...currentValue, option.value]);
                    }
                  }}
                  style={{
                    border: `2px solid ${
                      Array.isArray(value) && value.includes(option.value) ? option.color : 'transparent'
                    }`,
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
            control={(
              <Checkbox
                checked={value === true}
                onChange={(e) => handleFilterChange(key, e.target.checked)}
                color="primary"
              />
            )}
            label={formatMessage(intl, module, `filter.${key}`)}
          />
        );

      case 'year':
        return (
          <TextField
            type="number"
            value={value || ''}
            placeholder={String(new Date().getFullYear())}
            onChange={(e) => handleFilterChange(key, e.target.value ? parseInt(e.target.value) : null)}
            inputProps={{
              min: config.minYear || 2020,
              max: config.maxYear || new Date().getFullYear(),
            }}
            fullWidth
            variant="outlined"
            size="small"
          />
        );
        
      case 'locationGroup':
        // Group all location filters in one section
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={locations.provinces}
                getOptionLabel={(option) => option.name}
                value={locations.provinces.filter((p) => Array.isArray(filters.provinces) && filters.provinces.includes(p.id))}
                onChange={(e, value) => handleFilterChange('provinces', value.map((v) => v.id))}
                loading={loadingProvinces}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={formatMessage(intl, module, 'filter.provinces')}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingProvinces ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            {Array.isArray(filters.provinces) && filters.provinces.length === 1 && (
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={locations.communes}
                  getOptionLabel={(option) => option.name}
                  value={locations.communes.filter((c) => Array.isArray(filters.communes) && filters.communes.includes(c.id))}
                  onChange={(e, value) => handleFilterChange('communes', value.map((v) => v.id))}
                  loading={loadingCommunes}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={formatMessage(intl, module, 'filter.communes')}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingCommunes ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            )}
            {Array.isArray(filters.communes) && filters.communes.length === 1 && (
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={locations.collines}
                  getOptionLabel={(option) => option.name}
                  value={locations.collines.filter((c) => Array.isArray(filters.collines) && filters.collines.includes(c.id))}
                  onChange={(e, value) => handleFilterChange('collines', value.map((v) => v.id))}
                  loading={loadingCollines}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={formatMessage(intl, module, 'filter.collines')}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingCollines ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>
        );

      case 'benefitPlan':
        return (
          <Autocomplete
            options={benefitPlans}
            getOptionLabel={(option) => `${option.code} - ${option.name}`}
            value={benefitPlans.find((p) => p.id === value) || null}
            onChange={(e, newValue) => handleFilterChange(key, newValue ? newValue.id : null)}
            loading={loadingBenefitPlans}
            renderInput={(params) => (
              <TextField
                {...params}
                label={formatMessage(intl, module, `filter.${key}`)}
                variant="outlined"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingBenefitPlans ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
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
        value.forEach((v) => {
          const option = config.options?.find((opt) => opt.value === v);
          chips.push(
            <Chip
              key={`${key}-${v}`}
              label={option?.label || formatMessage(intl, module, `filter.${key}.${v}`)}
              icon={<Icon />}
              onDelete={() => handleRemoveFilter(key, v)}
              className={classes.chip}
              color={config.chipColor || 'primary'}
              variant="outlined"
            />,
          );
        });
      } else if (config.component === 'dateRange' && value && (value.start || value.end)) {
        const formatDate = (date) => {
          if (!date) return '...';
          if (date instanceof Date) return date.toLocaleDateString();
          if (typeof date === 'string') return new Date(date).toLocaleDateString();
          return '...';
        };
        
        const dateLabel = `${formatDate(value.start)} - ${formatDate(value.end)}`;
        chips.push(
          <Chip
            key={key}
            label={dateLabel}
            icon={<Icon />}
            onDelete={() => handleRemoveFilter(key)}
            className={classes.chip}
            variant="outlined"
          />,
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
          />,
        );
      } else if (config.component === 'year' && value !== null && value !== undefined) {
        chips.push(
          <Chip
            key={key}
            label={`${formatMessage(intl, module, `filter.${key}`)}: ${value}`}
            icon={<Icon />}
            onDelete={() => handleRemoveFilter(key)}
            className={classes.chip}
            variant="outlined"
          />,
        );
      } else if (value && config.component === 'location') {
        // Handle both array-based locations and single location objects
        if (key === 'provinces' || key === 'communes' || key === 'collines') {
          // Already handled in the array section above
        } else {
          chips.push(
            <Chip
              key={key}
              label={value.name || value}
              icon={<Icon />}
              onDelete={() => handleRemoveFilter(key)}
              className={classes.chip}
              color="primary"
              variant="outlined"
            />,
          );
        }
      } else if (config.component === 'benefitPlan' && value) {
        const plan = benefitPlans.find((p) => p.id === value);
        if (plan) {
          chips.push(
            <Chip
              key={key}
              label={plan.name}
              icon={<Icon />}
              onDelete={() => handleRemoveFilter(key)}
              className={classes.chip}
              color="secondary"
              variant="outlined"
            />,
          );
        }
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
            const filterCount = Array.isArray(filters[key]) ? filters[key].length
              : (filters[key] ? 1 : 0);

            return (
              <Accordion
                key={key}
                expanded={expandedSections[key]}
                onChange={() => setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))}
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
}

export default UnifiedDashboardFilters;
