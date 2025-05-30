/**
 * Enhanced GraphQL hook with caching support
 * Wraps the core useGraphqlQuery to add caching capabilities
 */

import { useGraphqlQuery as useBaseGraphqlQuery } from '@openimis/fe-core';
import { useQuery } from 'react-query';

export const useGraphqlQuery = (queryKey, query, variables = {}, options = {}) => {
  // If using base hook without React Query features
  if (options.useBaseHook) {
    return useBaseGraphqlQuery(query, variables, options.skip);
  }

  // Enhanced version with React Query
  const {
    enabled = true,
    staleTime = 0,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    refetchOnWindowFocus = true,
    refetchOnMount = true,
    refetchOnReconnect = true,
    retry = 1,
    retryDelay = attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...otherOptions
  } = options;

  // Create a stable query key
  const fullQueryKey = Array.isArray(queryKey) 
    ? [...queryKey, variables]
    : [queryKey, variables];

  return useQuery(
    fullQueryKey,
    async () => {
      // Use the base GraphQL query function
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers from context if needed
          ...(options.headers || {}),
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      return data.data;
    },
    {
      enabled,
      staleTime,
      cacheTime,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
      retry,
      retryDelay,
      ...otherOptions,
    }
  );
};

export const useGraphqlMutation = (mutation, options = {}) => {
  // For mutations, we'll use the base hook as mutations shouldn't be cached
  return useBaseGraphqlQuery(mutation, {}, false);
};