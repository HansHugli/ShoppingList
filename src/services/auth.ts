import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';

const TENANT = 'consumers';
const CLIENT_ID = '9e79a7ac-3f90-4a5f-9578-6002bb56d1d6'; // TODO: Replace with Azure app registration client ID
const SCOPES = ['openid', 'profile', 'Files.ReadWrite', 'User.Read', 'offline_access'];

const STORAGE_KEYS = {
  accessToken: 'auth_access_token',
  refreshToken: 'auth_refresh_token',
  expiresAt: 'auth_expires_at',
  userName: 'auth_user_name',
  userEmail: 'auth_user_email',
} as const;

export const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize`,
  tokenEndpoint: `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`,
};

export const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'com.ecookbook.shoppinglist',
  path: 'auth',
});

export function getAuthRequest() {
  return new AuthSession.AuthRequest({
    clientId: CLIENT_ID,
    scopes: SCOPES,
    redirectUri,
    usePKCE: true,
  });
}

export async function exchangeCodeForTokens(code: string, codeVerifier: string) {
  const response = await AuthSession.exchangeCodeAsync(
    {
      clientId: CLIENT_ID,
      code,
      redirectUri,
      extraParams: { code_verifier: codeVerifier },
    },
    discovery,
  );
  return response;
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await AuthSession.refreshAsync(
    {
      clientId: CLIENT_ID,
      refreshToken,
      scopes: SCOPES,
    },
    discovery,
  );
  return response;
}

export async function storeTokens(params: {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number;
  userName?: string;
  userEmail?: string;
}) {
  await SecureStore.setItemAsync(STORAGE_KEYS.accessToken, params.accessToken);
  if (params.refreshToken) {
    await SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, params.refreshToken);
  }
  if (params.expiresIn) {
    const expiresAt = String(Date.now() + params.expiresIn * 1000);
    await SecureStore.setItemAsync(STORAGE_KEYS.expiresAt, expiresAt);
  }
  if (params.userName) {
    await SecureStore.setItemAsync(STORAGE_KEYS.userName, params.userName);
  }
  if (params.userEmail) {
    await SecureStore.setItemAsync(STORAGE_KEYS.userEmail, params.userEmail);
  }
}

export async function loadStoredTokens() {
  const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.accessToken);
  const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.refreshToken);
  const expiresAt = await SecureStore.getItemAsync(STORAGE_KEYS.expiresAt);
  const userName = await SecureStore.getItemAsync(STORAGE_KEYS.userName);
  const userEmail = await SecureStore.getItemAsync(STORAGE_KEYS.userEmail);

  return {
    accessToken,
    refreshToken,
    expiresAt: expiresAt ? Number(expiresAt) : null,
    userName,
    userEmail,
  };
}

export async function clearStoredTokens() {
  await Promise.all(
    Object.values(STORAGE_KEYS).map((key) => SecureStore.deleteItemAsync(key)),
  );
}

export function isTokenExpired(expiresAt: number | null): boolean {
  if (!expiresAt) return true;
  return Date.now() >= expiresAt - 60_000; // 1 min buffer
}
