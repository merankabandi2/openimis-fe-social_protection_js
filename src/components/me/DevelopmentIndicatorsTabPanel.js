import React, { useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
} from '@material-ui/core';
import {
  baseApiUrl, apiHeaders,
  PublishedComponent,
  useTranslations,
  useModulesManager,
  Searcher,
  useHistory,
  historyPush,
  formatMessage,
} from '@openimis/fe-core';
import { useIntl } from 'react-intl';
import { makeStyles } from '@material-ui/styles';
import {
  DEVELOPMENT_INDICATORS_LIST_TAB_VALUE, MODULE_NAME,
} from '../../constants';
import DevelopmentIndicatorsFilter from './DevelopmentIndicatorsFilter';
import {
  fetchSections,
  fetchIndicators,
  fetchIndicatorAchievements,
  createIndicatorAchievement,
  updateIndicatorAchievement,
  deleteIndicatorAchievement,
} from '../../actions';
import IndicatorCalculationDisplay from '../resultFramework/IndicatorCalculationDisplay';

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    minWidth: '100%',
  },
  headerCell: {
    fontWeight: 'bold',
    padding: '12px 8px',
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    textAlign: 'left',
  },
  sectionHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  progressContainer: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    margin: '5px 0',
  },
  progressBar: {
    height: 20,
    borderRadius: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  highAchievement: {
    backgroundColor: '#4caf50', // green
  },
  mediumAchievement: {
    backgroundColor: '#ff9800', // orange
  },
  lowAchievement: {
    backgroundColor: '#f44336', // red
  },
  addButton: {
    margin: theme.spacing(1),
  },
}));

function DevelopmentIndicatorsTabLabel({
  onChange, tabStyle, isSelected, modulesManager,
}) {
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(DEVELOPMENT_INDICATORS_LIST_TAB_VALUE)}
      selected={isSelected(DEVELOPMENT_INDICATORS_LIST_TAB_VALUE)}
      value={DEVELOPMENT_INDICATORS_LIST_TAB_VALUE}
      label={formatMessage('developmentIndicators.label')}
    />
  );
}

// Helper function to calculate achievement rate
const calculateAchievementRate = (achieved, target) => {
  if (!target || target === '0.00' || target === '0') return 0;
  if (achieved === target) return 100;

  // Clean up the values to handle formatting
  const cleanTarget = parseFloat(String(target).replace(/,/g, ''));
  const cleanAchieved = parseFloat(String(achieved).replace(/,/g, ''));

  if (Number.isNaN(cleanTarget) || Number.isNaN(cleanAchieved)) return 0;

  return Math.min((cleanAchieved / cleanTarget) * 100, 100);
};

function AchievementRateBar({ achieved, target, classes }) {
  if (!target || target === '') return null;

  const rate = calculateAchievementRate(achieved, target);
  let colorClass = classes.lowAchievement;

  if (rate >= 75) {
    colorClass = classes.highAchievement;
  } else if (rate >= 50) {
    colorClass = classes.mediumAchievement;
  }

  return (
    <div className={classes.progressContainer}>
      <div
        className={`${classes.progressBar} ${colorClass}`}
        style={{ width: `${rate}%` }}
      >
        {`${Math.round(rate)}%`}
      </div>
    </div>
  );
}

