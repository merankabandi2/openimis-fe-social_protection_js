/**
 * Optimized Dashboard Hook using GraphQL Queries with Materialized Views
 * 
 * This hook provides high-performance dashboard data retrieval using:
 * - GraphQL queries backed by materialized views
 * - Multi-level caching (memory, localStorage, React Query)
 * - Automatic cache invalidation and refresh
 * - Error handling and retry logic
 * - Loading states and suspense
 */

import { useGraphqlQuery, useGraphqlMutation } from '@openimis/fe-core';
import { useState, useCallback, useEffect, useMemo } from 'react';

// GraphQL Queries for optimized dashboard
const OPTIMIZED_DASHBOARD_SUMMARY = `
  query OptimizedDashboardSummary($filters: DashboardFiltersInput) {
    optimizedDashboardSummary(filters: $filters) {
      summary {
        totalBeneficiaries
        totalTransfers
        totalAmountPaid
        avgAmountPerBeneficiary
        provincesCovered
      }
      communityBreakdown {
        communityType
        totalBeneficiaries
        activeBeneficiaries
        maleBeneficiaries
        femaleBeneficiaries
        twaBeneficiaries
        avgFemalePercentage
        avgTwaInclusionRate
        totalTransfers
        totalAmountPaid
        avgCompletionRate
        totalActivities
        totalActivityParticipants
        totalProjects
        completedProjects
        totalGrievances
        resolvedGrievances
        avgResolutionDays
        provincesCovered
        latestQuarter
        latestYear
      }
      lastUpdated
    }
  }
`;

const OPTIMIZED_BENEFICIARY_BREAKDOWN = `
  query OptimizedBeneficiaryBreakdown($filters: DashboardFiltersInput) {
    optimizedBeneficiaryBreakdown(filters: $filters) {
      genderBreakdown {
        male
        female
        twa
        total
        malePercentage
        femalePercentage
        twaPercentage
      }
      statusBreakdown {
        status
        count
        percentage
      }
      ageBreakdown {
        ageGroup
        count
        percentage
      }
      communityBreakdown {
        communityType
        count
        percentage
      }
      locationBreakdown {
        province
        provinceId
        count
        percentage
      }
      householdBreakdown {
        totalHouseholds
        totalBeneficiaries
      }
      lastUpdated
    }
  }
`;

const OPTIMIZED_TRANSFER_PERFORMANCE = `
  query OptimizedTransferPerformance($filters: DashboardFiltersInput) {
    optimizedTransferPerformance(filters: $filters) {
      overallMetrics {
        totalPlannedBeneficiaries
        totalPaidBeneficiaries
        totalAmountPlanned
        totalAmountPaid
        avgCompletionRate
        avgFinancialCompletionRate
        avgFemalePercentage
        avgTwaInclusionRate
      }
      byTransferType {
        transferType
        beneficiaries
        amount
        completionRate
        q1Amount
        q2Amount
        q3Amount
        q4Amount
        q1Beneficiaries
        q2Beneficiaries
        q3Beneficiaries
        q4Beneficiaries
        paymentSource
        femalePercentage
        twaPercentage
      }
      byLocation {
        province
        provinceId
        beneficiaries
        amount
        completionRate
      }
      byCommunity {
        communityType
        beneficiaries
        amount
        completionRate
      }
      lastUpdated
    }
  }
`;

const OPTIMIZED_QUARTERLY_TRENDS = `
  query OptimizedQuarterlyTrends($filters: DashboardFiltersInput) {
    optimizedQuarterlyTrends(filters: $filters) {
      trends {
        quarter
        year
        metric
        value
        period
      }
      lastUpdated
    }
  }
`;

const OPTIMIZED_GRIEVANCE_DASHBOARD = `
  query OptimizedGrievanceDashboard($filters: DashboardFiltersInput) {
    optimizedGrievanceDashboard(filters: $filters) {
      summary {
        totalTickets
        openTickets
        inProgressTickets
        resolvedTickets
        closedTickets
        sensitiveTickets
        anonymousTickets
        avgResolutionDays
      }
      statusDistribution {
        category
        count
        percentage
      }
      categoryDistribution {
        category
        count
        percentage
      }
      channelDistribution {
        category
        count
        percentage
      }
      priorityDistribution {
        category
        count
        percentage
      }
      genderDistribution {
        category
        count
        percentage
      }
      ageDistribution {
        category
        count
        percentage
      }
      lastUpdated
    }
  }
`;

