import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useShoppingStore } from '../stores/shopping-store';
import { useAuthStore } from '../stores/auth-store';

const POLL_INTERVAL = 30_000; // 30 seconds

export function useSync() {
  const { initSync, fetchFromRemote, loadCached, syncStatus } = useShoppingStore();
  const getValidAccessToken = useAuthStore((s) => s.getValidAccessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initializedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize sync service when authenticated
  useEffect(() => {
    if (!isAuthenticated || initializedRef.current) return;
    initializedRef.current = true;
    initSync(getValidAccessToken);

    // Load cached first for instant UI, then fetch remote
    loadCached().then(() => fetchFromRemote());
  }, [isAuthenticated, initSync, getValidAccessToken, loadCached, fetchFromRemote]);

  // Poll for changes
  useEffect(() => {
    if (!isAuthenticated) return;

    intervalRef.current = setInterval(() => {
      fetchFromRemote();
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, fetchFromRemote]);

  // Re-fetch when app comes to foreground
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active' && isAuthenticated) {
        fetchFromRemote();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [isAuthenticated, fetchFromRemote]);

  const refresh = useCallback(() => {
    return fetchFromRemote();
  }, [fetchFromRemote]);

  return { refresh, syncStatus };
}
