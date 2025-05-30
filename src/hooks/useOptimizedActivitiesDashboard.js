/**
 * Optimized Activities Dashboard Hook
 * Provides high-performance data retrieval for activities dashboard
 */

import { useGraphqlQuery } from '@openimis/fe-core';
import { useState, useCallback, useMemo } from 'react';

// GraphQL Query for optimized activities dashboard
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

export const useOptimizedActivitiesDashboard = (filters = {}, options = {}) => {
  const [refreshing, setRefreshing] = useState(false);

  // Memoize filters
  const memoizedFilters = useMemo(() => {
    const cleanFilters = {};
    if (filters.startDate) cleanFilters.startDate = filters.startDate;
    if (filters.endDate) cleanFilters.endDate = filters.endDate;
    if (filters.locations?.length) cleanFilters.locationIds = filters.locations.map(l => l.id);
    if (filters.validationStatus?.length) cleanFilters.validationStatus = filters.validationStatus;
    if (filters.projectCategories?.length) cleanFilters.projectCategories = filters.projectCategories;
    if (filters.activityType) cleanFilters.activityType = filters.activityType;
    return cleanFilters;
  }, [filters]);

  // Main query
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGraphqlQuery(
    OPTIMIZED_ACTIVITIES_DASHBOARD,
    { filters: memoizedFilters },
    { skip: options.disabled }
  );

  // Refetch function
  const refetchAll = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Extract data
  const activitiesData = data?.optimizedActivitiesDashboard;

  return {
    // Data
    summary: activitiesData?.summary,
    byActivityType: activitiesData?.byActivityType || [],
    byProvince: activitiesData?.byProvince || [],
    microProjects: activitiesData?.microProjects,
    lastUpdated: activitiesData?.lastUpdated,

    // States
    isLoading,
    isRefreshing: refreshing,
    error,

    // Functions
    refetch: refetchAll,
  };
};

/**
 * Hook for Results Framework Dashboard
 */
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

export const useOptimizedResultsFramework = (filters = {}, options = {}) => {
  const [refreshing, setRefreshing] = useState(false);

  // Memoize filters
  const memoizedFilters = useMemo(() => {
    const cleanFilters = {};
    if (filters.sectionId) cleanFilters.sectionId = filters.sectionId;
    if (filters.year) cleanFilters.year = parseInt(filters.year);
    if (filters.quarter) cleanFilters.quarter = filters.quarter;
    return cleanFilters;
  }, [filters]);

  // Main query
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGraphqlQuery(
    OPTIMIZED_RESULTS_FRAMEWORK,
    { filters: memoizedFilters },
    { skip: options.disabled }
  );

  // Refetch function
  const refetchAll = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Extract data
  const frameworkData = data?.optimizedResultsFramework;

  return {
    // Data
    summary: frameworkData?.summary,
    bySection: frameworkData?.bySection || [],
    indicatorPerformance: frameworkData?.indicatorPerformance || [],
    lastUpdated: frameworkData?.lastUpdated,

    // States
    isLoading,
    isRefreshing: refreshing,
    error,

    // Functions
    refetch: refetchAll,
  };
};