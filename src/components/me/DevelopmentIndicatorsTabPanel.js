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
  DEVELOPMENT_INDICATORS_LIST_TAB_VALUE, MODULE_NAME, DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS,
} from '../../constants';
import DevelopmentIndicatorsFilter from './DevelopmentIndicatorsFilter';

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

// Static data kept from original component
const developmentIndicatorsData = [
  {
    id: 'section1',
    name: 'Renforcer les capacités de gestion',
    isSection: true,
  },
  {
    id: 1,
    name: 'Ménages des zones ciblées inscrits au Registre social national (nombre)',
    pbc: '',
    baseline: '0.00',
    target: '250,000.00',
    achieved: '127 350',
    observation: 'Ménages appuyés de la s/c 1.1, 1.2, compo 4 et 6',
  },
  {
    id: 2,
    name: 'Ménages des zones ciblées inscrits au Registre social national - réfugiés, ventilés par sexe (Nombre)',
    pbc: '',
    baseline: '0.00',
    target: '15,000.00',
    achieved: '3,395',
    observation: 'Ménages de 2 camps des réfugiés de la Province Ruyigi (Bwagiriza et Nyankanda)',
  },
  {
    id: 3,
    name: 'Ménages des zones ciblées inclus dans le registre social national - communautés d\'accueil, ventilés par sexe (nombre)',
    pbc: '',
    baseline: '0.00',
    target: '25,000.00',
    achieved: '5,633',
    observation: '5 633 transferts monétaires aux ménages des communautés hôtes en communes Butezi (966), Bweru (360) et Ryigi (1 241) en Province Ruyigi, Gasorwe (1 800) en Province Munynga et Kiremba (1 266) en Province Ngozi',
  },
  {
    id: 4,
    name: 'Proportion des ménages inscrits dans la base de données des bénéficiaires vivant sous le seuil d\'extrême pauvreté (Pourcentage)',
    pbc: '',
    baseline: '0.00',
    target: '80.00',
    achieved: '0',
    observation: '',
  },
  {
    id: 'section2',
    name: 'Renforcer les filets de sécurité',
    isSection: true,
  },
  {
    id: 5,
    name: 'Bénéficiaires des programmes de protection sociale (CRI, nombre)',
    pbc: '',
    baseline: '56,090.00',
    target: '305,000.00',
    achieved: '210,636',
    observation: 'Ménages appuyés de la s/c 1.1, 1.2, de la compo 4 et 6 + les bénéficiaires de la vague1',
  },
  // Add all remaining indicators from section 1
  {
    id: 'section3',
    name: 'Promouvoir l\'inclusion productive et l\'accès à l\'emploi',
    isSection: true,
  },
  {
    id: 10,
    name: 'Bénéficiaires d\'interventions axées sur l\'emploi (CRI, nombre)',
    pbc: '',
    baseline: '0.00',
    target: '150,000.00',
    achieved: '0',
    observation: '',
  },
  {
    id: 'section4',
    name: 'Apporter une réponse immédiate et efficace à une crise ou une urgence éligible',
    isSection: true,
  },
  {
    id: 15,
    name: 'Agriculteurs ayant bénéficié d\'actifs ou de services agricoles (CRI, nombre)',
    pbc: '',
    baseline: '0.00',
    target: '50,000.00',
    achieved: '50,717',
    observation: 'Bénéficiaires de la composante 6 (CERC)',
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

function DevelopmentIndicatorsTabPanel({
  value,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const [filteredIndicators, setFilteredIndicators] = useState(developmentIndicatorsData);

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
    let filtered = [...developmentIndicatorsData];

    if (params.filters) {
      if (params.filters.name) {
        const nameLower = params.filters.name.toLowerCase();
        filtered = filtered.filter((item) => !item.isSection && item.name.toLowerCase().includes(nameLower));
      }

      if (params.filters.section) {
        const sectionLower = params.filters.section.toLowerCase();
        // First find sections that match the filter
        const matchingSections = developmentIndicatorsData
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
    <DevelopmentIndicatorsFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="socialProtection"
      index={DEVELOPMENT_INDICATORS_LIST_TAB_VALUE}
      value={value}
    >
      <div className={classes.tableContainer}>
        <h3>Indicateurs des objectifs de développement du projet par objectifs/résultats</h3>
        <Searcher
          module="social_protection"
          fetch={fetch}
          items={filteredIndicators}
          itemsPageInfo={{ totalCount: filteredIndicators.length }}
          fetchedItems
          fetchingItems={false}
          errorItems={null}
          tableTitle={formatMessageWithValues('DevelopmentIndicatorsSearcher.results', { totalCount: filteredIndicators.length })}
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

export { DevelopmentIndicatorsTabLabel, DevelopmentIndicatorsTabPanel };
