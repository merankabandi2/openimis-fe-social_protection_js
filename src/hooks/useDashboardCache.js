import { useState, useEffect, useCallback, useRef } from 'react';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STALE_WHILE_REVALIDATE = 60 * 1000; // 1 minute

/**
 * Custom hook for cached dashboard data fetching with stale-while-revalidate
 */
export const useDashboardCache = (fetchFunction, cacheKey, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);
  
  const cacheRef = useRef({});
  const abortControllerRef = useRef(null);
  
  // Get cache from localStorage and memory
  const getCache = useCallback(() => {
    // First check memory cache
    if (cacheRef.current[cacheKey]) {
      const { data, timestamp } = cacheRef.current[cacheKey];
      const age = Date.now() - timestamp;
      
      if (age < CACHE_DURATION) {
        return { data, isStale: age > STALE_WHILE_REVALIDATE };
      }
    }
    
    // Then check localStorage
    try {
      const cached = localStorage.getItem(`sp_dashboard_${cacheKey}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        if (age < CACHE_DURATION) {
          // Store in memory cache for faster access
          cacheRef.current[cacheKey] = { data, timestamp };
          return { data, isStale: age > STALE_WHILE_REVALIDATE };
        }
      }
    } catch (e) {
      console.error('Cache read error:', e);
    }
    return null;
  }, [cacheKey]);
  
  // Set cache in both localStorage and memory
  const setCache = useCallback((data) => {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    
    // Memory cache
    cacheRef.current[cacheKey] = cacheData;
    
    // LocalStorage cache
    try {
      localStorage.setItem(`sp_dashboard_${cacheKey}`, JSON.stringify(cacheData));
    } catch (e) {
      console.error('Cache write error:', e);
    }
  }, [cacheKey]);
  
  // Fetch data with abort support
  const fetchData = useCallback(async (silent = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      if (!silent) setLoading(true);
      
      const result = await fetchFunction({
        signal: abortControllerRef.current.signal
      });
      
      setData(result);
      setCache(result);
      setError(null);
      setIsStale(false);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
        console.error('Dashboard fetch error:', err);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [fetchFunction, setCache]);
  
  // Initial load
  useEffect(() => {
    const cached = getCache();
    
    if (cached) {
      setData(cached.data);
      setIsStale(cached.isStale);
      setLoading(false);
      
      // If stale, revalidate in background
      if (cached.isStale) {
        fetchData(true);
      }
    } else {
      fetchData();
    }
    
    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [...dependencies, cacheKey]);
  
  // Manual refresh
  const refresh = useCallback(() => {
    setIsStale(false);
    fetchData();
  }, [fetchData]);
  
  // Prefetch data for next likely interaction
  const prefetch = useCallback((nextCacheKey) => {
    const prefetchKey = `sp_dashboard_${nextCacheKey}`;
    const cached = localStorage.getItem(prefetchKey);
    
    if (!cached) {
      // Prefetch in background
      fetchFunction().then(data => {
        localStorage.setItem(prefetchKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      }).catch(console.error);
    }
  }, [fetchFunction]);
  
  return {
    data,
    loading,
    error,
    isStale,
    refresh,
    prefetch
  };
};

/**
 * Dashboard data aggregation utilities
 */
export const aggregateDashboardData = (rawData) => {
  if (!rawData) return null;
  
  // Aggregate beneficiaries by status
  const statusCounts = rawData.beneficiaries?.reduce((acc, beneficiary) => {
    acc[beneficiary.status] = (acc[beneficiary.status] || 0) + 1;
    return acc;
  }, {}) || {};
  
  // Calculate transfer statistics
  const transferStats = rawData.transfers?.reduce((acc, transfer) => {
    acc.total += transfer.amount || 0;
    acc.count += 1;
    acc.average = acc.total / acc.count;
    return acc;
  }, { total: 0, count: 0, average: 0 }) || { total: 0, count: 0, average: 0 };
  
  return {
    ...rawData,
    aggregated: {
      statusCounts,
      transferStats,
      lastUpdated: new Date().toISOString()
    }
  };
};

/**
 * Service Worker registration for background sync
 */
export const registerDashboardServiceWorker = () => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.register('/sp-dashboard-sw.js').then(registration => {
      console.log('Social Protection Dashboard Service Worker registered');
      
      // Register periodic sync for dashboard data
      if ('periodicSync' in registration) {
        registration.periodicSync.register('sp-dashboard-sync', {
          minInterval: 15 * 60 * 1000 // 15 minutes
        }).catch(console.error);
      }
    }).catch(console.error);
  }
};

/**
 * IndexedDB wrapper for large dataset caching
 */
class DashboardDB {
  constructor() {
    this.dbName = 'SPDashboardCache';
    this.version = 1;
    this.db = null;
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('dashboardData')) {
          const store = db.createObjectStore('dashboardData', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }
  
  async get(key) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['dashboardData'], 'readonly');
      const store = transaction.objectStore('dashboardData');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result && Date.now() - result.timestamp < CACHE_DURATION) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  async set(key, data, type = 'dashboard') {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['dashboardData'], 'readwrite');
      const store = transaction.objectStore('dashboardData');
      const request = store.put({
        key,
        data,
        type,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async clear(type = null) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['dashboardData'], 'readwrite');
      const store = transaction.objectStore('dashboardData');
      
      if (type) {
        const index = store.index('type');
        const request = index.openCursor(IDBKeyRange.only(type));
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      } else {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }
    });
  }
}

export const dashboardDB = new DashboardDB();