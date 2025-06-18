import {
  formatQuery,
  formatPageQuery,
  formatMutation,
  decodeId,
  graphql,
} from '@openimis/fe-core';

// Action types
export const RESULT_FRAMEWORK_SNAPSHOTS_REQ = 'RESULT_FRAMEWORK_SNAPSHOTS_REQ';
export const RESULT_FRAMEWORK_SNAPSHOTS_RESP = 'RESULT_FRAMEWORK_SNAPSHOTS_RESP';
export const RESULT_FRAMEWORK_SNAPSHOTS_ERR = 'RESULT_FRAMEWORK_SNAPSHOTS_ERR';

export const CALCULATE_INDICATOR_VALUE_REQ = 'CALCULATE_INDICATOR_VALUE_REQ';
export const CALCULATE_INDICATOR_VALUE_RESP = 'CALCULATE_INDICATOR_VALUE_RESP';
export const CALCULATE_INDICATOR_VALUE_ERR = 'CALCULATE_INDICATOR_VALUE_ERR';

export const CREATE_SNAPSHOT_REQ = 'CREATE_SNAPSHOT_REQ';
export const CREATE_SNAPSHOT_RESP = 'CREATE_SNAPSHOT_RESP';
export const CREATE_SNAPSHOT_ERR = 'CREATE_SNAPSHOT_ERR';

export const GENERATE_DOCUMENT_REQ = 'GENERATE_DOCUMENT_REQ';
export const GENERATE_DOCUMENT_RESP = 'GENERATE_DOCUMENT_RESP';
export const GENERATE_DOCUMENT_ERR = 'GENERATE_DOCUMENT_ERR';

export const FINALIZE_SNAPSHOT_REQ = 'FINALIZE_SNAPSHOT_REQ';
export const FINALIZE_SNAPSHOT_RESP = 'FINALIZE_SNAPSHOT_RESP';
export const FINALIZE_SNAPSHOT_ERR = 'FINALIZE_SNAPSHOT_ERR';

// Query to fetch snapshots
export function fetchResultFrameworkSnapshots(filters) {
  const query = `
    query ($first: Int, $last: Int, $after: String, $before: String, $orderBy: [String], 
           $status: String, $name_Icontains: String) {
      resultFrameworkSnapshot(
        first: $first, last: $last, after: $after, before: $before, orderBy: $orderBy,
        status: $status, name_Icontains: $name_Icontains
      ) {
        totalCount
        pageInfo { hasNextPage, hasPreviousPage, startCursor, endCursor }
        edges {
          node {
            id
            name
            description
            snapshotDate
            status
            createdBy { username }
            documentPath
            data
          }
        }
      }
    }
  `;
  
  const payload = formatPageQuery(
    'resultFrameworkSnapshot',
    filters.first || 10,
    filters.after,
    filters.before,
    filters.orderBy || ['-snapshotDate']
  );
  
  return graphql(
    query,
    { ...payload, ...filters },
    RESULT_FRAMEWORK_SNAPSHOTS_REQ,
    RESULT_FRAMEWORK_SNAPSHOTS_RESP,
    RESULT_FRAMEWORK_SNAPSHOTS_ERR
  );
}

// Query to calculate indicator value
export function calculateIndicatorValue(indicatorId, dateFrom, dateTo, locationId) {
  const query = `
    query ($indicatorId: Int!, $dateFrom: Date, $dateTo: Date, $locationId: ID) {
      calculateIndicatorValue(
        indicatorId: $indicatorId,
        dateFrom: $dateFrom,
        dateTo: $dateTo,
        locationId: $locationId
      ) {
        value
        calculationType
        systemValue
        manualValue
        error
        date
        genderBreakdown
      }
    }
  `;
  
  return graphql(
    query,
    { indicatorId, dateFrom, dateTo, locationId },
    CALCULATE_INDICATOR_VALUE_REQ,
    CALCULATE_INDICATOR_VALUE_RESP,
    CALCULATE_INDICATOR_VALUE_ERR
  );
}

// Mutation to create snapshot
export function createResultFrameworkSnapshot(name, description, dateFrom, dateTo) {
  const mutation = `
    mutation ($input: CreateResultFrameworkSnapshotInput!) {
      createResultFrameworkSnapshot(input: $input) {
        internalId
        clientMutationId
      }
    }
  `;
  
  const input = formatMutation('createResultFrameworkSnapshot', {
    name,
    description,
    dateFrom,
    dateTo
  });
  
  return graphql(
    mutation,
    { input },
    CREATE_SNAPSHOT_REQ,
    CREATE_SNAPSHOT_RESP,
    CREATE_SNAPSHOT_ERR
  );
}

// Mutation to generate document
export function generateResultFrameworkDocument(snapshotId, format, dateFrom, dateTo) {
  const mutation = `
    mutation ($snapshotId: ID, $format: String, $dateFrom: Date, $dateTo: Date) {
      generateResultFrameworkDocument(
        snapshotId: $snapshotId,
        format: $format,
        dateFrom: $dateFrom,
        dateTo: $dateTo
      ) {
        success
        message
        documentUrl
      }
    }
  `;
  
  return graphql(
    mutation,
    { snapshotId, format: format || 'docx', dateFrom, dateTo },
    GENERATE_DOCUMENT_REQ,
    GENERATE_DOCUMENT_RESP,
    GENERATE_DOCUMENT_ERR
  );
}

// Mutation to finalize snapshot
export function finalizeSnapshot(snapshotId) {
  const mutation = `
    mutation ($input: FinalizeSnapshotInput!) {
      finalizeSnapshot(input: $input) {
        internalId
        clientMutationId
      }
    }
  `;
  
  const input = formatMutation('finalizeSnapshot', { snapshotId });
  
  return graphql(
    mutation,
    { input },
    FINALIZE_SNAPSHOT_REQ,
    FINALIZE_SNAPSHOT_RESP,
    FINALIZE_SNAPSHOT_ERR
  );
}

// Helper to clear snapshots
export function clearResultFrameworkSnapshots() {
  return dispatch => {
    dispatch({ type: RESULT_FRAMEWORK_SNAPSHOTS_RESP, payload: null });
  };
}