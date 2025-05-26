import React, { useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
} from '@material-ui/core';
import {
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
  INTERMEDIATE_INDICATORS_LIST_TAB_VALUE, MODULE_NAME,
} from '../../constants';
import IntermediateIndicatorsFilter from './IntermediateIndicatorsFilter';
import {
  fetchSections,
  fetchIndicators,
  fetchIndicatorAchievements,
  createIndicatorAchievement,
  updateIndicatorAchievement,
  deleteIndicatorAchievement,
} from '../../actions';

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

function IntermediateIndicatorsTabLabel({
  onChange, tabStyle, isSelected, modulesManager,
}) {
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(INTERMEDIATE_INDICATORS_LIST_TAB_VALUE)}
      selected={isSelected(INTERMEDIATE_INDICATORS_LIST_TAB_VALUE)}
      value={INTERMEDIATE_INDICATORS_LIST_TAB_VALUE}
      label={formatMessage('intermediateIndicators.label')}
    />
  );
}

// Helper function to calculate achievement rate
const calculateAchievementRate = (achieved, target) => {
  // For Yes/No indicators
  if (target === 'Oui' || target === 'Yes') {
    return achieved === target ? 100 : 0;
  }
  
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

  // Check if this is a Yes/No indicator
  const isYesNoIndicator = indicator?.target === 'Oui' || indicator?.target === 'Yes' || 
                          indicator?.baseline === 'Non' || indicator?.baseline === 'No';

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
            {isYesNoIndicator ? (
              <TextField
                select
                label={formatMessage(intl, "achievement.dialog.value", "label")}
                value={achieved}
                onChange={(e) => setAchieved(e.target.value)}
                fullWidth
                margin="normal"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select...</option>
                <option value="Oui">Oui</option>
                <option value="Non">Non</option>
              </TextField>
            ) : (
              <TextField
                label={formatMessage(intl, "achievement.dialog.value", "label")}
                value={achieved}
                onChange={(e) => setAchieved(e.target.value)}
                fullWidth
                type="number"
                margin="normal"
              />
            )}
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

function IntermediateIndicatorsTabPanel({
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
  const [filteredIndicators, setFilteredIndicators] = useState([]);

  const [achievementDialog, setAchievementDialog] = useState({
    open: false,
    indicator: null,
    achievement: null,
    isEdit: false,
  });

  // Load data on component mount
  useEffect(() => {
    fetchSections({});
    fetchIndicators(modulesManager, {});
    fetchIndicatorAchievements({});
  }, [fetchSections, fetchIndicators, fetchIndicatorAchievements, modulesManager]);

  // Filter indicators to show only intermediate indicators
  const intermediateIndicators = React.useMemo(() => {
    // Define intermediate indicator keywords or patterns
    const intermediateKeywords = [
      'Système de gestion',
      'Plan de communication',
      'satisfaits du processus',
      'plaintes résolues',
      'compétences mises en œuvre',
    ];

    // You could also filter by section if intermediate indicators have specific sections
    const intermediateSectionNames = [
      'Indicateurs intermédiaires',
      'Intermediate Indicators',
    ];

    // Filter indicators based on keywords or section names
    const filtered = indicators.filter(indicator => {
      // Check if indicator name contains any of the keywords
      const nameMatch = intermediateKeywords.some(keyword => 
        indicator.name?.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // Check if indicator belongs to intermediate sections
      const sectionMatch = indicator.section && 
        intermediateSectionNames.includes(indicator.section.name);
      
      return nameMatch || sectionMatch;
    });

    return filtered;
  }, [indicators]);

  // Process data to create a unified view with sections and indicators
  const processedData = React.useMemo(() => {
    const sectionMap = {};
    
    // Debug logging
    console.log('Intermediate Indicators:', intermediateIndicators);
    console.log('Achievements:', indicatorAchievements);

    // Group indicators by section
    intermediateIndicators.forEach((indicator) => {
      const sectionId = indicator.section?.id || 'no-section';
      if (!sectionMap[sectionId]) {
        sectionMap[sectionId] = {
          section: indicator.section || { id: 'no-section', name: formatMessage(intl, "indicator", "withoutSection") },
          indicators: [],
        };
      }

      // Find latest achievement for this indicator
      const latestAchievement = indicatorAchievements
        .filter((achievement) => achievement.indicator?.id === indicator.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

      sectionMap[sectionId].indicators.push({
        ...indicator,
        latestAchievement,
        achieved: latestAchievement?.achieved || indicator.achieved || (indicator.baseline === 'Non' ? 'Non' : '0'),
      });
    });

    // Convert to array and flatten for display
    const result = [];
    Object.values(sectionMap).forEach(({ section, indicators: sectionIndicators }) => {
      if (sectionIndicators.length > 0) {
        result.push({
          id: `section-${section.id}`,
          name: section.name,
          isSection: true,
        });
        result.push(...sectionIndicators);
      }
    });

    setFilteredIndicators(result);
    return result;
  }, [intermediateIndicators, indicatorAchievements]);

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

  // Mock fetch function that handles filtering
  const fetch = (params) => {
    let filtered = [...processedData];

    if (params.filters) {
      if (params.filters.name) {
        const nameLower = params.filters.name.toLowerCase();
        filtered = filtered.filter((item) => 
          item.isSection || item.name.toLowerCase().includes(nameLower)
        );
      }

      if (params.filters.section) {
        const sectionLower = params.filters.section.toLowerCase();
        filtered = filtered.filter((item) => 
          (item.isSection && item.name.toLowerCase().includes(sectionLower)) ||
          (!item.isSection && item.section?.name.toLowerCase().includes(sectionLower))
        );
      }
    }

    setFilteredIndicators(filtered);
    return Promise.resolve({});
  };

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
      // For Yes/No indicators, don't show percentage bar
      if (item.target === 'Oui' || item.target === 'Yes') {
        return item.achieved;
      }
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
    <IntermediateIndicatorsFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  return (
    <>
      <PublishedComponent
        pubRef="policyHolder.TabPanel"
        module="socialProtection"
        index={INTERMEDIATE_INDICATORS_LIST_TAB_VALUE}
        value={value}
      >
        <div className={classes.tableContainer}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
          }}
          >
            <h3>Indicateurs intermédiaires des résultats</h3>
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
            items={filteredIndicators}
            itemsPageInfo={{ totalCount: filteredIndicators.length }}
            fetchedItems={!fetchingSections && !fetchingIndicators && !fetchingIndicatorAchievements}
            fetchingItems={fetchingSections || fetchingIndicators || fetchingIndicatorAchievements}
            errorItems={null}
            tableTitle={formatMessageWithValues('IntermediateIndicatorsSearcher.results', { totalCount: filteredIndicators.length })}
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

const ConnectedIntermediateIndicatorsTabPanel = connect(mapStateToProps, mapDispatchToProps)(IntermediateIndicatorsTabPanel);

export { IntermediateIndicatorsTabLabel, ConnectedIntermediateIndicatorsTabPanel as IntermediateIndicatorsTabPanel };