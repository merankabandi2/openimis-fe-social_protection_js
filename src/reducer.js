// Disabled due to consistency with other modules
/* eslint-disable default-param-last */

import {
  decodeId,
  dispatchMutationErr,
  dispatchMutationReq,
  dispatchMutationResp,
  formatGraphQLError,
  formatServerError,
  pageInfo,
  parseData,
} from '@openimis/fe-core';
import {
  CLEAR, ERROR, REQUEST, SUCCESS,
} from './util/action-type';
import {
  RESULT_FRAMEWORK_SNAPSHOTS_REQ,
  RESULT_FRAMEWORK_SNAPSHOTS_RESP,
  RESULT_FRAMEWORK_SNAPSHOTS_ERR,
  CALCULATE_INDICATOR_VALUE_REQ,
  CALCULATE_INDICATOR_VALUE_RESP,
  CALCULATE_INDICATOR_VALUE_ERR,
  CREATE_SNAPSHOT_REQ,
  CREATE_SNAPSHOT_RESP,
  CREATE_SNAPSHOT_ERR,
  GENERATE_DOCUMENT_REQ,
  GENERATE_DOCUMENT_RESP,
  GENERATE_DOCUMENT_ERR,
  FINALIZE_SNAPSHOT_REQ,
  FINALIZE_SNAPSHOT_RESP,
  FINALIZE_SNAPSHOT_ERR,
} from './actions/resultFramework';

export const ACTION_TYPE = {
  MUTATION: 'BENEFIT_PLAN_MUTATION',
  TASK_MUTATION: 'TASK_MANAGEMENT_MUTATION',
  SEARCH_BENEFIT_PLANS: 'BENEFIT_PLAN_BENEFIT_PLANS',
  GET_BENEFIT_PLAN: 'BENEFIT_PLAN_BENEFIT_PLAN',
  CREATE_BENEFIT_PLAN: 'BENEFIT_PLAN_CREATE_BENEFIT_PLAN',
  DELETE_BENEFIT_PLAN: 'BENEFIT_PLAN_DELETE_BENEFIT_PLAN',
  CLOSE_BENEFIT_PLAN: 'BENEFIT_PLAN_CLOSE_BENEFIT_PLAN',
  UPDATE_BENEFIT_PLAN: 'BENEFIT_PLAN_UPDATE_BENEFIT_PLAN',
  BENEFIT_PLAN_CODE_FIELDS_VALIDATION: 'BENEFIT_PLAN_CODE_FIELDS_VALIDATION',
  BENEFIT_PLAN_NAME_FIELDS_VALIDATION: 'BENEFIT_PLAN_NAME_FIELDS_VALIDATION',
  BENEFIT_PLAN_SCHEMA_FIELDS_VALIDATION: 'BENEFIT_PLAN_SCHEMA_FIELDS_VALIDATION',
  BENEFIT_PLAN_CODE_SET_VALID: 'BENEFIT_PLAN_CODE_SET_VALID',
  BENEFIT_PLAN_NAME_SET_VALID: 'BENEFIT_PLAN_NAME_SET_VALID',
  BENEFIT_PLAN_SCHEMA_SET_VALID: 'BENEFIT_PLAN_NAME_SET_VALID',
  SEARCH_INDICATORS: 'SEARCH_INDICATORS',
  GET_INDICATOR: 'GET_INDICATOR',
  CLEAR_INDICATOR: 'CLEAR_INDICATOR',
  SEARCH_SECTIONS: 'SEARCH_SECTIONS',
  GET_SECTION: 'GET_SECTION',
  SECTION: 'SECTION',
  SEARCH_INDICATOR_ACHIEVEMENTS: 'SEARCH_INDICATOR_ACHIEVEMENTS',
  CREATE_SECTION: 'CREATE_SECTION',
  UPDATE_SECTION: 'UPDATE_SECTION',
  DELETE_SECTION: 'DELETE_SECTION',
  CREATE_INDICATOR: 'CREATE_INDICATOR',
  UPDATE_INDICATOR: 'UPDATE_INDICATOR',
  DELETE_INDICATOR: 'DELETE_INDICATOR',
  CREATE_INDICATOR_ACHIEVEMENT: 'CREATE_INDICATOR_ACHIEVEMENT',
  UPDATE_INDICATOR_ACHIEVEMENT: 'UPDATE_INDICATOR_ACHIEVEMENT',
  DELETE_INDICATOR_ACHIEVEMENT: 'DELETE_INDICATOR_ACHIEVEMENT',
  SEARCH_BENEFICIARIES: 'BENEFICIARY_BENEFICIARIES',
  SEARCH_GROUP_BENEFICIARIES: 'GROUP_BENEFICIARY_GROUP_BENEFICIARIES',
  UPDATE_GROUP_BENEFICIARY: 'GROUP_BENEFICIARY_UPDATE_GROUP_BENEFICIARY',
  GET_BENEFICIARY: 'BENEFICIARY_BENEFICIARY',
  GET_BENEFICIARIES_GROUP: 'GROUP_BENEFICIARY_GET_GROUP',
  UPDATE_BENEFICIARY: 'BENEFICIARY_UPDATE_BENEFICIARY',
  BULK_UPDATE_BENEFICIARY_STATUS: 'BENEFICIARY_BULK_UPDATE_STATUS',
  BULK_UPDATE_GROUP_BENEFICIARY_STATUS: 'GROUP_BENEFICIARY_BULK_UPDATE_STATUS',
  CSV_UPDATE_GROUP_BENEFICIARY_STATUS: 'GROUP_BENEFICIARY_CSV_UPDATE_STATUS',
  BENEFICIARY_EXPORT: 'BENEFICIARY_EXPORT',
  GROUP_BENEFICIARY_EXPORT: 'GROUP_BENEFICIARY_EXPORT',
  GET_WORKFLOWS: 'GET_WORKFLOWS',
  GET_BENEFIT_PLAN_UPLOAD_HISTORY: 'GET_UPLOAD_HISTORY',
  GET_FIELDS_FROM_BF_SCHEMA: 'GET_FIELDS_FROM_BF_SCHEMA',
  GET_PENDING_BENEFICIARIES_UPLOAD: 'GET_PENDING_BENEFICIARIES_UPLOAD',
  RESOLVE_TASK: 'TASK_MANAGEMENT_RESOLVE_TASK',
  SEARCH_BENEFIT_PLANS_HISTORY: 'BENEFIT_PLAN_BENEFIT_PLANS_HISTORY',
  SEARCH_BENEFIT_PLAN_PROVINCES: 'BENEFIT_PLAN_PROVINCES',
  SEARCH_SENSITIZATION_TRAININGS: 'SENSITIZATION_TRAININGS',
  SEARCH_BEHAVIOR_CHANGE_PROMOTIONS: 'BEHAVIOR_CHANGE_PROMOTIONS',
  SEARCH_MICRO_PROJECTS: 'MICRO_PROJECTS',
  SEARCH_MONETARY_TRANSFERS: 'ME_MONETARY_TRANSFERS',
  GET_MONETARY_TRANSFER: 'ME_MONETARY_TRANSFER',
  CREATE_MONETARY_TRANSFER: 'ME_MUTATION_CREATE_MONETARY_TRANSFER',
  UPDATE_MONETARY_TRANSFER: 'ME_MUTATION_UPDATE_MONETARY_TRANSFER',
  DELETE_MONETARY_TRANSFER: 'ME_MUTATION_DELETE_MONETARY_TRANSFER',
  GENERATE_PROVINCE_PAYROLL: 'GENERATE_PROVINCE_PAYROLL',
  ADD_PROVINCE_PAYMENT_POINT: 'socialProtection/ADD_PROVINCE_PAYMENT_POINT',
  DELETE_PROVINCE_PAYMENT_POINT: 'socialProtection/DELETE_PROVINCE_PAYMENT_POINT',
};