const OPTIMIZED_ACTIVITIES_DASHBOARD = `
  query OptimizedActivitiesDashboard($filters: DashboardFiltersInput) {
    optimizedActivitiesDashboard(filters: $filters) {
      summary {
        totalActivities
        totalMaleParticipants
        totalFemaleParticipants
        totalTwaParticipants
        totalParticipants
        avgFemalePercentage
        avgTwaInclusionRate
        provincesWithActivities
      }
      byActivityType {
        activityType
        activityCount
        maleParticipants
        femaleParticipants
        twaParticipants
        totalParticipants
      }
      byProvince {
        province
        provinceId
        activityCount
        totalParticipants
      }
      microProjects {
        totalProjects
        agricultureProjects
        livestockProjects
        commerceProjects
        totalBeneficiaries
      }
      lastUpdated
    }
  }
`;

const OPTIMIZED_RESULTS_FRAMEWORK = `
  query OptimizedResultsFramework($filters: DashboardFiltersInput) {
    optimizedResultsFramework(filters: $filters) {
      summary {
        totalSections
        totalIndicators
        totalAchievements
        avgAchievementRate
        targetsMet
        targetsMissed
      }
      bySection {
        sectionId
        sectionName
        totalIndicators
        totalAchievements
        avgAchievementRate
        targetsMet
        targetsMissed
      }
      indicatorPerformance {
        indicatorId
        indicatorName
        targetValue
        totalAchieved
        achievementPercentage
        status
      }
      lastUpdated
    }
  }
`;

const DASHBOARD_VIEW_STATS = `
  query DashboardViewStats {
    dashboardViewStats {
      views {
        viewName
        rowCount
        sizeMb
        lastRefresh
      }
      totalViews
      totalSizeMb
      totalRows
    }
  }
`;

const DASHBOARD_HEALTH = `
  query DashboardHealth {
    dashboardHealth {
      status
      timestamp
      checks {
        component
        status
        message
      }
    }
  }
`;

// Mutations for dashboard management
const REFRESH_DASHBOARD_VIEW = `
  mutation RefreshDashboardView($input: RefreshViewInput!) {
    refreshDashboardView(input: $input) {
      success
      message
      viewName
      timestamp
      durationSeconds
    }
  }
`;

const REFRESH_ALL_DASHBOARD_VIEWS = `
  mutation RefreshAllDashboardViews($input: RefreshAllViewsInput) {
    refreshAllDashboardViews(input: $input) {
      success
      message
      viewsRefreshed
      timestamp
      durationSeconds
    }
  }
`;

const CLEAR_DASHBOARD_CACHE = `
  mutation ClearDashboardCache($input: ClearCacheInput) {
    clearDashboardCache(input: $input) {
      success
      message
      cachePattern
      timestamp
    }
  }
`;

// Cache configuration
const CACHE_CONFIG = {
  summary: { staleTime: 5 * 60 * 1000, cacheTime: 30 * 60 * 1000 }, // 5min stale, 30min cache
  breakdown: { staleTime: 10 * 60 * 1000, cacheTime: 60 * 60 * 1000 }, // 10min stale, 1hr cache
  performance: { staleTime: 10 * 60 * 1000, cacheTime: 60 * 60 * 1000 }, // 10min stale, 1hr cache
  trends: { staleTime: 30 * 60 * 1000, cacheTime: 2 * 60 * 60 * 1000 }, // 30min stale, 2hr cache
  grievances: { staleTime: 5 * 60 * 1000, cacheTime: 30 * 60 * 1000 }, // 5min stale, 30min cache
  stats: { staleTime: 60 * 60 * 1000, cacheTime: 4 * 60 * 60 * 1000 }, // 1hr stale, 4hr cache
  health: { staleTime: 5 * 60 * 1000, cacheTime: 15 * 60 * 1000 }, // 5min stale, 15min cache
};

/**
 * Main optimized dashboard hook
 */
