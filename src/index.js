// Disable due to core architecture
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Tune } from '@material-ui/icons';
import { FormattedMessage } from '@openimis/fe-core';
import messages_en from './translations/en.json';
import reducer from './reducer';
import BenefitPlanMainMenu from './menus/BenefitPlanMainMenu';
import BenefitPlansPage from './pages/BenefitPlansPage';
import BenefitPlanPage from './pages/BenefitPlanPage';
import BenefitPackagePage from './pages/BenefitPackagePage';
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
import SectionsPage from './pages/SectionsPage';
import HomePageContainer from './components/dashboard/HomePageContainer';
import MonetaryTransferPage from './pages/MonetaryTransferPage';
import MonetaryTransfersPage from './pages/MonetaryTransfersPage';
import MEResultFrameworkPage from './pages/MEResultFrameworkPage';

const ROUTE_BENEFIT_PLANS = 'benefitPlans';
const ROUTE_BENEFIT_PLAN = 'benefitPlans/benefitPlan';
const ROUTE_BENEFIT_PACKAGE = 'benefitPackage';
const ROUTE_ME = 'me';

const ROUTE_RESULT_FRAMEWORK = `${ROUTE_ME}/result-framework`;
const ROUTE_MONETARY_TRANSFERS = `${ROUTE_ME}/monetary-transfers`;
const ROUTE_MONETARY_TRANSFER = `${ROUTE_ME}/monetary-transfers/monetary-transfer`;

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: messages_en }],
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
      path: 'socialProtection/sections',
      component: SectionsPage,
    },
    { path: ROUTE_MONETARY_TRANSFERS, component: MonetaryTransfersPage },
    { path: ROUTE_RESULT_FRAMEWORK, component: MEResultFrameworkPage },
    { path: `${ROUTE_MONETARY_TRANSFER}/:monetary_transfer_uuid?`, component: MonetaryTransferPage },
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
    { key: 'socialProtection.route.monetaryTransfer', ref: ROUTE_MONETARY_TRANSFER },
    { key: 'socialProtection.route.resultFramework"', ref: ROUTE_RESULT_FRAMEWORK },
    { key: 'socialProtection.route.indicators', ref: 'socialProtection/indicators' },
    { key: 'socialProtection.route.sections', ref: 'socialProtection/sections' },
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
    ResultsFrameworkTabLabel,
  ],
  'meResultFrameWork.TabPanel.panel': [
    DevelopmentIndicatorsTabPanel,
    IntermediateIndicatorsTabPanel,
    ResultsFrameworkTabPanel,
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
  ],
  'me.MainMenu': [
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
  ],
};

export const SocialProtectionModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