export const MUTATION_SERVICE = {
  MONETARY_TRANSFER: {
    CREATE: 'createMonetaryTransfer',
    DELETE: 'deleteMonetaryTransfer',
    UPDATE: 'updateMonetaryTransfer',
  },
  PAYROLL: {
    GENERATE_PROVINCE: 'generateProvincePayroll',
    ADD_PROVINCE_PAYMENT_POINT: 'addProvincePaymentPoint',
    DELETE_PROVINCE_PAYMENT_POINT: 'deleteProvincePaymentPoint',
  },
  SECTION: {
    CREATE: 'createSection',
    UPDATE: 'updateSection',
    DELETE: 'deleteSection',
  },
  INDICATOR: {
    CREATE: 'createIndicator',
    UPDATE: 'updateIndicator',
    DELETE: 'deleteIndicator',
  },
  INDICATOR_ACHIEVEMENT: {
    CREATE: 'createIndicatorAchievement',
    UPDATE: 'updateIndicatorAchievement',
    DELETE: 'deleteIndicatorAchievement',
  },
  SEARCH_PROJECTS: 'BENEFIT_PLAN_PROJECTS',
  GET_PROJECT: 'BENEFIT_PLAN_PROJECT',
  CREATE_PROJECT: 'BENEFIT_PLAN_CREATE_PROJECT',
  UPDATE_PROJECT: 'BENEFIT_PLAN_UPDATE_PROJECT',
  DELETE_PROJECT: 'BENEFIT_PLAN_DELETE_PROJECT',
  UNDO_DELETE_PROJECT: 'BENEFIT_PLAN_UNDO_DELETE_PROJECT',
  PROJECT_NAME_FIELDS_VALIDATION: 'PROJECT_NAME_FIELDS_VALIDATION',
  PROJECT_NAME_SET_VALID: 'PROJECT_NAME_SET_VALID',
};

