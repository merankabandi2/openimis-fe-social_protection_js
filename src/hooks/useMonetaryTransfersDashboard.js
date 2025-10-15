/**
 * Hook for Monetary Transfers Dashboard
 * Fetches specific data needed for the monetary transfers page
 * Uses payment reporting views that integrate external (MonetaryTransfer) and internal (BenefitConsumption) payments
 */

import { useGraphqlQuery } from '@openimis/fe-core';
import { useMemo } from 'react';

// Query for monetary transfers summary data
// Uses existing queries to combine both external (MonetaryTransfer) and internal (BenefitConsumption) payments
const MONETARY_TRANSFERS_SUMMARY = `
  query MonetaryTransfersSummary($year: Int, $benefitPlanId: String, $locationId: String) {
    # Get external payments from MonetaryTransfer
    monetaryTransfer {
      edges {
        node {
          id
          plannedWomen
          plannedMen
          plannedTwa
          paidWomen
          paidMen
          paidTwa
          plannedAmount
          transferredAmount
          transferDate
          location {
            id
            parent {
              id
            }
          }
          programme {
            id
          }
        }
      }
      totalCount
    }
    
    # Get internal payments from BenefitConsumption
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
  const {
    data, isLoading, error, refetch,
  } = useGraphqlQuery(
    MONETARY_TRANSFERS_SUMMARY,
    variables,
    { skip: false },
  );

  // Debug logging
  console.log('MonetaryTransfersDashboard hook:', {
    variables,
    data,
    error,
    isLoading,
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

    // Calculate external payments from MonetaryTransfer data
    const monetaryTransferEdges = data.monetaryTransfer?.edges || [];
    let externalPayments = 0;
    let externalBeneficiaries = 0;
    let externalPlannedAmount = 0;
    let externalTransferredAmount = 0;

    // Filter monetary transfers based on filters
    const filteredTransfers = monetaryTransferEdges.filter(({ node }) => {
      if (filters.year) {
        const transferYear = new Date(node.transferDate).getFullYear();
        if (transferYear !== parseInt(filters.year)) return false;
      }
      if (filters.locationId && node.location?.parent?.id !== filters.locationId) {
        return false;
      }
      if (filters.benefitPlanId && node.programme?.id !== filters.benefitPlanId) {
        return false;
      }
      return true;
    });

    // Calculate totals from filtered external transfers
    filteredTransfers.forEach(({ node }) => {
      const totalPaid = (node.paidWomen || 0) + (node.paidMen || 0) + (node.paidTwa || 0);
      const totalPlanned = (node.plannedWomen || 0) + (node.plannedMen || 0) + (node.plannedTwa || 0);

      externalPayments += totalPaid;
      externalBeneficiaries += totalPlanned; // Use planned beneficiaries for total count

      // Use actual amount fields
      externalPlannedAmount += parseFloat(node.plannedAmount || 0);
      externalTransferredAmount += parseFloat(node.transferredAmount || 0);
    });

    // Get internal payments from BenefitConsumption
    const benefitsSummary = data.benefitsSummaryFiltered || {};
    const internalAmountReceived = parseFloat(benefitsSummary.totalAmountReceived || 0);
    const totalAmountInternalDue = parseFloat(benefitsSummary.totalAmountDue || 0);

    // Total beneficiaries from internal system (group beneficiaries)
    const internalBeneficiaries = data.groupBeneficiaryFiltered?.totalCount || 0;

    // Total beneficiaries combines external planned beneficiaries and internal beneficiaries
    const totalBeneficiaries = Math.max(externalBeneficiaries, internalBeneficiaries);

    // Total payments (actual paid count from external + internal payment cycles)
    const totalPayments = externalPayments + (data.paymentCycleFiltered?.totalCount || 0);

    // Total amount combines external planned amount and internal due amount
    const totalAmountDue = externalPlannedAmount + totalAmountInternalDue;
    // Total amount received combines both external transferred amount and internal received amount
    const totalAmountReceived = externalTransferredAmount + internalAmountReceived;

    const totalAmount = totalAmountDue + totalAmountReceived;

    // Get household and individual counts
    const totalHouseholds = data.groupFiltered?.totalCount || 0;
    const totalIndividuals = data.individualFiltered?.totalCount || 0;

    const result = {
      totalBeneficiaries,
      totalPayments,
      totalAmount,
      totalAmountReceived,
      totalHouseholds,
      totalIndividuals,
      monetaryTransferData: filteredTransfers.map(({ node }) => node),
      externalPayments,
      internalPayments: data.paymentCycleFiltered?.totalCount || 0,
      externalPlannedAmount,
      externalTransferredAmount,
      internalAmount: internalAmountReceived,
    };

    return result;
  }, [data, filters]);

  return {
    ...processedData,
    isLoading,
    error,
    refetch,
  };
};
