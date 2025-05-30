/**
 * Hook for Payment Reporting Dashboard
 * Fetches payment data from both MonetaryTransfer and BenefitConsumption
 * with comprehensive filtering capabilities
 */

import { useGraphqlQuery } from '@openimis/fe-core';
import { useMemo, useState, useCallback } from 'react';

// GraphQL query for payment summary
const PAYMENT_REPORT_SUMMARY_QUERY = `
  query PaymentReportSummary($filters: PaymentReportFiltersInput) {
    paymentReportSummary(filters: $filters) {
      summary {
        totalPayments
        totalAmount
        totalBeneficiaries
        avgPaymentAmount
        externalPayments
        externalAmount
        internalPayments
        internalAmount
        femalePercentage
        twaPercentage
        provincesCovered
        communesCovered
        collinesCovered
        programsActive
      }
      breakdownBySource {
        source
        paymentCount
        paymentAmount
        beneficiaryCount
        femalePercentage
        twaPercentage
      }
      breakdownByGender {
        gender
        paymentCount
        paymentAmount
        beneficiaryCount
      }
      breakdownByCommunity {
        communityType
        paymentCount
        paymentAmount
        beneficiaryCount
        femalePercentage
        twaPercentage
      }
      lastUpdated
    }
  }
`;

// GraphQL query for location-based analysis
const PAYMENT_BY_LOCATION_QUERY = `
  query PaymentByLocation($filters: PaymentReportFiltersInput, $level: String) {
    paymentByLocation(filters: $filters, level: $level) {
      locations {
        provinceId
        provinceName
        communeId
        communeName
        collineId
        collineName
        paymentCount
        paymentAmount
        beneficiaryCount
        avgPayment
        femalePercentage
        twaPercentage
      }
      total {
        paymentCount
        paymentAmount
        beneficiaryCount
      }
      level
      lastUpdated
    }
  }
`;

// GraphQL query for program-based analysis
const PAYMENT_BY_PROGRAM_QUERY = `
  query PaymentByProgram($filters: PaymentReportFiltersInput) {
    paymentByProgram(filters: $filters) {
      programs {
        benefitPlanId
        benefitPlanName
        paymentCount
        paymentAmount
        beneficiaryCount
        avgPayment
        femalePercentage
        twaPercentage
        provincesCovered
      }
      total {
        paymentCount
        paymentAmount
        beneficiaryCount
      }
      lastUpdated
    }
  }
`;

// GraphQL query for payment trends
const PAYMENT_TRENDS_QUERY = `
  query PaymentTrends($filters: PaymentReportFiltersInput, $granularity: String) {
    paymentTrends(filters: $filters, granularity: $granularity) {
      trends {
        period
        paymentCount
        paymentAmount
        beneficiaryCount
        femalePercentage
        twaPercentage
        cumulativeAmount
        cumulativePayments
      }
      granularity
      lastUpdated
    }
  }
`;

// GraphQL query for KPIs
const PAYMENT_KPIS_QUERY = `
  query PaymentKPIs($filters: PaymentReportFiltersInput) {
    paymentKPIs(filters: $filters) {
      kpis {
        totalDisbursed
        beneficiariesReached
        avgPayment
        femaleInclusion
        twaInclusion
        geographicCoverage
        activePrograms
        externalPercentage
        internalPercentage
        efficiencyScore
      }
      targets {
        femaleInclusion
        twaInclusion
        efficiencyScore
      }
      lastUpdated
    }
  }
`;