function reducer(
  state = {
    submittingMutation: false,
    mutation: {},
    fetchingBenefitPlans: false,
    errorBenefitPlans: null,
    fetchedBenefitPlans: false,
    benefitPlans: [],
    benefitPlansPageInfo: {},
    benefitPlansTotalCount: 0,
    fetchingBenefitPlan: false,
    errorBenefitPlan: null,
    fetchedBenefitPlan: false,
    benefitPlan: null,
    fetchingBeneficiaries: false,
    fetchedBeneficiaries: false,
    beneficiaries: [],
    beneficiariesPageInfo: {},
    beneficiariesTotalCount: 0,
    errorBeneficiaries: null,
    fetchingBeneficiary: false,
    fetchedBeneficiary: false,
    beneficiary: null,
    errorBeneficiary: null,
    fetchingBeneficiaryExport: true,
    fetchedBeneficiaryExport: false,
    beneficiaryExport: null,
    beneficiaryExportPageInfo: {},
    errorBeneficiaryExport: null,
    group: null,
    fetchingGroup: false,
    fetchedGroup: false,
    errorGroup: null,
    fetchingGroupBeneficiaryExport: true,
    fetchedGroupBeneficiaryExport: false,
    groupBeneficiaryExport: null,
    groupBeneficiaryExportPageInfo: {},
    errorGroupBeneficiaryExport: null,
    fetchingGroupBeneficiaries: true,
    fetchedGroupBeneficiaries: false,
    groupBeneficiaries: [],
    groupBeneficiariesPageInfo: {},
    groupBeneficiariesTotalCount: 0,
    errorGroupBeneficiaries: null,
    fetchingWorkflows: true,
    fetchedWorkflows: false,
    workflows: [],
    workflowsPageInfo: {},
    workflowsGroupBeneficiaries: null,
    errorWorkflows: null,
    fetchingBeneficiaryDataUploadHistory: true,
    fetchedBeneficiaryDataUploadHistory: false,
    beneficiaryDataUploadHistory: [],
    beneficiaryDataUploadHistoryPageInfo: {},
    beneficiaryDataUploadHistoryGroupBeneficiaries: null,
    errorBeneficiaryDataUploadHistory: null,
    fieldsFromBfSchema: [],
    fetchingFieldsFromBfSchema: false,
    fetchedFieldsFromBfSchema: false,
    errorFieldsFromBfSchema: null,
    pendingBeneficiaries: [],
    fetchingPendingBeneficiaries: true,
    fetchedPendingBeneficiaries: false,
    errorPendingBeneficiaries: null,
    pendingBeneficiariesPageInfo: {},
    fetchingBenefitPlansHistory: false,
    errorBenefitPlansHistory: null,
    fetchedBenefitPlansHistory: false,
    benefitPlansHistory: [],
    benefitPlansHistoryPageInfo: {},
    benefitPlansHistoryTotalCount: 0,
    fetchingBenefitPlanProvinces: false,
    fetchedBenefitPlanProvinces: false,
    benefitPlanProvinces: [],
    benefitPlanProvincesPageInfo: {},
    benefitPlanProvincesTotalCount: 0,
    errorBenefitPlanProvinces: null,
    fetchingSensitizationTrainings: false,
    fetchedSensitizationTrainings: false,
    sensitizationTrainings: [],
    sensitizationTrainingsPageInfo: {},
    sensitizationTrainingsTotalCount: 0,
    errorSensitizationTrainings: null,
    fetchingBehaviorChangePromotions: false,
    fetchedBehaviorChangePromotions: false,
    behaviorChangePromotions: [],
    behaviorChangePromotionsPageInfo: {},
    behaviorChangePromotionsTotalCount: 0,
    errorBehaviorChangePromotions: null,
    fetchingMicroProjects: false,
    fetchedMicroProjects: false,
    microProjects: [],
    microProjectsPageInfo: {},
    microProjectsTotalCount: 0,
    errorMicroProjects: null,
    fetchingMonetaryTransfers: false,
    fetchedMonetaryTransfers: false,
    monetaryTransfers: [],
    monetaryTransfersPageInfo: {},
    monetaryTransfersTotalCount: 0,
    errorMonetaryTransfers: null,
    fetchingMonetaryTransfer: false,
    fetchedMonetaryTransfer: false,
    monetaryTransfer: null,
    errorMonetaryTransfer: null,
    addingProvincePaymentPoint: false,
    addedProvincePaymentPoint: null,
    errorProvincePaymentPoint: null,
    deletingProvincePaymentPoint: false,
    deletedProvincePaymentPoint: null,
    errorDeleteProvincePaymentPoint: null,
    fetchingIndicators: false,
    fetchedIndicators: false,
    indicators: [],
    indicatorsPageInfo: {},
    indicatorsTotalCount: 0,
    errorIndicators: null,
    fetchingIndicator: false,
    fetchedIndicator: false,
    indicator: null,
    errorIndicator: null,
    fetchingSections: false,
    fetchedSections: false,
    sections: [],
    sectionsPageInfo: {},
    sectionsTotalCount: 0,
    errorSections: null,
    fetchingSection: false,
    fetchedSection: false,
    section: null,
    errorSection: null,
    fetchingIndicatorAchievements: false,
    fetchedIndicatorAchievements: false,
    indicatorAchievements: [],
    indicatorAchievementsPageInfo: {},
    indicatorAchievementsTotalCount: 0,
    errorIndicatorAchievements: null,
    fetchingProjects: false,
    errorProjects: null,
    fetchedProjects: false,
    projects: [],
    projectsPageInfo: {},
    projectsTotalCount: 0,
    // Result Framework states
    fetchingResultFrameworkSnapshots: false,
    fetchedResultFrameworkSnapshots: false,
    resultFrameworkSnapshots: [],
    resultFrameworkSnapshotsPageInfo: {},
    resultFrameworkSnapshotsTotalCount: 0,
    errorResultFrameworkSnapshots: null,
    calculatingIndicatorValue: false,
    calculatedIndicatorValue: null,
    errorCalculateIndicatorValue: null,
  },
  action,
) {
  switch (action.type) {
    case REQUEST(ACTION_TYPE.GET_FIELDS_FROM_BF_SCHEMA):
      return {
        ...state,
        fieldsFromBfSchema: [],
        fetchingFieldsFromBfSchema: true,
        fetchedFieldsFromBfSchema: false,
        errorFieldsFromBfSchema: null,
      };
    case REQUEST(ACTION_TYPE.GET_PENDING_BENEFICIARIES_UPLOAD):
      return {
        ...state,
        pendingBeneficiaries: [],
        fetchingPendingBeneficiaries: true,
        fetchedPendingBeneficiaries: false,
        errorPendingBeneficiaries: null,
      };
    case REQUEST(ACTION_TYPE.SEARCH_BENEFIT_PLANS):
      return {
        ...state,
        fetchingBenefitPlans: true,
        fetchedBenefitPlans: false,
        benefitPlans: [],
        benefitPlansPageInfo: {},
        benefitPlansTotalCount: 0,
        errorBenefitPlans: null,
      };
    case REQUEST(ACTION_TYPE.SEARCH_INDICATORS):
      return {
        ...state,
        fetchingIndicators: true,
        fetchedIndicators: false,
        indicators: [],
        indicatorsPageInfo: {},
        indicatorsTotalCount: 0,
        errorIndicators: null,
      };
    case REQUEST(ACTION_TYPE.GET_BENEFIT_PLAN):
      return {
        ...state,
        fetchingBenefitPlan: true,
        fetchedBenefitPlan: false,
        benefitPlan: null,
      };
    case REQUEST(ACTION_TYPE.SEARCH_BENEFICIARIES):
      return {
        ...state,
        fetchingBeneficiaries: true,
        fetchedBeneficiaries: false,
        beneficiaries: [],
        beneficiariesPageInfo: {},
        beneficiariesTotalCount: 0,
        errorBeneficiaries: null,
      };
    case REQUEST(ACTION_TYPE.SEARCH_GROUP_BENEFICIARIES):
      return {
        ...state,
        fetchingGroupBeneficiaries: true,
        fetchedGroupBeneficiaries: false,
        groupBeneficiaries: [],
        groupBeneficiariesPageInfo: {},
        groupBeneficiariesTotalCount: 0,
        errorGroupBeneficiaries: null,
      };
    case REQUEST(ACTION_TYPE.GET_WORKFLOWS):
      return {
        ...state,
        fetchingWorkflows: true,
        fetchedWorkflows: false,
        workflows: [],
        workflowsPageInfo: {},
        errorWorkflows: null,
      };
    case REQUEST(ACTION_TYPE.SEARCH_PROJECTS):
      return {
        ...state,
        fetchingProjects: true,
        fetchedProjects: false,
        projects: [],
        projectsPageInfo: {},
        projectsTotalCount: 0,
        errorProjects: null,
      };
    case REQUEST(ACTION_TYPE.GET_PROJECT):
      return {
        ...state,
        fetchingProject: true,
        fetchedProject: false,
        project: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_BENEFIT_PLANS):
      return {
        ...state,
        fetchingBenefitPlans: false,
        fetchedBenefitPlans: true,
        benefitPlans: parseData(action.payload.data.benefitPlan)?.map((benefitPlan) => ({
          ...benefitPlan,
          id: decodeId(benefitPlan.id),
        })),
        benefitPlansPageInfo: pageInfo(action.payload.data.benefitPlan),
        benefitPlansTotalCount: action.payload.data.benefitPlan ? action.payload.data.benefitPlan.totalCount : null,
        errorBenefitPlans: formatGraphQLError(action.payload),
      };
    case SUCCESS(ACTION_TYPE.GET_FIELDS_FROM_BF_SCHEMA):
      return {
        ...state,
        fieldsFromBfSchema: action?.payload?.data?.benefitPlanSchemaField?.schemaFields || [],
        fetchingFieldsFromBfSchema: false,
        fetchedFieldsFromBfSchema: true,
        errorFieldsFromBfSchema: formatGraphQLError(action.payload),
      };
    case SUCCESS(ACTION_TYPE.GET_PENDING_BENEFICIARIES_UPLOAD):
      return {
        ...state,
        pendingBeneficiaries: parseData(action.payload.data.individualDataSource)?.map((i) => ({
          ...i,
          id: decodeId(i.id),
        })),
        pendingBeneficiariesPageInfo: pageInfo(action.payload.data.individualDataSource),
        fetchingPendingBeneficiaries: false,
        fetchedPendingBeneficiaries: true,
        errorPendingBeneficiaries: formatGraphQLError(action.payload),
      };
    case SUCCESS(ACTION_TYPE.GET_BENEFIT_PLAN):
      return {
        ...state,
        fetchingBenefitPlan: false,
        fetchedBenefitPlan: true,
        benefitPlan: parseData(action.payload.data.benefitPlan)?.map((benefitPlan) => ({
          ...benefitPlan,
          id: decodeId(benefitPlan.id),
        }))?.[0],
        errorBenefitPlan: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_BENEFICIARIES):
      return {
        ...state,
        fetchingBeneficiaries: false,
        fetchedBeneficiaries: true,
        beneficiaries: parseData(action.payload.data.beneficiary)?.map((beneficiary) => ({
          ...beneficiary,
          benefitPlan: { id: beneficiary?.benefitPlan?.id ? decodeId(beneficiary.benefitPlan.id) : null },
          id: decodeId(beneficiary.id),
        })),
        beneficiariesPageInfo: pageInfo(action.payload.data.beneficiary),
        beneficiariesTotalCount: action.payload.data.beneficiary ? action.payload.data.beneficiary.totalCount : null,
        errorBeneficiaries: formatGraphQLError(action.payload),
      };
    case SUCCESS(ACTION_TYPE.SEARCH_GROUP_BENEFICIARIES):
      return {
        ...state,
        fetchingGroupBeneficiaries: false,
        fetchedGroupBeneficiaries: true,
        groupBeneficiaries: parseData(action.payload.data.groupBeneficiary)?.map((groupBeneficiary) => {
          const response = ({
            ...groupBeneficiary,
            id: decodeId(groupBeneficiary.id),
          });
          if (response?.group?.id) {
            response.group = ({
              ...response.group,
              id: decodeId(response.group.id),
            });
          }
          return response;
        }),
        groupBeneficiariesPageInfo: pageInfo(action.payload.data.groupBeneficiary),
        groupBeneficiariesTotalCount: action.payload.data.groupBeneficiary
          ? action.payload.data.groupBeneficiary.totalCount : null,
        errorGroupBeneficiaries: formatGraphQLError(action.payload),
      };
    case SUCCESS(ACTION_TYPE.GET_WORKFLOWS):
      return {
        ...state,
        fetchingWorkflows: false,
        fetchedWorkflows: true,
        workflows: action.payload.data.workflow || [],
        workflowsPageInfo: pageInfo(action.payload.data.benefitPlan),
        errorWorkflows: formatGraphQLError(action.payload),
      };
    case SUCCESS(ACTION_TYPE.SEARCH_PROJECTS):
      return {
        ...state,
        fetchingProjects: false,
        fetchedProjects: true,
        projects: parseData(action.payload.data.project)?.map((project) => ({
          ...project,
          benefitPlan: { id: project?.benefitPlan?.id ? decodeId(project.benefitPlan.id) : null },
          id: decodeId(project.id),
        })),
        projectsPageInfo: pageInfo(action.payload.data.project),
        projectsTotalCount: action.payload.data.project ? action.payload.data.project.totalCount : null,
        errorProjects: formatGraphQLError(action.payload),
      };
    case SUCCESS(ACTION_TYPE.GET_PROJECT):
      return {
        ...state,
        fetchingProject: false,
        fetchedProject: true,
        project: parseData(action.payload.data.project)?.map((project) => ({
          ...project,
          benefitPlan: {
            ...project?.benefitPlan,
            id: project?.benefitPlan?.id ? decodeId(project.benefitPlan.id) : null,
          },
          activity: {
            ...project?.activity,
            id: project?.activity?.id ? decodeId(project.activity.id) : null,
          },
          id: decodeId(project.id),
        }))?.[0],
        errorProject: null,
      };
    case ERROR(ACTION_TYPE.GET_FIELDS_FROM_BF_SCHEMA):
      return {
        ...state,
        fetchingFieldsFromBfSchema: false,
        errorFieldsFromBfSchema: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_PENDING_BENEFICIARIES_UPLOAD):
      return {
        ...state,
        fetchingPendingBeneficiaries: false,
        errorFieldsFromBfSchema: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_BENEFIT_PLANS):
      return {
        ...state,
        fetchingBenefitPlans: false,
        errorBenefitPlans: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_BENEFIT_PLAN):
      return {
        ...state,
        fetchingBenefitPlan: false,
        errorBenefitPlan: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_BENEFICIARIES):
      return {
        ...state,
        fetchingBeneficiaries: false,
        errorBeneficiaries: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_GROUP_BENEFICIARIES):
      return {
        ...state,
        fetchingGroupBeneficiaries: false,
        errorGroupBeneficiaries: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_WORKFLOWS):
      return {
        ...state,
        fetchingWorkflows: false,
        errorWorkflows: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_PROJECTS):
      return {
        ...state,
        fetchingProjects: false,
        errorProjects: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_PROJECT):
      return {
        ...state,
        fetchingProject: false,
        errorProject: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.BENEFIT_PLAN_CODE_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          benefitPlanCode: {
            isValidating: true,
            isValid: false,
            validationError: null,
          },
        },
      };
    case SUCCESS(ACTION_TYPE.BENEFIT_PLAN_CODE_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          benefitPlanCode: {
            isValidating: false,
            isValid: action.payload?.data.isValid.isValid,
            validationError: formatGraphQLError(action.payload),
          },
        },
      };
    case ERROR(ACTION_TYPE.BENEFIT_PLAN_CODE_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          benefitPlanCode: {
            isValidating: false,
            isValid: false,
            validationError: formatServerError(action.payload),
          },
        },
      };
    case CLEAR(ACTION_TYPE.BENEFIT_PLAN_CODE_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          benefitPlanCode: {
            isValidating: false,
            isValid: false,
            validationError: null,
          },
        },
      };
    case ACTION_TYPE.BENEFIT_PLAN_CODE_SET_VALID:
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          benefitPlanCode: {
            isValidating: false,
            isValid: true,
            validationError: null,
          },
        },
      };
    case REQUEST(ACTION_TYPE.BENEFIT_PLAN_NAME_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          benefitPlanName: {
            isValidating: true,
            isValid: false,
            validationError: null,
          },
        },
      };
    case SUCCESS(ACTION_TYPE.BENEFIT_PLAN_NAME_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          benefitPlanName: {
            isValidating: false,
            isValid: action.payload?.data.isValid.isValid,
            validationError: formatGraphQLError(action.payload),
          },
        },
      };
    case ERROR(ACTION_TYPE.BENEFIT_PLAN_NAME_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          benefitPlanName: {
            isValidating: false,
            isValid: false,
            validationError: formatServerError(action.payload),
          },
        },
      };
    case CLEAR(ACTION_TYPE.BENEFIT_PLAN_NAME_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          benefitPlanName: {
            isValidating: false,
            isValid: false,
            validationError: null,
          },
        },
      };
    case ACTION_TYPE.BENEFIT_PLAN_NAME_SET_VALID:
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          benefitPlanName: {
            isValidating: false,
            isValid: true,
            validationError: null,
          },
        },
      };
    case REQUEST(ACTION_TYPE.BENEFIT_PLAN_SCHEMA_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          benefitPlanSchema: {
            isValidating: true,
            isValid: false,
            validationError: null,
          },
        },
      };
    case SUCCESS(ACTION_TYPE.BENEFIT_PLAN_SCHEMA_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          benefitPlanSchema: {
            isValidating: false,
            isValid: action.payload?.data.isValid.isValid,
            validationError: formatGraphQLError(action.payload),
          },
        },
      };
    case ERROR(ACTION_TYPE.BENEFIT_PLAN_SCHEMA_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          benefitPlanSchema: {
            isValidating: false,
            isValid: false,
            validationError: formatServerError(action.payload),
          },
        },
      };
    case CLEAR(ACTION_TYPE.BENEFIT_PLAN_SCHEMA_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          benefitPlanSchema: {
            isValidating: false,
            isValid: false,
            validationError: null,
          },
        },
      };
    case ACTION_TYPE.BENEFIT_PLAN_SCHEMA_SET_VALID:
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          benefitPlanSchema: {
            isValidating: false,
            isValid: true,
            validationError: null,
          },
        },
      };
    case CLEAR(ACTION_TYPE.GET_BENEFIT_PLAN):
      return {
        ...state,
        fetchingBenefitPlan: false,
        errorBenefitPlan: null,
        fetchedBenefitPlan: false,
        benefitPlan: null,
        mutation: null,
      };
    case CLEAR(ACTION_TYPE.BENEFICIARY_EXPORT):
      return {
        ...state,
        fetchingBeneficiaryExport: false,
        fetchedBeneficiaryExport: false,
        beneficiaryExport: null,
        beneficiaryExportPageInfo: {},
        errorBeneficiaryExport: null,
      };
    case REQUEST(ACTION_TYPE.BENEFICIARY_EXPORT):
      return {
        ...state,
        fetchingBeneficiaryExport: true,
        fetchedBeneficiaryExport: false,
        beneficiaryExport: null,
        beneficiaryExportPageInfo: {},
        errorBeneficiaryExport: null,
      };
    case SUCCESS(ACTION_TYPE.BENEFICIARY_EXPORT):
      return {
        ...state,
        fetchingBeneficiaryExport: false,
        fetchedBeneficiaryExport: true,
        beneficiaryExport: action.payload.data.beneficiaryExport,
        beneficiaryExportPageInfo: pageInfo(action.payload.data.beneficiaryExport),
        errorBeneficiaryExport: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.BENEFICIARY_EXPORT):
      return {
        ...state,
        fetchingBeneficiaryExport: false,
        errorBeneficiaryExport: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.GROUP_BENEFICIARY_EXPORT):
      return {
        ...state,
        fetchingGroupBeneficiaryExport: true,
        fetchedGroupBeneficiaryExport: false,
        groupBeneficiaryExport: null,
        groupBeneficiaryExportPageInfo: {},
        errorGroupBeneficiaryExport: null,
      };
    case SUCCESS(ACTION_TYPE.GROUP_BENEFICIARY_EXPORT):
      return {
        ...state,
        fetchingGroupBeneficiaryExport: false,
        fetchedGroupBeneficiaryExport: true,
        groupBeneficiaryExport: action.payload.data.groupBeneficiaryExport,
        groupBeneficiaryExportPageInfo: pageInfo(action.payload.data.groupBeneficiaryExport),
        errorGroupBeneficiaryExport: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GROUP_BENEFICIARY_EXPORT):
      return {
        ...state,
        fetchingGroupBeneficiaryExport: false,
        errorGroupBeneficiaryExport: formatServerError(action.payload),
      };
    case CLEAR(ACTION_TYPE.GROUP_BENEFICIARY_EXPORT):
      return {
        ...state,
        fetchingGroupBeneficiaryExport: false,
        fetchedGroupBeneficiaryExport: false,
        groupBeneficiaryExport: null,
        groupBeneficiaryExportPageInfo: {},
        errorGroupBeneficiaryExport: null,
      };
    case REQUEST(ACTION_TYPE.GET_BENEFICIARY):
      return {
        ...state,
        fetchingBeneficiary: true,
        fetchedBeneficiary: false,
        beneficiary: null,
        errorBeneficiary: null,
      };
    case SUCCESS(ACTION_TYPE.GET_BENEFICIARY):
      return {
        ...state,
        fetchingBeneficiary: false,
        fetchedBeneficiary: true,
        beneficiary: parseData(action.payload.data.beneficiary).map((beneficiary) => ({
          ...beneficiary,
          benefitPlan: { id: beneficiary?.benefitPlan?.id ? decodeId(beneficiary.benefitPlan.id) : null },
          id: decodeId(beneficiary.id),
        }))?.[0],
        error: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_BENEFICIARY):
      return {
        ...state,
        fetchingBeneficiary: false,
        errorBeneficiary: formatServerError(action.payload),
      };
    case CLEAR(ACTION_TYPE.GET_BENEFICIARY):
      return {
        ...state,
        fetchingBeneficiary: false,
        fetchedBeneficiary: false,
        beneficiary: null,
        errorBeneficiary: null,
      };
    case REQUEST(ACTION_TYPE.GET_BENEFICIARIES_GROUP):
      return {
        ...state,
        fetchingGroup: true,
        fetchedGroup: false,
        group: null,
        errorGroup: null,
      };
    case SUCCESS(ACTION_TYPE.GET_BENEFICIARIES_GROUP):
      return {
        ...state,
        fetchingGroup: false,
        fetchedGroup: true,
        group: parseData(action.payload.data.groupBeneficiary)?.map((groupBeneficiary) => ({
          ...groupBeneficiary,
          id: decodeId(groupBeneficiary.id),
        }))?.[0],
        errorGroup: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_BENEFICIARIES_GROUP):
      return {
        ...state,
        fetchingGroup: false,
        errorGroup: formatServerError(action.payload),
      };
    case CLEAR(ACTION_TYPE.GET_BENEFICIARIES_GROUP):
      return {
        ...state,
        fetchingGroup: false,
        fetchedGroup: false,
        group: null,
        errorGroup: null,
      };
    case ERROR(ACTION_TYPE.GET_BENEFIT_PLAN_UPLOAD_HISTORY):
      return {
        ...state,
        fetchingBeneficiaryDataUploadHistory: false,
        errorBeneficiaryDataUploadHistory: formatServerError(action.payload),
      };
    case SUCCESS(ACTION_TYPE.GET_BENEFIT_PLAN_UPLOAD_HISTORY):
      return {
        ...state,
        fetchingBeneficiaryDataUploadHistory: false,
        fetchedBeneficiaryDataUploadHistory: true,
        beneficiaryDataUploadHistory: parseData(action.payload.data.beneficiaryDataUploadHistory)?.map((data) => ({
          ...data,
          id: decodeId(data.id),
          dataUpload: { ...data.dataUpload, error: JSON.parse(data.dataUpload.error) },
        })) || [],
        beneficiaryDataUploadHistoryPageInfo: pageInfo(action.payload.data.beneficiaryDataUploadHistory),
        errorBeneficiaryDataUploadHistory: formatGraphQLError(action.payload),
      };
    case REQUEST(ACTION_TYPE.GET_BENEFIT_PLAN_UPLOAD_HISTORY):
      return {
        ...state,
        fetchingBeneficiaryDataUploadHistory: true,
        fetchedBeneficiaryDataUploadHistory: false,
        beneficiaryDataUploadHistory: [],
        beneficiaryDataUploadHistoryPageInfo: {},
        errorBeneficiaryDataUploadHistory: null,
      };
    case REQUEST(ACTION_TYPE.SEARCH_BENEFIT_PLANS_HISTORY):
      return {
        ...state,
        fetchingBenefitPlansHistory: true,
        fetchedBenefitPlansHistory: false,
        benefitPlansHistory: [],
        benefitPlansHistoryPageInfo: {},
        benefitPlansHistoryTotalCount: 0,
        errorBenefitPlansHistory: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_BENEFIT_PLANS_HISTORY):
      return {
        ...state,
        fetchingBenefitPlansHistory: false,
        fetchedBenefitPlansHistory: true,
        benefitPlansHistory: parseData(action.payload.data.benefitPlanHistory)?.map((benefitPlanHistory) => ({
          ...benefitPlanHistory,
          id: decodeId(benefitPlanHistory.id),
        })),
        benefitPlansHistoryPageInfo: pageInfo(action.payload.data.benefitPlanHistory),
        // eslint-disable-next-line max-len
        benefitPlansHistoryTotalCount: action.payload.data.benefitPlanHistory ? action.payload.data.benefitPlanHistory.totalCount : null,
        errorBenefitPlansHistory: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_BENEFIT_PLANS_HISTORY):
      return {
        ...state,
        fetchingBenefitPlansHistory: false,
        errorBenefitPlansHistory: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.SEARCH_BENEFIT_PLAN_PROVINCES):
      return {
        ...state,
        fetchingBenefitPlanProvinces: true,
        fetchedBenefitPlanProvinces: false,
        benefitPlanProvinces: [],
        benefitPlanProvincesPageInfo: {},
        benefitPlanProvincesTotalCount: 0,
        errorBenefitPlanProvinces: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_BENEFIT_PLAN_PROVINCES):
      return {
        ...state,
        fetchingBenefitPlanProvinces: false,
        fetchedBenefitPlanProvinces: true,
        benefitPlanProvinces: parseData(action.payload.data.locationByBenefitPlan)?.map((province) => ({
          ...province,
          id: decodeId(province.id),
        })),
        benefitPlanProvincesPageInfo: pageInfo(action.payload.data.locationByBenefitPlan),
        benefitPlanProvincesTotalCount: action.payload.data.locationByBenefitPlan ? action.payload.data.locationByBenefitPlan.totalCount : null,
        errorBenefitPlanProvinces: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_BENEFIT_PLAN_PROVINCES):
      return {
        ...state,
        fetchingBenefitPlanProvinces: false,
        errorBenefitPlanProvinces: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.SEARCH_SENSITIZATION_TRAININGS):
      return {
        ...state,
        fetchingSensitizationTrainings: true,
        fetchedSensitizationTrainings: false,
        sensitizationTrainings: [],
        sensitizationTrainingsPageInfo: {},
        sensitizationTrainingsTotalCount: 0,
        errorSensitizationTrainings: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_SENSITIZATION_TRAININGS):
      return {
        ...state,
        fetchingSensitizationTrainings: false,
        fetchedSensitizationTrainings: true,
        sensitizationTrainings: parseData(action.payload.data.sensitizationTraining)?.map((training) => ({
          ...training,
          id: decodeId(training.id),
        })),
        sensitizationTrainingsPageInfo: pageInfo(action.payload.data.sensitizationTraining),
        sensitizationTrainingsTotalCount: action.payload.data.sensitizationTraining ? action.payload.data.sensitizationTraining.totalCount : null,
        errorSensitizationTrainings: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_SENSITIZATION_TRAININGS):
      return {
        ...state,
        fetchingSensitizationTrainings: false,
        errorSensitizationTrainings: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.SEARCH_BEHAVIOR_CHANGE_PROMOTIONS):
      return {
        ...state,
        fetchingBehaviorChangePromotions: true,
        fetchedBehaviorChangePromotions: false,
        behaviorChangePromotions: [],
        behaviorChangePromotionsPageInfo: {},
        behaviorChangePromotionsTotalCount: 0,
        errorBehaviorChangePromotions: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_BEHAVIOR_CHANGE_PROMOTIONS):
      return {
        ...state,
        fetchingBehaviorChangePromotions: false,
        fetchedBehaviorChangePromotions: true,
        behaviorChangePromotions: parseData(action.payload.data.behaviorChangePromotion)?.map((promotion) => ({
          ...promotion,
          id: decodeId(promotion.id),
        })),
        behaviorChangePromotionsPageInfo: pageInfo(action.payload.data.behaviorChangePromotion),
        behaviorChangePromotionsTotalCount: action.payload.data.behaviorChangePromotion ? action.payload.data.behaviorChangePromotion.totalCount : null,
        errorBehaviorChangePromotions: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_BEHAVIOR_CHANGE_PROMOTIONS):
      return {
        ...state,
        fetchingBehaviorChangePromotions: false,
        errorBehaviorChangePromotions: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.SEARCH_MICRO_PROJECTS):
      return {
        ...state,
        fetchingMicroProjects: true,
        fetchedMicroProjects: false,
        microProjects: [],
        microProjectsPageInfo: {},
        microProjectsTotalCount: 0,
        errorMicroProjects: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_MICRO_PROJECTS):
      return {
        ...state,
        fetchingMicroProjects: false,
        fetchedMicroProjects: true,
        microProjects: parseData(action.payload.data.microProject)?.map((project) => ({
          ...project,
          id: decodeId(project.id),
        })),
        microProjectsPageInfo: pageInfo(action.payload.data.microProject),
        microProjectsTotalCount: action.payload.data.microProject ? action.payload.data.microProject.totalCount : null,
        errorMicroProjects: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_MICRO_PROJECTS):
      return {
        ...state,
        fetchingMicroProjects: false,
        errorMicroProjects: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.SEARCH_MONETARY_TRANSFERS):
      return {
        ...state,
        fetchingMonetaryTransfers: true,
        fetchedMonetaryTransfers: false,
        monetaryTransfers: [],
        errorMonetaryTransfers: null,
        monetaryTransfersPageInfo: {},
        monetaryTransfersTotalCount: 0,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_MONETARY_TRANSFERS):
      return {
        ...state,
        monetaryTransfers: parseData(action.payload.data.monetaryTransfer)?.map((monetaryTransfer) => ({
          ...monetaryTransfer,
          id: decodeId(monetaryTransfer.id),
        })),
        fetchingMonetaryTransfers: false,
        fetchedMonetaryTransfers: true,
        errorMonetaryTransfers: formatGraphQLError(action.payload),
        monetaryTransfersPageInfo: pageInfo(action.payload.data.monetaryTransfer),
        monetaryTransfersTotalCount: action.payload.data.monetaryTransfer?.totalCount ?? 0,
      };
    case ERROR(ACTION_TYPE.SEARCH_MONETARY_TRANSFERS):
      return {
        ...state,
        fetchingMonetaryTransfers: false,
        errorMonetaryTransfers: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.GET_MONETARY_TRANSFER):
      return {
        ...state,
        fetchingMonetaryTransfer: true,
        fetchedMonetaryTransfer: false,
        monetaryTransfer: [],
        errorMonetaryTransfer: null,
      };
    case SUCCESS(ACTION_TYPE.GET_MONETARY_TRANSFER):
      return {
        ...state,
        fetchingMonetaryTransfer: false,
        fetchedMonetaryTransfer: true,
        monetaryTransfer: parseData(action.payload.data.monetaryTransfer)?.map((monetaryTransfer) => ({
          ...monetaryTransfer,
          id: decodeId(monetaryTransfer.id),
        }))?.[0],
        errorMonetaryTransfer: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_MONETARY_TRANSFER):
      return {
        ...state,
        fetchingMonetaryTransfer: false,
        errorMonetaryTransfer: formatServerError(action.payload),
      };
    case CLEAR(ACTION_TYPE.GET_MONETARY_TRANSFER):
      return {
        ...state,
        fetchingMonetaryTransfer: false,
        fetchedMonetaryTransfer: false,
        monetaryTransfer: {},
        errorMonetaryTransfer: null,
      };
    case REQUEST(ACTION_TYPE.PROJECT_NAME_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          projectName: {
            isValidating: true,
            isValid: false,
            validationError: null,
          },
        },
      };
    case SUCCESS(ACTION_TYPE.PROJECT_NAME_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          projectName: {
            isValidating: false,
            isValid: action.payload?.data.isValid.isValid,
            validationError: formatGraphQLError(action.payload),
          },
        },
      };
    case ERROR(ACTION_TYPE.PROJECT_NAME_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          projectName: {
            isValidating: false,
            isValid: false,
            validationError: formatServerError(action.payload),
          },
        },
      };
    case CLEAR(ACTION_TYPE.PROJECT_NAME_FIELDS_VALIDATION):
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          projectName: {
            isValidating: false,
            isValid: false,
            validationError: null,
          },
        },
      };
    case ACTION_TYPE.PROJECT_NAME_SET_VALID:
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          projectName: {
            isValidating: false,
            isValid: true,
            validationError: null,
          },
        },
      };
    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_BENEFIT_PLAN):
      return dispatchMutationResp(state, 'createBenefitPlan', action);
    case SUCCESS(ACTION_TYPE.DELETE_BENEFIT_PLAN):
      return dispatchMutationResp(state, 'deleteBenefitPlan', action);
    case SUCCESS(ACTION_TYPE.UPDATE_BENEFIT_PLAN):
      return dispatchMutationResp(state, 'updateBenefitPlan', action);
    case SUCCESS(ACTION_TYPE.UPDATE_BENEFICIARY):
      return dispatchMutationResp(state, 'updateBeneficiary', action);
    case SUCCESS(ACTION_TYPE.UPDATE_GROUP_BENEFICIARY):
      return dispatchMutationResp(state, 'updateGroupBeneficiary', action);
    case SUCCESS(ACTION_TYPE.CREATE_PROJECT):
      return dispatchMutationResp(state, 'createProject', action);
    case SUCCESS(ACTION_TYPE.UPDATE_PROJECT):
      return dispatchMutationResp(state, 'updateProject', action);
    case SUCCESS(ACTION_TYPE.DELETE_PROJECT):
      return dispatchMutationResp(state, 'deleteProject', action);
    case SUCCESS(ACTION_TYPE.UNDO_DELETE_PROJECT):
      return dispatchMutationResp(state, 'undoDeleteProject', action);
    case SUCCESS(ACTION_TYPE.RESOLVE_TASK):
      return dispatchMutationResp(state, 'resolveTask', action);
    case SUCCESS(ACTION_TYPE.GENERATE_PROVINCE_PAYROLL):
      return dispatchMutationResp(state, 'generateProvincePayroll', action);
    case SUCCESS(ACTION_TYPE.ADD_PROVINCE_PAYMENT_POINT):
      return dispatchMutationResp(state, 'addProvincePaymentPoint', action);
    case REQUEST(ACTION_TYPE.TASK_MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.TASK_MUTATION):
      return dispatchMutationErr(state, action);
    case REQUEST(ACTION_TYPE.CREATE_MONETARY_TRANSFER):
    case REQUEST(ACTION_TYPE.UPDATE_MONETARY_TRANSFER):
    case REQUEST(ACTION_TYPE.DELETE_MONETARY_TRANSFER):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.CREATE_MONETARY_TRANSFER):
    case ERROR(ACTION_TYPE.UPDATE_MONETARY_TRANSFER):
    case ERROR(ACTION_TYPE.DELETE_MONETARY_TRANSFER):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_MONETARY_TRANSFER):
      return dispatchMutationResp(state, MUTATION_SERVICE.MONETARY_TRANSFER.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_MONETARY_TRANSFER):
      return dispatchMutationResp(state, MUTATION_SERVICE.MONETARY_TRANSFER.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_MONETARY_TRANSFER):
      return dispatchMutationResp(state, MUTATION_SERVICE.MONETARY_TRANSFER.DELETE, action);
    case SUCCESS(ACTION_TYPE.SEARCH_INDICATORS):
      return {
        ...state,
        fetchingIndicators: false,
        fetchedIndicators: true,
        indicators: parseData(action.payload.data.indicator)?.map((indicator) => ({
          ...indicator,
          id: decodeId(indicator.id),
        })),
        indicatorsPageInfo: pageInfo(action.payload.data.indicator),
        indicatorsTotalCount: action.payload.data.indicator ? action.payload.data.indicator.totalCount : null,
        errorIndicators: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_INDICATORS):
      return {
        ...state,
        fetchingIndicators: false,
        errorIndicators: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.GET_INDICATOR):
      return {
        ...state,
        fetchingIndicator: true,
        fetchedIndicator: false,
        indicator: null,
        errorIndicator: null,
      };
    case SUCCESS(ACTION_TYPE.GET_INDICATOR):
      return {
        ...state,
        fetchingIndicator: false,
        fetchedIndicator: true,
        indicator: parseData(action.payload.data.indicator)?.map((indicator) => ({
          ...indicator,
          id: decodeId(indicator.id),
        }))?.[0] || null,
        errorIndicator: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_INDICATOR):
      return {
        ...state,
        fetchingIndicator: false,
        errorIndicator: formatServerError(action.payload),
      };
    case ACTION_TYPE.CLEAR_INDICATOR:
      return {
        ...state,
        fetchingIndicator: false,
        fetchedIndicator: false,
        indicator: null,
        errorIndicator: null,
      };
    case REQUEST(ACTION_TYPE.SEARCH_SECTIONS):
      return {
        ...state,
        fetchingSections: true,
        fetchedSections: false,
        sections: [],
        sectionsPageInfo: {},
        sectionsTotalCount: 0,
        errorSections: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_SECTIONS):
      return {
        ...state,
        fetchingSections: false,
        fetchedSections: true,
        sections: parseData(action.payload.data.section)?.map((section) => ({
          ...section,
          id: decodeId(section.id),
        })),
        sectionsPageInfo: pageInfo(action.payload.data.section),
        sectionsTotalCount: action.payload.data.section ? action.payload.data.section.totalCount : null,
        errorSections: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_SECTIONS):
      return {
        ...state,
        fetchingSections: false,
        errorSections: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.GET_SECTION):
      return {
        ...state,
        fetchingSection: true,
        fetchedSection: false,
        section: null,
        errorSection: null,
      };
    case SUCCESS(ACTION_TYPE.GET_SECTION):
      return {
        ...state,
        fetchingSection: false,
        fetchedSection: true,
        section: parseData(action.payload.data.section)?.length > 0
          ? {
            ...parseData(action.payload.data.section)[0],
            id: decodeId(parseData(action.payload.data.section)[0].id),
          }
          : null,
        errorSection: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_SECTION):
      return {
        ...state,
        fetchingSection: false,
        errorSection: formatServerError(action.payload),
      };
    case CLEAR(ACTION_TYPE.SECTION):
      return {
        ...state,
        fetchingSection: false,
        fetchedSection: false,
        section: null,
        errorSection: null,
      };
    case REQUEST(ACTION_TYPE.SEARCH_INDICATOR_ACHIEVEMENTS):
      return {
        ...state,
        fetchingIndicatorAchievements: true,
        fetchedIndicatorAchievements: false,
        indicatorAchievements: [],
        indicatorAchievementsPageInfo: {},
        indicatorAchievementsTotalCount: 0,
        errorIndicatorAchievements: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_INDICATOR_ACHIEVEMENTS):
      return {
        ...state,
        fetchingIndicatorAchievements: false,
        fetchedIndicatorAchievements: true,
        indicatorAchievements: parseData(action.payload.data.indicatorAchievement)?.map((achievement) => ({
          ...achievement,
          id: decodeId(achievement.id),
          indicator: achievement.indicator ? {
            ...achievement.indicator,
            id: decodeId(achievement.indicator.id),
          } : null,
        })),
        indicatorAchievementsPageInfo: pageInfo(action.payload.data.indicatorAchievement),
        indicatorAchievementsTotalCount: action.payload.data.indicatorAchievement ? action.payload.data.indicatorAchievement.totalCount : null,
        errorIndicatorAchievements: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_INDICATOR_ACHIEVEMENTS):
      return {
        ...state,
        fetchingIndicatorAchievements: false,
        errorIndicatorAchievements: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.CREATE_SECTION):
    case REQUEST(ACTION_TYPE.UPDATE_SECTION):
    case REQUEST(ACTION_TYPE.DELETE_SECTION):
    case REQUEST(ACTION_TYPE.CREATE_INDICATOR):
    case REQUEST(ACTION_TYPE.UPDATE_INDICATOR):
    case REQUEST(ACTION_TYPE.DELETE_INDICATOR):
    case REQUEST(ACTION_TYPE.CREATE_INDICATOR_ACHIEVEMENT):
    case REQUEST(ACTION_TYPE.UPDATE_INDICATOR_ACHIEVEMENT):
    case REQUEST(ACTION_TYPE.DELETE_INDICATOR_ACHIEVEMENT):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.CREATE_SECTION):
    case ERROR(ACTION_TYPE.UPDATE_SECTION):
    case ERROR(ACTION_TYPE.DELETE_SECTION):
    case ERROR(ACTION_TYPE.CREATE_INDICATOR):
    case ERROR(ACTION_TYPE.UPDATE_INDICATOR):
    case ERROR(ACTION_TYPE.DELETE_INDICATOR):
    case ERROR(ACTION_TYPE.CREATE_INDICATOR_ACHIEVEMENT):
    case ERROR(ACTION_TYPE.UPDATE_INDICATOR_ACHIEVEMENT):
    case ERROR(ACTION_TYPE.DELETE_INDICATOR_ACHIEVEMENT):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_SECTION):
      return dispatchMutationResp(state, MUTATION_SERVICE.SECTION.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_SECTION):
      return dispatchMutationResp(state, MUTATION_SERVICE.SECTION.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_SECTION):
      return dispatchMutationResp(state, MUTATION_SERVICE.SECTION.DELETE, action);
    case SUCCESS(ACTION_TYPE.CREATE_INDICATOR):
      return dispatchMutationResp(state, MUTATION_SERVICE.INDICATOR.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_INDICATOR):
      return dispatchMutationResp(state, MUTATION_SERVICE.INDICATOR.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_INDICATOR):
      return dispatchMutationResp(state, MUTATION_SERVICE.INDICATOR.DELETE, action);
    case SUCCESS(ACTION_TYPE.CREATE_INDICATOR_ACHIEVEMENT):
      return dispatchMutationResp(state, MUTATION_SERVICE.INDICATOR_ACHIEVEMENT.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_INDICATOR_ACHIEVEMENT):
      return dispatchMutationResp(state, MUTATION_SERVICE.INDICATOR_ACHIEVEMENT.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_INDICATOR_ACHIEVEMENT):
      return dispatchMutationResp(state, MUTATION_SERVICE.INDICATOR_ACHIEVEMENT.DELETE, action);
    
    // Result Framework actions
    case RESULT_FRAMEWORK_SNAPSHOTS_REQ:
      return {
        ...state,
        fetchingResultFrameworkSnapshots: true,
        fetchedResultFrameworkSnapshots: false,
        errorResultFrameworkSnapshots: null,
      };
    case RESULT_FRAMEWORK_SNAPSHOTS_RESP:
      return {
        ...state,
        fetchingResultFrameworkSnapshots: false,
        fetchedResultFrameworkSnapshots: true,
        resultFrameworkSnapshots: parseData(action.payload.data.resultFrameworkSnapshot),
        resultFrameworkSnapshotsPageInfo: pageInfo(action.payload.data.resultFrameworkSnapshot),
        resultFrameworkSnapshotsTotalCount: action.payload.data.resultFrameworkSnapshot?.totalCount || 0,
        errorResultFrameworkSnapshots: null,
      };
    case RESULT_FRAMEWORK_SNAPSHOTS_ERR:
      return {
        ...state,
        fetchingResultFrameworkSnapshots: false,
        errorResultFrameworkSnapshots: formatGraphQLError(action.payload),
      };
    case CALCULATE_INDICATOR_VALUE_REQ:
      return {
        ...state,
        calculatingIndicatorValue: true,
        calculatedIndicatorValue: null,
        errorCalculateIndicatorValue: null,
      };
    case CALCULATE_INDICATOR_VALUE_RESP:
      return {
        ...state,
        calculatingIndicatorValue: false,
        calculatedIndicatorValue: action.payload.data.calculateIndicatorValue,
        errorCalculateIndicatorValue: null,
      };
    case CALCULATE_INDICATOR_VALUE_ERR:
      return {
        ...state,
        calculatingIndicatorValue: false,
        errorCalculateIndicatorValue: formatGraphQLError(action.payload),
      };
    case CREATE_SNAPSHOT_REQ:
    case GENERATE_DOCUMENT_REQ:
    case FINALIZE_SNAPSHOT_REQ:
      return dispatchMutationReq(state, action);
    case CREATE_SNAPSHOT_ERR:
    case GENERATE_DOCUMENT_ERR:
    case FINALIZE_SNAPSHOT_ERR:
      return dispatchMutationErr(state, action);
    case CREATE_SNAPSHOT_RESP:
      return dispatchMutationResp(state, 'createResultFrameworkSnapshot', action);
    case GENERATE_DOCUMENT_RESP:
      return {
        ...state,
        submittingMutation: false,
        mutation: action.payload.data.generateResultFrameworkDocument,
      };
    case FINALIZE_SNAPSHOT_RESP:
      return dispatchMutationResp(state, 'finalizeSnapshot', action);
    
    default:
      return state;
  }
}

export default reducer;
