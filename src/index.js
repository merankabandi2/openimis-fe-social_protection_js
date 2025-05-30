// Disable due to core architecture
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Tune, Dashboard, Sync } from '@material-ui/icons';
import { FormattedMessage } from '@openimis/fe-core';
import messages_en from './translations/en.json';
import messages_fr from './translations/fr.json';
import reducer from './reducer';
import BenefitPlanMainMenu from './menus/BenefitPlanMainMenu';
import BenefitPlansPage from './pages/BenefitPlansPage';
import BenefitPlanPage from './pages/BenefitPlanPage';
import BenefitPackagePage from './pages/BenefitPackagePage';
import KoboETLAdminPage from './pages/KoboETLAdminPage';
import BeneficiaryStatusPicker from './pickers/BeneficiaryStatusPicker';
import {
  BenefitPlanBeneficiariesListTabPanel,
  BenefitPlanBeneficiariesListTabLabel,
} from './components/BenefitPlanBeneficiariesListTab';
import {
  BenefitPlanBeneficiariesActiveTabLabel,
  BenefitPlanBeneficiariesActiveTabPanel,
} from './components/BenefitPlanBeneficiariesActiveTab';
import {
  BenefitPlanBeneficiariesPotentialTabLabel,
  BenefitPlanBeneficiariesPotentialTabPanel,
} from './components/BenefitPlanBeneficiariesPotentialTab';
import {
  BenefitPlanBeneficiariesSuspendedTabLabel,
  BenefitPlanBeneficiariesSuspendedTabPanel,
} from './components/BenefitPlanBeneficiariesSuspendedTab';
import {
  BenefitPlanBeneficiariesGraduatedTabLabel,
  BenefitPlanBeneficiariesGraduatedTabPanel,
} from './components/BenefitPlanBeneficiariesGraduatedTab';
import {
  BenefitPackageBenefitsTabLabel,
  BenefitPackageBenefitsTabPanel,
} from './components/BenefitPackageBenefitsTab';
import {
  BenefitPackageGrievancesTabLabel,
  BenefitPackageGrievancesTabPanel,
} from './components/BenefitPackageGrievancesTab';
import BenefitPlanSearcher from './components/BenefitPlanSearcher';
import BenefitPlanSearcherForEntities from './components/BenefitPlanSearcherForEntities';
import { BenefitPackageMembersTabLabel, BenefitPackageMembersTabPanel } from './components/BenefitPackageMembersTab';
import BenefitPlanTaskPreviewTable from './components/BenefitPlanTaskPreviewTable';
import BenefitPlanPicker from './pickers/BenefitPlanPicker';
import { BenefitPlansListTabLabel, BenefitPlansListTabPanel } from './components/BenefitPlansListTab';
import {
  BenefitPlanTaskItemFormatters,
  BenefitPlanTaskTableHeaders,
} from './components/tasks/BenefitPlanTasks';
import { BeneficiaryTaskItemFormatters, BeneficiaryTaskTableHeaders } from './components/tasks/BeneficiaryTasks';
import {
  CalculationSocialProtectionItemFormatters,
  CalculationSocialProtectionTableHeaders,
} from './components/tasks/CalculationSocialProtectionTasks';
import {
  UploadResolutionTaskTableHeaders,
  UploadResolutionItemFormatters,
  UploadConfirmationPanel,
} from './components/tasks/BeneficiaryUploadApprovalTask';
import { fetchBenefitPlanSchemaFields } from './actions';
import BenefitPlanHistorySearcher from './components/BenefitPlanHistorySearcher';
import { BenefitPlanChangelogTabLabel, BenefitPlanChangelogTabPanel } from './components/BenefitPlanChangelogTab';
import { BenefitPlanTaskTabLabel, BenefitPlanTaskTabPanel } from './components/BenefitPlanTaskTab';
import { BenefitPlanProvincesTabLabel, BenefitPlanProvincesTabPanel } from './components/BenefitPlanProvincesTab';
import {
  BENEFIT_PLAN_LABEL,
  RIGHT_BENEFIT_PLAN_SEARCH,
  MONETARY_TRANSFERS_ROUTE,
  RESULT_FRAMEWORK_ROUTE,
  RIGHT_MONETARY_TRANSFER_SEARCH,
  RIGHT_KOBO_ETL_VIEW,
  RIGHT_KOBO_ETL_RUN,
  KOBO_ETL_ROUTE,
} from './constants';
import BeneficiaryPicker from './pickers/BeneficiaryPicker';
import SectionPicker from './pickers/SectionPicker';
import { MicroProjectTabLabel, MicroProjectTabPanel } from './components/me/MicroProjectTabPanel';
import {
  SensitizationTrainingTabLabel,
  SensitizationTrainingTabPanel
} from './components/me/SensitizationTrainingTabPanel';
import {
  BehaviorChangePromotionTabLabel,
  BehaviorChangePromotionTabPanel
} from './components/me/BehaviorChangePromotionTabPanel';
import {
  DevelopmentIndicatorsTabLabel,
  DevelopmentIndicatorsTabPanel
} from './components/me/DevelopmentIndicatorsTabPanel';
import {
  IntermediateIndicatorsTabLabel,
  IntermediateIndicatorsTabPanel
} from './components/me/IntermediateIndicatorsTabPanel';
import {
  ResultsFrameworkTabLabel,
  ResultsFrameworkTabPanel
} from './components/me/ResultsFrameworkTabPanel';
import MEMainMenu from './menus/MEMainMenu';
import MEIndicatorsPage from './pages/MEIndicatorsPage';
import IndicatorsPage from './pages/IndicatorsPage';
import IndicatorPage from './pages/IndicatorPage';
import SectionsPage from './pages/SectionsPage';
import SectionPage from './pages/SectionPage';
import HomePageContainer from './components/dashboard/HomePageContainer';
import MonetaryTransferPage from './pages/MonetaryTransferPage';
import MonetaryTransfersPage from './pages/MonetaryTransfersPage';
import MEResultFrameworkPage from './pages/MEResultFrameworkPage';
import MEDashboard from './components/dashboards/MEDashboard';
import OptimizedMEDashboard from './components/dashboards/OptimizedMEDashboard';
import ResultsFrameworkDashboard from './components/dashboard/ResultsFrameworkDashboard';
import ActivitiesDashboard from './components/dashboard/ActivitiesDashboard';
import ActivitiesDashboardEnhanced from './components/dashboard/ActivitiesDashboardEnhanced';
import { useOptimizedDashboard, useDashboardSystem, useOptimizedDashboardComponent } from './hooks/useOptimizedDashboard';