export const usePaymentReporting = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    ...initialFilters,
  });

  // Prepare filters for GraphQL
  const gqlFilters = useMemo(() => {
    const cleanFilters = {};
    
    if (filters.provinceId) cleanFilters.provinceId = parseInt(filters.provinceId);
    if (filters.communeId) cleanFilters.communeId = parseInt(filters.communeId);
    if (filters.collineId) cleanFilters.collineId = parseInt(filters.collineId);
    if (filters.benefitPlanId) cleanFilters.benefitPlanId = filters.benefitPlanId;
    if (filters.year) cleanFilters.year = filters.year;
    if (filters.month) cleanFilters.month = filters.month;
    if (filters.startDate) cleanFilters.startDate = filters.startDate;
    if (filters.endDate) cleanFilters.endDate = filters.endDate;
    if (filters.gender) cleanFilters.gender = filters.gender;
    if (filters.isTwa !== undefined) cleanFilters.isTwa = filters.isTwa;
    if (filters.communityType) cleanFilters.communityType = filters.communityType;
    if (filters.paymentSource) cleanFilters.paymentSource = filters.paymentSource;
    
    return { filters: cleanFilters };
  }, [filters]);

  // Query for payment summary
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useGraphqlQuery(
    PAYMENT_REPORT_SUMMARY_QUERY,
    gqlFilters,
    { skip: false }
  );

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({ year: new Date().getFullYear() });
  }, []);

  // Process summary data
  const processedSummary = useMemo(() => {
    if (!summaryData?.paymentReportSummary) {
      return {
        summary: null,
        breakdownBySource: [],
        breakdownByGender: [],
        breakdownByCommunity: [],
        lastUpdated: null,
      };
    }
    return summaryData.paymentReportSummary;
  }, [summaryData]);

  return {
    // Data
    summary: processedSummary.summary,
    breakdownBySource: processedSummary.breakdownBySource,
    breakdownByGender: processedSummary.breakdownByGender,
    breakdownByCommunity: processedSummary.breakdownByCommunity,
    lastUpdated: processedSummary.lastUpdated,
    
    // State
    filters,
    isLoading: summaryLoading,
    error: summaryError,
    
    // Actions
    updateFilters,
    clearFilters,
    refetch: refetchSummary,
  };
};

// Hook for location-based payment analysis
export const usePaymentByLocation = (level = 'province', filters = {}) => {
  const variables = useMemo(() => ({
    level,
    filters: filters || {},
  }), [level, filters]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGraphqlQuery(
    PAYMENT_BY_LOCATION_QUERY,
    variables,
    { skip: false }
  );

  return {
    locations: data?.paymentByLocation?.locations || [],
    total: data?.paymentByLocation?.total || { paymentCount: 0, paymentAmount: 0, beneficiaryCount: 0 },
    level: data?.paymentByLocation?.level || level,
    lastUpdated: data?.paymentByLocation?.lastUpdated,
    isLoading,
    error,
    refetch,
  };
};

// Hook for program-based payment analysis
export const usePaymentByProgram = (filters = {}) => {
  const variables = useMemo(() => ({
    filters: filters || {},
  }), [filters]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGraphqlQuery(
    PAYMENT_BY_PROGRAM_QUERY,
    variables,
    { skip: false }
  );

  return {
    programs: data?.paymentByProgram?.programs || [],
    total: data?.paymentByProgram?.total || { paymentCount: 0, paymentAmount: 0, beneficiaryCount: 0 },
    lastUpdated: data?.paymentByProgram?.lastUpdated,
    isLoading,
    error,
    refetch,
  };
};

// Hook for payment trends
export const usePaymentTrends = (granularity = 'month', filters = {}) => {
  const variables = useMemo(() => ({
    granularity,
    filters: filters || {},
  }), [granularity, filters]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGraphqlQuery(
    PAYMENT_TRENDS_QUERY,
    variables,
    { skip: false }
  );

  return {
    trends: data?.paymentTrends?.trends || [],
    granularity: data?.paymentTrends?.granularity || granularity,
    lastUpdated: data?.paymentTrends?.lastUpdated,
    isLoading,
    error,
    refetch,
  };
};

// Hook for payment KPIs
export const usePaymentKPIs = (filters = {}) => {
  const variables = useMemo(() => ({
    filters: filters || {},
  }), [filters]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGraphqlQuery(
    PAYMENT_KPIS_QUERY,
    variables,
    { skip: false }
  );

  return {
    kpis: data?.paymentKPIs?.kpis || null,
    targets: data?.paymentKPIs?.targets || null,
    lastUpdated: data?.paymentKPIs?.lastUpdated,
    isLoading,
    error,
    refetch,
  };
};