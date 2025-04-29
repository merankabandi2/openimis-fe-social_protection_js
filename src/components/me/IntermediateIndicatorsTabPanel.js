import React, { useState } from 'react';
import { Tab } from '@material-ui/core';
import {
  PublishedComponent,
  useTranslations,
  useModulesManager,
  Searcher,
} from '@openimis/fe-core';
import { makeStyles } from '@material-ui/styles';
import {
  INTERMEDIATE_INDICATORS_LIST_TAB_VALUE, MODULE_NAME, DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS,
} from '../../constants';
import IntermediateIndicatorsFilter from './IntermediateIndicatorsFilter';

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

// Static data for intermediate indicators
const intermediateIndicatorsData = [
  {
    id: 'section1',
    name: 'Renforcer les capacités de gestion',
    isSection: true,
  },
  {
    id: 1,
    name: 'Système de gestion des informations sur la protection sociale mis en place (Oui / Non)',
    pbc: '',
    baseline: 'Non',
    target: 'Oui',
    achieved: 'Oui',
    observation: 'La plateforme technique est disponible',
  },
  {
    id: 2,
    name: 'Plan de communication développé (Oui / Non)',
    pbc: '',
    baseline: 'Non',
    target: 'Oui',
    achieved: 'Oui',
    observation: 'La stratégie de communication est disponible',
  },
  {
    id: 'section2',
    name: 'Renforcer les filets de sécurité',
    isSection: true,
  },
  {
    id: 3,
    name: 'Pourcentage des bénéficiaires satisfaits du processus d\'inscription au programme',
    pbc: '',
    baseline: '0.00',
    target: '80.00',
    achieved: '73.00',
    observation: 'Enquête de perception réalisée en mars 2023',
  },
  {
    id: 4,
    name: 'Pourcentage des plaintes résolues',
    pbc: '',
    baseline: '0.00',
    target: '90.00',
    achieved: '82.00',
    observation: 'Rapport du mécanisme de gestion des plaintes du 1er trimestre 2023',
  },
  {
    id: 'section3',
    name: 'Promouvoir l\'inclusion productive et l\'accès à l\'emploi',
    isSection: true,
  },
  {
    id: 5,
    name: 'Des activités de développement des compétences mises en œuvre (Oui / Non)',
    pbc: '',
    baseline: 'Non',
    target: 'Oui',
    achieved: 'Oui',
    observation: 'Formation en cours sur les métiers dans 5 provinces',
  },
];

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

function IntermediateIndicatorsTabPanel({
  value,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const [filteredIndicators, setFilteredIndicators] = useState(intermediateIndicatorsData);

  const headers = () => [
    'resultFrameworkIndicators.name',
    'resultFrameworkIndicators.pbc',
    'resultFrameworkIndicators.baseline',
    'resultFrameworkIndicators.target',
    'resultFrameworkIndicators.achieved',
    'resultFrameworkIndicators.observation',
  ];

  const sorts = () => [
    ['name', true],
    ['pbc', true],
    ['baseline', true],
    ['target', true],
    ['achieved', true],
    ['observation', true],
  ];

  const rowIdentifier = (indicator) => indicator.id;

  // Mock fetch function that would be replaced with an actual API call in a real implementation
  const fetch = (params) => {
    // Apply filters if any
    let filtered = [...intermediateIndicatorsData];

    if (params.filters) {
      if (params.filters.name) {
        const nameLower = params.filters.name.toLowerCase();
        filtered = filtered.filter((item) => !item.isSection && item.name.toLowerCase().includes(nameLower));
      }

      if (params.filters.section) {
        const sectionLower = params.filters.section.toLowerCase();
        // First find sections that match the filter
        const matchingSections = intermediateIndicatorsData
          .filter((item) => item.isSection && item.name.toLowerCase().includes(sectionLower))
          .map((item) => item.id);

        // Then filter to keep sections and items that belong to matching sections
        filtered = filtered.filter((item) => (item.isSection ? item.name.toLowerCase().includes(sectionLower)
          : matchingSections.includes(item.id.toString().split('_')[0])));
      }
    }

    setFilteredIndicators(filtered);
    return Promise.resolve({});
  };

  const itemFormatters = () => [
    (indicator) => (
      indicator.isSection ? (
        <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
          {indicator.name}
        </span>
      ) : indicator.name
    ),
    (indicator) => (indicator.isSection ? '' : indicator.pbc),
    (indicator) => (indicator.isSection ? '' : indicator.baseline),
    (indicator) => (
      indicator.isSection ? indicator.target : (
        <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
          {indicator.target}
        </span>
      )
    ),
    (indicator) => {
      if (indicator.isSection) return '';
      return (
        <>
          <AchievementRateBar achieved={indicator.achieved} target={indicator.target} classes={classes} />
          {`(${indicator.achieved})`}
        </>
      );
    },
    (indicator) => (indicator.isSection ? '' : indicator.observation),
  ];

  const defaultFilters = () => ({});

  const isRowSectionHeader = (_, indicator) => indicator.isSection;

  const filterPane = ({ filters, onChangeFilters }) => (
    <IntermediateIndicatorsFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="socialProtection"
      index={INTERMEDIATE_INDICATORS_LIST_TAB_VALUE}
      value={value}
    >
      <div className={classes.tableContainer}>
        <h3>Indicateurs intermédiaires des résultats</h3>
        <Searcher
          module="social_protection"
          fetch={fetch}
          items={filteredIndicators}
          itemsPageInfo={{ totalCount: filteredIndicators.length }}
          fetchedItems
          fetchingItems={false}
          errorItems={null}
          tableTitle={formatMessageWithValues('IntermediateIndicatorsSearcher.results', { totalCount: filteredIndicators.length })}
          headers={headers}
          itemFormatters={itemFormatters}
          sorts={sorts}
          rowsPerPageOptions={100}
          defaultPageSize={100}
          rowIdentifier={rowIdentifier}
          rowDisabled={isRowSectionHeader}
          rowHighlighted={isRowSectionHeader}
          defaultFilters={defaultFilters()}
        />
      </div>
    </PublishedComponent>
  );
}

export { IntermediateIndicatorsTabLabel, IntermediateIndicatorsTabPanel };