const ROUTE_BENEFIT_PLANS = 'benefitPlans';
const ROUTE_BENEFIT_PLAN = 'benefitPlans/benefitPlan';
const ROUTE_BENEFIT_PACKAGE = 'benefitPackage';
const ROUTE_ME = 'me';

const ROUTE_RESULT_FRAMEWORK = `${ROUTE_ME}/result-framework`;
const ROUTE_MONETARY_TRANSFERS = `${ROUTE_ME}/monetary-transfers`;
const ROUTE_MONETARY_TRANSFER = `${ROUTE_ME}/monetary-transfers/monetary-transfer`;
const ROUTE_ME_DASHBOARD = `${ROUTE_ME}/dashboard`;
const ROUTE_RESULTS_FRAMEWORK_DASHBOARD = `${ROUTE_ME}/results-framework-dashboard`;
const ROUTE_ACTIVITIES_DASHBOARD = `${ROUTE_ME}/activities-dashboard`;
const ROUTE_KOBO_ETL_ADMIN = 'socialProtection/koboETLAdmin';

const DEFAULT_CONFIG = {
  translations: [
    { key: 'en', messages: messages_en },
    { key: 'fr', messages: messages_fr }
  ],
  reducers: [{ key: 'socialProtection', reducer }],
  'core.MainMenu': [
    { name: 'BenefitPlanMainMenu', component: BenefitPlanMainMenu },
    { name: 'MEMainMenu', component: MEMainMenu },
  ],
  'home.HomePage.customDashboard': HomePageContainer,
  'core.Router': [
    { path: ROUTE_BENEFIT_PLANS, component: BenefitPlansPage },
    { path: `${ROUTE_BENEFIT_PLAN}/:benefit_plan_uuid?`, component: BenefitPlanPage },
    {
      path: `${ROUTE_BENEFIT_PLAN}/:benefit_plan_uuid?/${ROUTE_BENEFIT_PACKAGE}/individual/:beneficiary_uuid?`,
      component: BenefitPackagePage,
    },
    {
      path: `${ROUTE_BENEFIT_PLAN}/:benefit_plan_uuid?/${ROUTE_BENEFIT_PACKAGE}/group/:group_beneficiaries_uuid?`,
      component: BenefitPackagePage,
    },
    {
      path: `${ROUTE_ME}/indicators`,
      component: MEIndicatorsPage,
    },
    {
      path: `${ROUTE_ME}/rf/indicators`,
      component: IndicatorsPage,
    },
    {
      path: 'socialProtection/indicators',
      component: IndicatorsPage,
    },
    {
      path: 'socialProtection/indicators/indicator/:indicator_id?',
      component: IndicatorPage,
    },
    {
      path: 'socialProtection/sections',
      component: SectionsPage,
    },
    {
      path: 'socialProtection/sections/section/:section_id?',
      component: SectionPage,
    },
    { path: ROUTE_MONETARY_TRANSFERS, component: MonetaryTransfersPage },
    { path: 'socialProtection/monetaryTransfers', component: MonetaryTransfersPage },
    { path: ROUTE_RESULT_FRAMEWORK, component: MEResultFrameworkPage },
    { path: `${ROUTE_MONETARY_TRANSFER}/:monetary_transfer_uuid?`, component: MonetaryTransferPage },
    { path: ROUTE_ME_DASHBOARD, component: MEDashboard },
    { path: ROUTE_RESULTS_FRAMEWORK_DASHBOARD, component: ResultsFrameworkDashboard },
    { path: ROUTE_ACTIVITIES_DASHBOARD, component: ActivitiesDashboard },
    { path: ROUTE_KOBO_ETL_ADMIN, component: KoboETLAdminPage },
  ],
  refs: [
    { key: 'socialProtection.route.benefitPlan', ref: ROUTE_BENEFIT_PLAN },
    { key: 'socialProtection.route.benefitPackage', ref: ROUTE_BENEFIT_PACKAGE },
    { key: 'socialProtection.BeneficiaryStatusPicker', ref: BeneficiaryStatusPicker },
    { key: 'socialProtection.BenefitPlanSearcher', ref: BenefitPlanSearcher },
    { key: 'socialProtection.BenefitPlanSearcherForEntities', ref: BenefitPlanSearcherForEntities },
    { key: 'socialProtection.BenefitPlanTaskPreviewTable', ref: BenefitPlanTaskPreviewTable },
    { key: 'socialProtection.BenefitPlanPicker', ref: BenefitPlanPicker },
    { key: 'socialProtection.BenefitPlansListTabLabel', ref: BenefitPlansListTabLabel },
    { key: 'socialProtection.BenefitPlansListTabPanel', ref: BenefitPlansListTabPanel },
    { key: 'socialProtection.fetchBenefitPlanSchemaFields', ref: fetchBenefitPlanSchemaFields },
    { key: 'socialProtection.BenefitPlanHistorySearcher', ref: BenefitPlanHistorySearcher },
    { key: 'socialProtection.BeneficiaryPicker', ref: BeneficiaryPicker },
    { key: 'socialProtection.SectionPicker', ref: SectionPicker },
    { key: 'socialProtection.route.monetaryTransfers', ref: ROUTE_MONETARY_TRANSFERS },
    { key: 'socialProtection.monetaryTransfers', ref: 'socialProtection/monetaryTransfers' },
    { key: 'socialProtection.route.monetaryTransfer', ref: ROUTE_MONETARY_TRANSFER },
    { key: 'socialProtection.route.resultFramework"', ref: ROUTE_RESULT_FRAMEWORK },
    { key: 'socialProtection.route.indicators', ref: 'socialProtection/indicators' },
    { key: 'socialProtection.route.indicator', ref: 'socialProtection/indicators/indicator' },
    { key: 'socialProtection.route.sections', ref: 'socialProtection/sections' },
    { key: 'socialProtection.route.section', ref: 'socialProtection/sections/section' },
    { key: 'socialProtection.route.meDashboard', ref: ROUTE_ME_DASHBOARD },
    { key: 'socialProtection.MEDashboard', ref: MEDashboard },
    { key: 'socialProtection.route.resultsFrameworkDashboard', ref: ROUTE_RESULTS_FRAMEWORK_DASHBOARD },
    { key: 'socialProtection.ResultsFrameworkDashboard', ref: ResultsFrameworkDashboard },
    { key: 'socialProtection.route.activitiesDashboard', ref: ROUTE_ACTIVITIES_DASHBOARD },
    { key: 'socialProtection.ActivitiesDashboard', ref: ActivitiesDashboard },
    { key: 'socialProtection.route.koboETLAdmin', ref: ROUTE_KOBO_ETL_ADMIN },
    { key: 'socialProtection.OptimizedMEDashboard', ref: OptimizedMEDashboard },
    { key: 'socialProtection.useOptimizedDashboard', ref: useOptimizedDashboard },
    { key: 'socialProtection.useDashboardSystem', ref: useDashboardSystem },
    { key: 'socialProtection.useOptimizedDashboardComponent', ref: useOptimizedDashboardComponent },
  ],
  'benefitPlan.TabPanel.label': [
    BenefitPlanBeneficiariesListTabLabel,
    BenefitPlanBeneficiariesPotentialTabLabel,
    BenefitPlanBeneficiariesActiveTabLabel,
    BenefitPlanBeneficiariesSuspendedTabLabel,
    BenefitPlanTaskTabLabel,
    BenefitPlanProvincesTabLabel,
  ],
  'benefitPlan.TabPanel.panel': [
    BenefitPlanBeneficiariesListTabPanel,
    BenefitPlanBeneficiariesPotentialTabPanel,
    BenefitPlanBeneficiariesActiveTabPanel,
    BenefitPlanBeneficiariesSuspendedTabPanel,
    BenefitPlanTaskTabPanel,
    BenefitPlanProvincesTabPanel,
  ],
  'benefitPackage.TabPanel.label': [
    BenefitPackageMembersTabLabel,
    BenefitPackageBenefitsTabLabel,
    BenefitPackageGrievancesTabLabel,
  ],
  'benefitPackage.TabPanel.panel': [
    BenefitPackageMembersTabPanel,
    BenefitPackageBenefitsTabPanel,
    BenefitPackageGrievancesTabPanel,
  ],
  'meIndicators.TabPanel.label': [
    MicroProjectTabLabel,
    SensitizationTrainingTabLabel,
    BehaviorChangePromotionTabLabel,
  ],
  'meIndicators.TabPanel.panel': [
    MicroProjectTabPanel,
    SensitizationTrainingTabPanel,
    BehaviorChangePromotionTabPanel,
  ],
  'meResultFrameWork.TabPanel.label': [
    DevelopmentIndicatorsTabLabel,
    IntermediateIndicatorsTabLabel,
  ],
  'meResultFrameWork.TabPanel.panel': [
    DevelopmentIndicatorsTabPanel,
    IntermediateIndicatorsTabPanel,
  ],
  'tasksManagement.tasks': [{
    text: <FormattedMessage module="socialProtection" id="benefitPlan.tasks.update.title" />,
    tableHeaders: BenefitPlanTaskTableHeaders,
    itemFormatters: BenefitPlanTaskItemFormatters,
    taskSource: ['BenefitPlanService'],
    taskCode: BENEFIT_PLAN_LABEL,
  },
  {
    text: <FormattedMessage module="socialProtection" id="beneficiary.tasks.title" />,
    tableHeaders: BeneficiaryTaskTableHeaders,
    itemFormatters: BeneficiaryTaskItemFormatters,
    taskSource: ['BeneficiaryService'],
  },
  {
    text: <FormattedMessage module="socialProtection" id="calculation.tasks.title" />,
    tableHeaders: CalculationSocialProtectionTableHeaders,
    itemFormatters: CalculationSocialProtectionItemFormatters,
    taskSource: ['calcrule_social_protection'],
  },
  {
    text: <FormattedMessage module="socialProtection" id="validation_import_valid_items.tasks.title" />,
    tableHeaders: UploadResolutionTaskTableHeaders,
    itemFormatters: UploadResolutionItemFormatters,
    taskSource: ['import_valid_items'],
    confirmationPanel: UploadConfirmationPanel,
  },
  ],
  'socialProtection.MainMenu': [
    {
      text: <FormattedMessage module="socialProtection" id="menu.socialProtection.benefitPlans" />,
      icon: <Tune />,
      route: '/benefitPlans',
      filter: (rights) => rights.includes(RIGHT_BENEFIT_PLAN_SEARCH),
      id: 'socialProtection.benefitPlans',
    },
    {
      text: <FormattedMessage module="socialProtection" id="menu.socialProtection.koboETLAdmin" />,
      icon: <Sync />,
      route: `/${ROUTE_KOBO_ETL_ADMIN}`,
      filter: (rights) => rights.includes(RIGHT_KOBO_ETL_VIEW),
      id: 'socialProtection.koboETLAdmin',
    },
  ],
  'me.MainMenu': [
    {
      text: <FormattedMessage module="socialProtection" id="menu.socialProtection.dashboard" />,
      icon: <Dashboard />,
      route: `/${ROUTE_ME_DASHBOARD}`,
      filter: (rights) => rights.includes(RIGHT_BENEFIT_PLAN_SEARCH),
      id: 'socialProtection.me.dashboard',
    },
    {
      text: <FormattedMessage module="socialProtection" id="menu.socialProtection.indicators" />,
      icon: <Tune />,
      route: '/me/indicators',
      filter: (rights) => rights.includes(RIGHT_BENEFIT_PLAN_SEARCH),
      id: 'socialProtection.me.indicators',
    },
    {
      text: <FormattedMessage module="socialProtection" id="menu.socialProtection.monetaryTransfer" />,
      icon: <Tune />,
      route: `/${MONETARY_TRANSFERS_ROUTE}`,
      filter: (rights) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH),
      id: 'socialProtection.me.monetaryTransfers',
    },
    {
      text: <FormattedMessage module="socialProtection" id="menu.socialProtection.resultsFramework" />,
      icon: <Tune />,
      route: `/${RESULT_FRAMEWORK_ROUTE}`,
      filter: (rights) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH),
      id: 'socialProtection.me.resultsFramework',
    },
    {
      text: <FormattedMessage module="socialProtection" id="menu.socialProtection.resultsFrameworkDashboard" />,
      icon: <Dashboard />,
      route: `/${ROUTE_RESULTS_FRAMEWORK_DASHBOARD}`,
      filter: (rights) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH),
      id: 'socialProtection.me.resultsFrameworkDashboard',
    },
    {
      text: <FormattedMessage module="socialProtection" id="menu.socialProtection.activitiesDashboard" />,
      icon: <Dashboard />,
      route: `/${ROUTE_ACTIVITIES_DASHBOARD}`,
      filter: (rights) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH),
      id: 'socialProtection.me.activitiesDashboard',
    },
  ],
};

export const SocialProtectionModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
