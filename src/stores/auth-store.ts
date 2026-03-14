import { create } from 'zustand';
import {
  loadStoredTokens,
  storeTokens,
  clearStoredTokens,
  refreshAccessToken,
  isTokenExpired,
} from '../services/auth';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  userName: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;
  setTokens: (params: {
    accessToken: string;
    refreshToken?: string | null;
    expiresIn?: number;
    userName?: string;
    userEmail?: string;
  }) => Promise<void>;
  getValidAccessToken: () => Promise<string>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  userName: null,
  userEmail: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const stored = await loadStoredTokens();
      if (stored.accessToken) {
        set({
          accessToken: stored.accessToken,
          refreshToken: stored.refreshToken,
          expiresAt: stored.expiresAt,
          userName: stored.userName,
          userEmail: stored.userEmail,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setTokens: async (params) => {
    await storeTokens(params);
    set({
      accessToken: params.accessToken,
      refreshToken: params.refreshToken ?? get().refreshToken,
      expiresAt: params.expiresIn ? Date.now() + params.expiresIn * 1000 : get().expiresAt,
      userName: params.userName ?? get().userName,
      userEmail: params.userEmail ?? get().userEmail,
      isAuthenticated: true,
    });
  },

  getValidAccessToken: async () => {
    const state = get();
    if (state.accessToken && !isTokenExpired(state.expiresAt)) {
      return state.accessToken;
    }

    if (!state.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await refreshAccessToken(state.refreshToken);
    await get().setTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken ?? undefined,
      expiresIn: response.expiresIn,
    });

    return response.accessToken;
  },

  logout: async () => {
    await clearStoredTokens();
    set({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      userName: null,
      userEmail: null,
      isAuthenticated: false,
    });
  },
}));
