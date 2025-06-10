import React, { useState, useEffect } from 'react';
import {
  Drawer,
  IconButton,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Collapse,
  TextField,
  Button,
  Badge,
  Fab,
  Zoom,
  Paper,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Slider,
  Grid,
  Tooltip,
  alpha,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  FilterList,
  Close,
  ExpandMore,
  LocationOn,
  People,
  AttachMoney,
  CalendarToday,
  Clear,
  Search,
  Refresh,
  CheckCircle,
  RadioButtonUnchecked,
  LocalOffer,
  Timeline,
  Assessment,
  AccountBalance,
} from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { PublishedComponent, useModulesManager, useGraphqlQuery } from '@openimis/fe-core';
import { useIntl, FormattedMessage } from 'react-intl';

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
    '&::-webkit-scrollbar': {
      height: 4,
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.divider,
      borderRadius: 2,
    },
  },
  chip: {
    borderRadius: theme.shape.borderRadius * 2,
    fontWeight: 500,
    '& .MuiChip-deleteIcon': {
      fontSize: 18,
    },
  },
  accordion: {
    background: theme.palette.background.paper,
    boxShadow: 'none',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1.5),
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      margin: `0 0 ${theme.spacing(1.5)}px 0`,
    },
  },
  accordionSummary: {
    minHeight: 56,
    '&.Mui-expanded': {
      minHeight: 56,
    },
    '& .MuiAccordionSummary-content': {
      margin: `${theme.spacing(1.5)}px 0`,
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
  },
  accordionDetails: {
    padding: theme.spacing(0, 2, 2),
  },
  sectionIcon: {
    color: theme.palette.primary.main,
  },
  searchField: {
    marginBottom: theme.spacing(1),
  },
  listItem: {
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(0.5),
    transition: 'all 0.2s ease',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.08),
    },
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  sliderContainer: {
    padding: theme.spacing(2, 1, 1),
  },
  dateContainer: {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  applyButton: {
    marginTop: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    textTransform: 'none',
    fontWeight: 600,
  },
  clearButton: {
    borderRadius: theme.shape.borderRadius * 2,
    textTransform: 'none',
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
  yearSlider: {
    marginTop: theme.spacing(2),
  },
}));

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
  query Locations($type: Int, $parentId: String) {
    locations(type: $type, parentId: $parentId) {
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

const ModernDashboardFilters = ({ 
  onFiltersChange, 
  filterOptions = {}, 
  defaultFilters = {},
  filterTypes = ['location', 'benefitPlan', 'year', 'status']
}) => {
  const classes = useStyles();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState(() => {
    const initialFilters = {
      provinces: [],
      districts: [],
      benefitPlans: [],
      year: new Date().getFullYear(),
      yearRange: [2020, new Date().getFullYear()],
      status: [],
      dateRange: { start: null, end: null },
    };
    
    // Merge with defaultFilters, ensuring arrays remain arrays
    return Object.keys(initialFilters).reduce((acc, key) => {
      if (defaultFilters && defaultFilters[key] !== undefined) {
        // Ensure arrays stay as arrays
        if (Array.isArray(initialFilters[key]) && !Array.isArray(defaultFilters[key])) {
          acc[key] = defaultFilters[key] ? [defaultFilters[key]] : [];
        } else {
          acc[key] = defaultFilters[key];
        }
      } else {
        acc[key] = initialFilters[key];
      }
      return acc;
    }, {});
  });
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    benefitPlan: false,
    temporal: false,
    status: false,
  });
  const [benefitPlansLoading, setBenefitPlansLoading] = useState(false);
  const [benefitPlans, setBenefitPlans] = useState([]);
  const [locations, setLocations] = useState({
    provinces: [],
    districts: []
  });

  // Load benefit plans
  const { data: benefitPlansData, loading: loadingBenefitPlans } = useGraphqlQuery(
    BENEFIT_PLANS_QUERY,
    {},
    { skip: !filterTypes.includes('benefitPlan') }
  );

  // Load provinces
  const { data: provincesData, loading: loadingProvinces } = useGraphqlQuery(
    LOCATIONS_QUERY,
    { type: 0 }, // Type 0 for provinces
    { skip: !filterTypes.includes('location') }
  );

  // Load districts based on selected provinces
  const { data: districtsData, loading: loadingDistricts } = useGraphqlQuery(
    LOCATIONS_QUERY,
    { 
      type: 1, // Type 1 for districts
      parentId: Array.isArray(filters.provinces) && filters.provinces.length === 1 ? filters.provinces[0] : null 
    },
    { skip: !filterTypes.includes('location') || !Array.isArray(filters.provinces) || filters.provinces.length !== 1 }
  );

  useEffect(() => {
    if (benefitPlansData?.benefitPlan?.edges) {
      setBenefitPlans(
        benefitPlansData.benefitPlan.edges
          .map(edge => edge.node)
          .filter(plan => !plan.isDeleted)
      );
    }
  }, [benefitPlansData]);

  useEffect(() => {
    if (provincesData?.locations?.edges) {
      setLocations(prev => ({
        ...prev,
        provinces: provincesData.locations.edges.map(edge => edge.node)
      }));
    }
  }, [provincesData]);

  useEffect(() => {
    if (districtsData?.locations?.edges) {
      setLocations(prev => ({
        ...prev,
        districts: districtsData.locations.edges.map(edge => edge.node)
      }));
    }
  }, [districtsData]);

  // Calculate active filter count
  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (value === null || value === undefined) return count;
    if (key === 'yearRange') return count;
    if (Array.isArray(value) && value.length > 0) return count + value.length;
    if (typeof value === 'object' && value !== null && !Array.isArray(value) && (value.start || value.end)) return count + 1;
    if (key === 'year' && typeof value === 'number' && value !== new Date().getFullYear()) return count + 1;
    return count;
  }, 0);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterType]: value };
      
      // Clear districts if provinces change
      if (filterType === 'provinces' && value.length !== 1) {
        newFilters.districts = [];
      }
      
      return newFilters;
    });
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    setOpen(false);
  };

  const handleClearAll = () => {
    const clearedFilters = {
      provinces: [],
      districts: [],
      benefitPlans: [],
      year: new Date().getFullYear(),
      yearRange: [2020, new Date().getFullYear()],
      status: [],
      dateRange: { start: null, end: null },
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleRemoveFilter = (filterType, value) => {
    if (Array.isArray(filters[filterType])) {
      handleFilterChange(
        filterType,
        filters[filterType].filter(v => v !== value)
      );
    } else if (filterType === 'dateRange') {
      handleFilterChange(filterType, { start: null, end: null });
    } else if (filterType === 'year') {
      handleFilterChange(filterType, new Date().getFullYear());
    }
  };

  const renderFilterChips = () => {
    const chips = [];

    // Location chips
    if (Array.isArray(filters.provinces)) {
      filters.provinces.forEach(provinceId => {
      const province = locations.provinces.find(p => p.id === provinceId);
      if (province) {
        chips.push(
          <Chip
            key={`province-${provinceId}`}
            label={province.name}
            icon={<LocationOn />}
            onDelete={() => handleRemoveFilter('provinces', provinceId)}
            className={classes.chip}
            color="primary"
            variant="outlined"
          />
        );
      }
    });
    }

    if (Array.isArray(filters.districts)) {
      filters.districts.forEach(districtId => {
      const district = locations.districts.find(d => d.id === districtId);
      if (district) {
        chips.push(
          <Chip
            key={`district-${districtId}`}
            label={district.name}
            icon={<LocationOn />}
            onDelete={() => handleRemoveFilter('districts', districtId)}
            className={classes.chip}
            color="primary"
            variant="outlined"
          />
        );
      }
    });
    }

    // Benefit Plan chips
    if (Array.isArray(filters.benefitPlans)) {
      filters.benefitPlans.forEach(planId => {
      const plan = benefitPlans.find(p => p.id === planId);
      if (plan) {
        chips.push(
          <Chip
            key={`plan-${planId}`}
            label={plan.name}
            icon={<LocalOffer />}
            onDelete={() => handleRemoveFilter('benefitPlans', planId)}
            className={classes.chip}
            color="secondary"
            variant="outlined"
          />
        );
      }
    });
    }

    // Year chip
    if (filters.year !== new Date().getFullYear()) {
      chips.push(
        <Chip
          key="year"
          label={`Year: ${filters.year}`}
          icon={<CalendarToday />}
          onDelete={() => handleRemoveFilter('year')}
          className={classes.chip}
          variant="outlined"
        />
      );
    }

    // Date range chip
    if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) {
      const dateLabel = `${filters.dateRange.start?.toLocaleDateString() || '...'} - ${
        filters.dateRange.end?.toLocaleDateString() || '...'
      }`;
      chips.push(
        <Chip
          key="date-range"
          label={dateLabel}
          icon={<CalendarToday />}
          onDelete={() => handleRemoveFilter('dateRange')}
          className={classes.chip}
          variant="outlined"
        />
      );
    }

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
              label={<FormattedMessage id="socialProtection.filter.clearAll" />}
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
            <FormattedMessage id="socialProtection.filter.title" />
          </Typography>
          {activeFilterCount > 0 && (
            <Box className={classes.filterCount}>{activeFilterCount}</Box>
          )}
          <IconButton onClick={() => setOpen(false)} size="small">
            <Close />
          </IconButton>
        </div>

        <div className={classes.filterContent}>
          {/* Location Filters */}
          {filterTypes.includes('location') && (
            <Accordion
              expanded={expandedSections.location}
              onChange={() => setExpandedSections(prev => ({ ...prev, location: !prev.location }))}
              className={classes.accordion}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                className={classes.accordionSummary}
              >
                <LocationOn className={classes.sectionIcon} />
                <Typography>
                  <FormattedMessage id="socialProtection.filter.location" />
                </Typography>
                {((Array.isArray(filters.provinces) ? filters.provinces.length : 0) + 
                  (Array.isArray(filters.districts) ? filters.districts.length : 0)) > 0 && (
                  <Box className={classes.filterCount}>
                    {(Array.isArray(filters.provinces) ? filters.provinces.length : 0) + 
                     (Array.isArray(filters.districts) ? filters.districts.length : 0)}
                  </Box>
                )}
              </AccordionSummary>
              <AccordionDetails className={classes.accordionDetails}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={locations.provinces}
                      getOptionLabel={(option) => option.name}
                      value={locations.provinces.filter(p => Array.isArray(filters.provinces) && filters.provinces.includes(p.id))}
                      onChange={(e, value) => handleFilterChange('provinces', value.map(v => v.id))}
                      loading={loadingProvinces}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={<FormattedMessage id="socialProtection.filter.provinces" />}
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
                        options={locations.districts}
                        getOptionLabel={(option) => option.name}
                        value={locations.districts.filter(d => Array.isArray(filters.districts) && filters.districts.includes(d.id))}
                        onChange={(e, value) => handleFilterChange('districts', value.map(v => v.id))}
                        loading={loadingDistricts}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={<FormattedMessage id="socialProtection.filter.districts" />}
                            variant="outlined"
                            size="small"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingDistricts ? <CircularProgress color="inherit" size={20} /> : null}
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
              </AccordionDetails>
            </Accordion>
          )}

          {/* Benefit Plans Filter */}
          {filterTypes.includes('benefitPlan') && (
            <Accordion
              expanded={expandedSections.benefitPlan}
              onChange={() => setExpandedSections(prev => ({ ...prev, benefitPlan: !prev.benefitPlan }))}
              className={classes.accordion}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                className={classes.accordionSummary}
              >
                <LocalOffer className={classes.sectionIcon} />
                <Typography>
                  <FormattedMessage id="socialProtection.filter.benefitPlans" />
                </Typography>
                {Array.isArray(filters.benefitPlans) && filters.benefitPlans.length > 0 && (
                  <Box className={classes.filterCount}>
                    {filters.benefitPlans.length}
                  </Box>
                )}
              </AccordionSummary>
              <AccordionDetails className={classes.accordionDetails}>
                <Autocomplete
                  multiple
                  options={benefitPlans}
                  getOptionLabel={(option) => `${option.code} - ${option.name}`}
                  value={benefitPlans.filter(p => Array.isArray(filters.benefitPlans) && filters.benefitPlans.includes(p.id))}
                  onChange={(e, value) => handleFilterChange('benefitPlans', value.map(v => v.id))}
                  loading={loadingBenefitPlans}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<FormattedMessage id="socialProtection.filter.selectBenefitPlans" />}
                      variant="outlined"
                      size="small"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option.code}
                        size="small"
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                />
              </AccordionDetails>
            </Accordion>
          )}

          {/* Temporal Filters */}
          {(filterTypes.includes('year') || filterTypes.includes('dateRange')) && (
            <Accordion
              expanded={expandedSections.temporal}
              onChange={() => setExpandedSections(prev => ({ ...prev, temporal: !prev.temporal }))}
              className={classes.accordion}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                className={classes.accordionSummary}
              >
                <Timeline className={classes.sectionIcon} />
                <Typography>
                  <FormattedMessage id="socialProtection.filter.temporal" />
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.accordionDetails}>
                {filterTypes.includes('year') && (
                  <div className={classes.yearSlider}>
                    <Typography gutterBottom>
                      <FormattedMessage id="socialProtection.filter.year" />: {filters.year}
                    </Typography>
                    <Slider
                      value={filters.year}
                      onChange={(e, value) => handleFilterChange('year', value)}
                      min={filters.yearRange[0]}
                      max={filters.yearRange[1]}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </div>
                )}
                {filterTypes.includes('dateRange') && (
                  <div className={classes.dateContainer}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      label={<FormattedMessage id="socialProtection.filter.startDate" />}
                      value={filters.dateRange?.start || null}
                      onChange={(date) => handleFilterChange('dateRange', { ...(filters.dateRange || {}), start: date })}
                    />
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      label={<FormattedMessage id="socialProtection.filter.endDate" />}
                      value={filters.dateRange?.end || null}
                      onChange={(date) => handleFilterChange('dateRange', { ...(filters.dateRange || {}), end: date })}
                    />
                  </div>
                )}
              </AccordionDetails>
            </Accordion>
          )}

          {/* Action Buttons */}
          <Box display="flex" gap={2} marginTop={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleClearAll}
              className={classes.clearButton}
              disabled={activeFilterCount === 0}
            >
              <FormattedMessage id="socialProtection.filter.clear" />
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleApplyFilters}
              className={classes.applyButton}
            >
              <FormattedMessage id="socialProtection.filter.apply" />
            </Button>
          </Box>
        </div>
      </Drawer>
    </>
  );
};

export default ModernDashboardFilters;