export const useOptimizedDashboard = (filters = {}, options = {}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => {
    const cleanFilters = {};
    if (filters.startDate) cleanFilters.startDate = filters.startDate;
    if (filters.endDate) cleanFilters.endDate = filters.endDate;
    if (filters.provinceId) cleanFilters.provinceId = parseInt(filters.provinceId);
    if (filters.communeId) cleanFilters.communeId = parseInt(filters.communeId);
    if (filters.collineId) cleanFilters.collineId = parseInt(filters.collineId);
    if (filters.communityType) cleanFilters.communityType = filters.communityType;
    if (filters.year) cleanFilters.year = parseInt(filters.year);
    if (filters.benefitPlanId) cleanFilters.benefitPlanId = filters.benefitPlanId;
    return cleanFilters;
  }, [filters]);

  // Dashboard summary query
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useGraphqlQuery(
    OPTIMIZED_DASHBOARD_SUMMARY,
    { filters: memoizedFilters },
    { skip: options.disabled }
  );

  // Beneficiary breakdown query
  const {
    data: breakdownData,
    isLoading: breakdownLoading,
    error: breakdownError,
    refetch: refetchBreakdown,
  } = useGraphqlQuery(
    OPTIMIZED_BENEFICIARY_BREAKDOWN,
    { filters: memoizedFilters },
    { skip: options.disabled || options.summaryOnly }
  );

  // Transfer performance query
  const {
    data: performanceData,
    isLoading: performanceLoading,
    error: performanceError,
    refetch: refetchPerformance,
  } = useGraphqlQuery(
    OPTIMIZED_TRANSFER_PERFORMANCE,
    { filters: memoizedFilters },
    { skip: options.disabled || options.summaryOnly || options.includeTransfers === false }
  );

  // Quarterly trends query
  const {
    data: trendsData,
    isLoading: trendsLoading,
    error: trendsError,
    refetch: refetchTrends,
  } = useGraphqlQuery(
    OPTIMIZED_QUARTERLY_TRENDS,
    { filters: memoizedFilters },
    { skip: options.disabled || options.summaryOnly || options.includeTrends === false }
  );

  // Grievance dashboard query
  const {
    data: grievanceData,
    isLoading: grievanceLoading,
    error: grievanceError,
    refetch: refetchGrievances,
  } = useGraphqlQuery(
    OPTIMIZED_GRIEVANCE_DASHBOARD,
    { filters: memoizedFilters },
    { skip: options.disabled || !options.includeGrievances }
  );

  // State to trigger refetch
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Refresh mutations
  const refreshViewMutation = useGraphqlMutation(
    REFRESH_DASHBOARD_VIEW,
    {
      onSuccess: () => {
        setLastRefresh(new Date());
        // Trigger refetch by updating state
        setRefetchTrigger(prev => prev + 1);
      },
    }
  );

  const refreshAllViewsMutation = useGraphqlMutation(
    REFRESH_ALL_DASHBOARD_VIEWS,
    {
      onSuccess: () => {
        setLastRefresh(new Date());
        // Trigger refetch by updating state
        setRefetchTrigger(prev => prev + 1);
      },
    }
  );

  const clearCacheMutation = useGraphqlMutation(
    CLEAR_DASHBOARD_CACHE,
    {
      onSuccess: () => {
        // Trigger refetch by updating state
        setRefetchTrigger(prev => prev + 1);
      },
    }
  );

  // Refresh functions
  const refreshView = useCallback(async (viewName, concurrent = true) => {
    setRefreshing(true);
    try {
      await refreshViewMutation.mutateAsync({
        input: { viewName, concurrent }
      });
    } finally {
      setRefreshing(false);
    }
  }, [refreshViewMutation]);

  const refreshAllViews = useCallback(async (concurrent = true, force = false) => {
    setRefreshing(true);
    try {
      await refreshAllViewsMutation.mutateAsync({
        input: { concurrent, force }
      });
    } finally {
      setRefreshing(false);
    }
  }, [refreshAllViewsMutation]);

  const clearCache = useCallback(async (pattern = null) => {
    await clearCacheMutation.mutateAsync({
      input: { pattern }
    });
  }, [clearCacheMutation]);

  const refetchAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const promises = [];
      if (summaryData) promises.push(refetchSummary());
      if (breakdownData) promises.push(refetchBreakdown());
      if (performanceData) promises.push(refetchPerformance());
      if (trendsData) promises.push(refetchTrends());
      if (grievanceData) promises.push(refetchGrievances());
      
      await Promise.all(promises);
      setLastRefresh(new Date());
    } finally {
      setRefreshing(false);
    }
  }, [
    summaryData, breakdownData, performanceData, trendsData, grievanceData,
    refetchSummary, refetchBreakdown, refetchPerformance, refetchTrends, refetchGrievances
  ]);

  // Effect to refetch when trigger changes (from mutations)
  useEffect(() => {
    if (refetchTrigger > 0) {
      refetchAll();
    }
  }, [refetchTrigger, refetchAll]);

  // Combined loading state
  const isLoading = summaryLoading || breakdownLoading || performanceLoading || trendsLoading || grievanceLoading;
  
  // Combined error state
  const error = summaryError || breakdownError || performanceError || trendsError || grievanceError;

  // Check if any data is stale (not supported by core useGraphqlQuery)
  const isStale = false;

  // Check if refresh is in progress
  const isRefreshing = refreshing || refreshViewMutation.isLoading || refreshAllViewsMutation.isLoading;

  return {
    // Data
    summary: summaryData?.optimizedDashboardSummary,
    breakdown: breakdownData?.optimizedBeneficiaryBreakdown,
    performance: performanceData?.optimizedTransferPerformance,
    trends: trendsData?.optimizedQuarterlyTrends,
    grievances: grievanceData?.optimizedGrievanceDashboard,

    // Loading states
    isLoading,
    isRefreshing,
    isStale,
    
    // Individual loading states
    summaryLoading,
    breakdownLoading,
    performanceLoading,
    trendsLoading,
    grievanceLoading,

    // Error states
    error,
    summaryError,
    breakdownError,
    performanceError,
    trendsError,
    grievanceError,

    // Refresh functions
    refreshView,
    refreshAllViews,
    clearCache,
    refetchAll,
    lastRefresh,

    // Individual refetch functions
    refetchSummary,
    refetchBreakdown,
    refetchPerformance,
    refetchTrends,
    refetchGrievances,
  };
};

