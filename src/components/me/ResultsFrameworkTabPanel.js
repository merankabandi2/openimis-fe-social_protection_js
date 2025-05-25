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
  baseApiUrl,
  apiHeaders,
  combine,
} from '@openimis/fe-core';
import { makeStyles } from '@material-ui/styles';
import {
  RESULTS_FRAMEWORK_TAB_VALUE, MODULE_NAME,
} from '../../constants';
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

function ResultsFrameworkTabLabel({
  onChange, tabStyle, isSelected, modulesManager,
}) {
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(RESULTS_FRAMEWORK_TAB_VALUE)}
      selected={isSelected(RESULTS_FRAMEWORK_TAB_VALUE)}
      value={RESULTS_FRAMEWORK_TAB_VALUE}
      label={formatMessage('resultsFramework.label')}
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
}) {
  const [achieved, setAchieved] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (achievement && isEdit) {
      setAchieved(achievement.achieved || '');
      setDate(achievement.date || '');
      setNotes(achievement.notes || '');
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
      notes,
    };
    onSave(achievementData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Achievement' : 'Add Achievement'}
        {' '}
        -
        {indicator?.name}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Achieved Value"
              value={achieved}
              onChange={(e) => setAchieved(e.target.value)}
              fullWidth
              type="number"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Date"
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
              label="Notes"
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
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ResultsFrameworkTabPanel({
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
  const { formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);

  const [achievementDialog, setAchievementDialog] = useState({
    open: false,
    indicator: null,
    achievement: null,
    isEdit: false,
  });

  // Load data on component mount
  useEffect(() => {
    fetchSections({});
    fetchIndicators({});
    fetchIndicatorAchievements({});
  }, [fetchSections, fetchIndicators, fetchIndicatorAchievements]);

  // Process data to create a unified view with sections and indicators
  const processedData = React.useMemo(() => {
    const sectionMap = {};

    // Group indicators by section
    indicators.forEach((indicator) => {
      const sectionId = indicator.section?.id || 'no-section';
      if (!sectionMap[sectionId]) {
        sectionMap[sectionId] = {
          section: indicator.section || { id: 'no-section', name: 'Indicators without section' },
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
        achieved: latestAchievement?.achieved || '0',
      });
    });

    // Convert to array and flatten for display
    const result = [];
    Object.values(sectionMap).forEach(({ section, indicators: sectionIndicators }) => {
      result.push({
        id: `section-${section.id}`,
        name: section.name,
        isSection: true,
      });
      result.push(...sectionIndicators);
    });

    return result;
  }, [sections, indicators, indicatorAchievements]);

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
      updateIndicatorAchievement(achievementData, 'Update achievement');
    } else {
      createIndicatorAchievement(achievementData, 'Create achievement');
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
            Add
          </Button>
          {item.latestAchievement && (
            <Button
              size="small"
              color="secondary"
              onClick={() => handleEditAchievement(item)}
              className={classes.addButton}
            >
              Edit
            </Button>
          )}
        </div>
      );
    },
  ];

  const defaultFilters = () => ({});

  const isRowSectionHeader = (_, item) => item.isSection;

  return (
    <>
      <PublishedComponent
        pubRef="policyHolder.TabPanel"
        module="socialProtection"
        index={RESULTS_FRAMEWORK_TAB_VALUE}
        value={value}
      >
        <div className={classes.tableContainer}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
          }}
          >
            <h3>Results Framework - Indicators and Achievements</h3>
            <Button
              color="primary"
              variant="contained"
              onClick={() => historyPush(modulesManager, history, 'socialProtection.route.indicators')}
            >
              Manage Indicators
            </Button>
          </div>
          <Searcher
            module="social_protection"
            fetch={fetch}
            items={processedData}
            itemsPageInfo={{ totalCount: processedData.length }}
            fetchedItems={!fetchingSections && !fetchingIndicators && !fetchingIndicatorAchievements}
            fetchingItems={fetchingSections || fetchingIndicators || fetchingIndicatorAchievements}
            errorItems={null}
            tableTitle={formatMessageWithValues('ResultsFrameworkSearcher.results', { totalCount: processedData.length })}
            headers={headers}
            itemFormatters={itemFormatters}
            sorts={sorts}
            rowsPerPageOptions={[100]}
            defaultPageSize={100}
            rowIdentifier={rowIdentifier}
            rowDisabled={isRowSectionHeader}
            rowHighlighted={isRowSectionHeader}
            defaultFilters={defaultFilters()}
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

const ConnectedResultsFrameworkTabPanel = connect(mapStateToProps, mapDispatchToProps)(ResultsFrameworkTabPanel);

export { ResultsFrameworkTabLabel, ConnectedResultsFrameworkTabPanel as ResultsFrameworkTabPanel };