function AchievementDialog({
  open,
  onClose,
  indicator,
  achievement,
  onSave,
  isEdit = false,
  intl,
}) {
  const [achieved, setAchieved] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (achievement && isEdit) {
      setAchieved(achievement.achieved || '');
      setDate(achievement.date || '');
      setNotes(achievement.comment || '');
    } else {
      setAchieved('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [achievement, isEdit, open]);

  const handleSave = () => {
    const achievementData = {
      ...achievement,
      indicator: { id: indicator.id },
      achieved,
      date,
      comment: notes,
    };
    onSave(achievementData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {formatMessage(intl, "achievement.dialog", isEdit ? "edit.title" : "add.title")}
        {' '}
        -
        {indicator?.name}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label={formatMessage(intl, "achievement.dialog.value", "label")}
              value={achieved}
              onChange={(e) => setAchieved(e.target.value)}
              fullWidth
              type="number"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={formatMessage(intl, "achievement.dialog", "date")}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              type="date"
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={formatMessage(intl, "achievement.dialog.notes", "label")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
              margin="normal"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {formatMessage(intl, "core", "cancel")}
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          {formatMessage(intl, "core", "save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DevelopmentIndicatorsTabPanel({
  value,
  sections,
  indicators,
  indicatorAchievements,
  fetchingSections,
  fetchingIndicators,
  fetchingIndicatorAchievements,
  fetchSections,
  fetchIndicators,
  fetchIndicatorAchievements,
  createIndicatorAchievement,
  updateIndicatorAchievement,
  deleteIndicatorAchievement,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const intl = useIntl();
  const { formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const [additionalData, setAdditionalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [achievementDialog, setAchievementDialog] = useState({
    open: false,
    indicator: null,
    achievement: null,
    isEdit: false,
  });

  // Load data from GraphQL for dynamic values
  const loadDynamicData = async () => {
    setLoading(true);
    try {
      const response = await window.fetch(`${baseApiUrl}/graphql`, {
        method: 'post',
        headers: apiHeaders(),
        body: JSON.stringify({
          query: `{
            groupBeneficiary {
              totalCount
            }
          }`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dynamic data');
      }

      const result = await response.json();
      setAdditionalData(result.data);
      setError(null);
    } catch (err) {
      console.error('Error loading dynamic data:', err);
      setError(err);
      setAdditionalData(null);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchSections({});
    fetchIndicators(modulesManager, {});
    fetchIndicatorAchievements({});
    loadDynamicData();
  }, [fetchSections, fetchIndicators, fetchIndicatorAchievements, modulesManager]);

  // Filter indicators to show only development indicators
  const developmentIndicators = React.useMemo(() => {
    // Development indicators are in sections 1-3 based on the CSV data
    const developmentSectionIds = [1, 2, 3];
    
    // Define development section names that should be included
    const developmentSectionNames = [
      'Renforcer les capacités de gestion',
      'Renforcer les filets de sécurité',
      'Promouvoir l\'inclusion productive et l\'accès à l\'emploi',
    ];

    // Filter indicators based on section ID or section name
    const filteredIndicators = indicators.filter(indicator => {
      // Handle section as either object or ID
      let sectionId = null;
      let sectionName = null;
      
      if (indicator.section) {
        if (typeof indicator.section === 'object') {
          sectionId = indicator.section.pk || indicator.section.id;
          sectionName = indicator.section.name;
        } else if (typeof indicator.section === 'number' || typeof indicator.section === 'string') {
          sectionId = parseInt(indicator.section);
        }
      }
      
      // Check if indicator belongs to development sections by ID
      const sectionIdMatch = sectionId && developmentSectionIds.includes(sectionId);
      
      // Check if indicator belongs to development sections by name
      const sectionNameMatch = sectionName && 
        developmentSectionNames.some(name => 
          sectionName.toLowerCase() === name.toLowerCase()
        );
      
      return sectionIdMatch || sectionNameMatch;
    });

    // Get unique sections from filtered indicators
    const uniqueSections = new Map();
    filteredIndicators.forEach(indicator => {
      if (indicator.section && typeof indicator.section === 'object') {
        uniqueSections.set(indicator.section.id, indicator.section);
      }
    });
    const filteredSections = Array.from(uniqueSections.values());

    return { sections: filteredSections, indicators: filteredIndicators };
  }, [sections, indicators]);

  // Process data to create a unified view with sections and indicators
  const processedData = React.useMemo(() => {
    const sectionMap = {};
    
    // Debug logging
    console.log('Development Indicators:', developmentIndicators.indicators);
    console.log('Achievements:', indicatorAchievements);

    // Group indicators by section
    developmentIndicators.indicators.forEach((indicator) => {
      let sectionId = 'no-section';
      let sectionObj = { id: 'no-section', name: formatMessage(intl, "indicator", "withoutSection") };
      
      if (indicator.section) {
        if (typeof indicator.section === 'object') {
          sectionId = indicator.section.id;
          sectionObj = indicator.section;
        } else {
          // If section is just an ID, try to find it in our sections
          sectionId = indicator.section;
          sectionObj = developmentIndicators.sections.find(s => s.id === sectionId) || 
            { id: sectionId, name: `Section ${sectionId}` };
        }
      }
      
      if (!sectionMap[sectionId]) {
        sectionMap[sectionId] = {
          section: sectionObj,
          indicators: [],
        };
      }

      // Find latest achievement for this indicator
      const latestAchievement = indicatorAchievements
        .filter((achievement) => achievement.indicator?.id === indicator.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

      // Special handling for specific indicators that use dynamic data
      let achieved = latestAchievement?.achieved || indicator.achieved || '0';
      if (indicator.name?.includes('Ménages des zones ciblées inscrits au Registre social national')) {
        achieved = additionalData?.groupBeneficiary?.totalCount || achieved;
      }

      sectionMap[sectionId].indicators.push({
        ...indicator,
        latestAchievement,
        achieved,
      });
    });

    // Convert to array and flatten for display
    const result = [];
    
    // First add all sections with their indicators
    Object.values(sectionMap).forEach(({ section, indicators: sectionIndicators }) => {
      result.push({
        id: `section-${section.id}`,
        name: section.name,
        isSection: true,
      });
      result.push(...sectionIndicators);
    });

    return result;
  }, [developmentIndicators, indicatorAchievements, additionalData]);

  const headers = () => [
    'resultFrameworkIndicators.name',
    'resultFrameworkIndicators.pbc',
    'resultFrameworkIndicators.baseline',
    'resultFrameworkIndicators.target',
    'resultFrameworkIndicators.achieved',
    'resultFrameworkIndicators.observation',
    'resultFrameworkIndicators.actions',
  ];

  const sorts = () => [
    ['name', true],
    ['pbc', true],
    ['baseline', true],
    ['target', true],
    ['achieved', true],
    ['observation', true],
    [null, false], // actions column - not sortable
  ];

  const rowIdentifier = (item) => item.id;

  const handleAddAchievement = (indicator) => {
    setAchievementDialog({
      open: true,
      indicator,
      achievement: null,
      isEdit: false,
    });
  };

  const handleEditAchievement = (indicator) => {
    setAchievementDialog({
      open: true,
      indicator,
      achievement: indicator.latestAchievement,
      isEdit: true,
    });
  };

  const handleSaveAchievement = (achievementData) => {
    if (achievementDialog.isEdit) {
      updateIndicatorAchievement(achievementData, formatMessage(intl, "indicator.mutation", "updateLabel"));
    } else {
      createIndicatorAchievement(achievementData, formatMessage(intl, "indicator.mutation", "createLabel"));
    }
    // Refresh data
    setTimeout(() => {
      fetchIndicatorAchievements({});
    }, 1000);
  };

  const handleCloseDialog = () => {
    setAchievementDialog({
      open: false,
      indicator: null,
      achievement: null,
      isEdit: false,
    });
  };

  const fetch = (params) => Promise.resolve({});

  const itemFormatters = () => [
    (item) => (
      item.isSection ? (
        <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
          {item.name}
        </span>
      ) : item.name
    ),
    (item) => (item.isSection ? '' : item.pbc),
    (item) => (item.isSection ? '' : item.baseline),
    (item) => (
      item.isSection ? '' : (
        <span style={{ fontWeight: 'bold' }}>
          {item.target}
        </span>
      )
    ),
    (item) => {
      if (item.isSection) return '';
      return (
        <>
          <AchievementRateBar achieved={item.achieved} target={item.target} classes={classes} />
          {`(${item.achieved})`}
        </>
      );
    },
    (item) => (item.isSection ? '' : item.observation),
    (item) => {
      if (item.isSection) return '';
      return (
        <div>
          <Button
            size="small"
            color="primary"
            onClick={() => handleAddAchievement(item)}
            className={classes.addButton}
          >
            {formatMessage(intl, "achievement", "add")}
          </Button>
          {item.latestAchievement && (
            <Button
              size="small"
              color="secondary"
              onClick={() => handleEditAchievement(item)}
              className={classes.addButton}
            >
              {formatMessage(intl, "achievement", "edit")}
            </Button>
          )}
        </div>
      );
    },
  ];

  const defaultFilters = () => ({});

  const isRowSectionHeader = (_, item) => item.isSection;

  const filterPane = ({ filters, onChangeFilters }) => (
    <DevelopmentIndicatorsFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  return (
    <>
      <PublishedComponent
        pubRef="policyHolder.TabPanel"
        module="socialProtection"
        index={DEVELOPMENT_INDICATORS_LIST_TAB_VALUE}
        value={value}
      >
        <div className={classes.tableContainer}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
          }}
          >
            <h3>Indicateurs des objectifs de développement du projet par objectifs/résultats</h3>
            <Button
              color="primary"
              variant="contained"
              onClick={() => historyPush(modulesManager, history, 'socialProtection.route.indicators')}
            >
              {formatMessage(intl, "indicatorsTab", "manageIndicators")}
            </Button>
          </div>
          <Searcher
            module="social_protection"
            fetch={fetch}
            items={processedData}
            itemsPageInfo={{ totalCount: processedData.length }}
            fetchedItems={!fetchingSections && !fetchingIndicators && !fetchingIndicatorAchievements && !loading}
            fetchingItems={fetchingSections || fetchingIndicators || fetchingIndicatorAchievements || loading}
            errorItems={error}
            tableTitle={formatMessageWithValues('DevelopmentIndicatorsSearcher.results', { totalCount: processedData.length })}
            headers={headers}
            itemFormatters={itemFormatters}
            sorts={sorts}
            rowsPerPageOptions={[100]}
            defaultPageSize={100}
            rowIdentifier={rowIdentifier}
            rowDisabled={isRowSectionHeader}
            rowHighlighted={isRowSectionHeader}
            defaultFilters={defaultFilters()}
            filterPane={filterPane}
          />
        </div>
      </PublishedComponent>

      <AchievementDialog
        open={achievementDialog.open}
        onClose={handleCloseDialog}
        indicator={achievementDialog.indicator}
        achievement={achievementDialog.achievement}
        onSave={handleSaveAchievement}
        isEdit={achievementDialog.isEdit}
        intl={intl}
      />
    </>
  );
}

const mapStateToProps = (state) => ({
  sections: state.socialProtection?.sections || [],
  indicators: state.socialProtection?.indicators || [],
  indicatorAchievements: state.socialProtection?.indicatorAchievements || [],
  fetchingSections: state.socialProtection?.fetchingSections || false,
  fetchingIndicators: state.socialProtection?.fetchingIndicators || false,
  fetchingIndicatorAchievements: state.socialProtection?.fetchingIndicatorAchievements || false,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchSections,
  fetchIndicators,
  fetchIndicatorAchievements,
  createIndicatorAchievement,
  updateIndicatorAchievement,
  deleteIndicatorAchievement,
}, dispatch);

const ConnectedDevelopmentIndicatorsTabPanel = connect(mapStateToProps, mapDispatchToProps)(DevelopmentIndicatorsTabPanel);

export { DevelopmentIndicatorsTabLabel, ConnectedDevelopmentIndicatorsTabPanel as DevelopmentIndicatorsTabPanel };