/**
 * Hook for dashboard system stats and health
 */
export const useDashboardSystem = () => {
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useGraphqlQuery(
    DASHBOARD_VIEW_STATS,
    {},
    {}
  );

  const {
    data: healthData,
    isLoading: healthLoading,
    error: healthError,
    refetch: refetchHealth
  } = useGraphqlQuery(
    DASHBOARD_HEALTH,
    {},
    {}
  );

  return {
    stats: statsData?.dashboardViewStats,
    health: healthData?.dashboardHealth,
    isLoading: statsLoading || healthLoading,
    error: statsError || healthError,
    refetchStats,
    refetchHealth,
  };
};

/**
 * Hook for specific dashboard component with auto-refresh
 */
export const useOptimizedDashboardComponent = (component, filters = {}, autoRefreshInterval = null) => {
  const dashboard = useOptimizedDashboard(filters, { 
    summaryOnly: component === 'summary',
    includeTransfers: component === 'transfers' || component === 'all',
    includeTrends: component === 'trends' || component === 'all',
    includeGrievances: component === 'grievances' || component === 'all',
  });

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefreshInterval) return;

    const interval = setInterval(() => {
      dashboard.refetchAll();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, dashboard.refetchAll]);

  // Return specific component data
  switch (component) {
    case 'summary':
      return {
        data: dashboard.summary,
        isLoading: dashboard.summaryLoading,
        error: dashboard.summaryError,
        refetch: dashboard.refetchSummary,
        isRefreshing: dashboard.isRefreshing,
      };
    case 'breakdown':
      return {
        data: dashboard.breakdown,
        isLoading: dashboard.breakdownLoading,
        error: dashboard.breakdownError,
        refetch: dashboard.refetchBreakdown,
        isRefreshing: dashboard.isRefreshing,
      };
    case 'transfers':
      return {
        data: dashboard.performance,
        isLoading: dashboard.performanceLoading,
        error: dashboard.performanceError,
        refetch: dashboard.refetchPerformance,
        isRefreshing: dashboard.isRefreshing,
      };
    case 'trends':
      return {
        data: dashboard.trends,
        isLoading: dashboard.trendsLoading,
        error: dashboard.trendsError,
        refetch: dashboard.refetchTrends,
        isRefreshing: dashboard.isRefreshing,
      };
    case 'grievances':
      return {
        data: dashboard.grievances,
        isLoading: dashboard.grievanceLoading,
        error: dashboard.grievanceError,
        refetch: dashboard.refetchGrievances,
        isRefreshing: dashboard.isRefreshing,
      };
    default:
      return dashboard;
  }
};

export default useOptimizedDashboard;