/**
 * Hook for Monetary Transfers Dashboard
 * Fetches specific data needed for the monetary transfers page
 */

import { useGraphqlQuery } from '@openimis/fe-core';
import { useMemo } from 'react';

// Query for monetary transfers summary data
const MONETARY_TRANSFERS_SUMMARY = `
  query MonetaryTransfersSummary($year: Int, $benefitPlanId: String, $locationId: String) {
    # Get benefit consumption summary
    benefitsSummaryFiltered(
      year: $year
      benefitPlanUuid: $benefitPlanId
      parentLocation: $locationId
      parentLocationLevel: 0
    ) {
      totalAmountReceived
      totalAmountDue
    }
    
    # Get beneficiary counts
    groupBeneficiaryFiltered(
      year: $year
      parentLocation: $locationId
      parentLocationLevel: 0
    ) {
      totalCount
    }
    
    # Get household counts
    groupFiltered(
      parentLocation: $locationId
      parentLocationLevel: 0
    ) {
      totalCount
    }
    
    # Get individual counts
    individualFiltered(
      parentLocation: $locationId
      parentLocationLevel: 0
    ) {
      totalCount
    }
    
    # Get payment cycle counts
    paymentCycleFiltered(
      year: $year
      benefitPlanUuid: $benefitPlanId
    ) {
      totalCount
    }
    
    # Get monetary transfer data
    monetaryTransferBeneficiaryData(
      year: $year
      parentLocation: $locationId
      parentLocationLevel: 0
    ) {
      transferType
      malePaid
      maleUnpaid
      femalePaid
      femaleUnpaid
      totalPaid
      totalUnpaid
    }
  }
`;

export const useMonetaryTransfersDashboard = (filters = {}) => {
  // Prepare filters
  const variables = useMemo(() => ({
    year: filters.year || null,
    benefitPlanId: filters.benefitPlanId || null,
    locationId: filters.locationId || null,
  }), [filters]);

  // Execute query
  const { data, isLoading, error, refetch } = useGraphqlQuery(
    MONETARY_TRANSFERS_SUMMARY,
    variables,
    { skip: false }
  );

  // Debug logging
  console.log('MonetaryTransfersDashboard hook:', {
    variables,
    data,
    error,
    isLoading
  });

  // Process the data
  const processedData = useMemo(() => {
    if (!data) {
      return {
        totalBeneficiaries: 0,
        totalPayments: 0,
        totalAmount: 0,
        totalAmountReceived: 0,
        totalHouseholds: 0,
        totalIndividuals: 0,
        monetaryTransferData: [],
      };
    }

    // Extract totals
    const totalBeneficiaries = data.groupBeneficiaryFiltered?.totalCount || 0;
    const totalPayments = data.paymentCycleFiltered?.totalCount || 0;
    const totalAmount = data.benefitsSummaryFiltered?.totalAmountDue || 0;
    const totalAmountReceived = data.benefitsSummaryFiltered?.totalAmountReceived || 0;
    const totalHouseholds = data.groupFiltered?.totalCount || 0;
    const totalIndividuals = data.individualFiltered?.totalCount || 0;

    // Process monetary transfer data
    const monetaryTransferData = data.monetaryTransferBeneficiaryData || [];

    return {
      totalBeneficiaries,
      totalPayments,
      totalAmount,
      totalAmountReceived,
      totalHouseholds,
      totalIndividuals,
      monetaryTransferData,
    };
  }, [data]);

  return {
    ...processedData,
    isLoading,
    error,
    refetch,
  };
};