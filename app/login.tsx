import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../src/stores/auth-store';
import { discovery, redirectUri, getAuthRequest, exchangeCodeForTokens } from '../src/services/auth';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const setTokens = useAuthStore((s) => s.setTokens);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: '9e79a7ac-3f90-4a5f-9578-6002bb56d1d6', // TODO: Replace with Azure app registration client ID
      scopes: ['openid', 'profile', 'Files.ReadWrite', 'User.Read', 'offline_access'],
      redirectUri,
      usePKCE: true,
    },
    discovery,
  );

  useEffect(() => {
    if (response?.type !== 'success' || !request?.codeVerifier) return;

    const { code } = response.params;
    exchangeCodeForTokens(code, request.codeVerifier).then(async (tokenResponse) => {
      // Fetch user profile
      const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokenResponse.accessToken}` },
      });
      const profile = await profileRes.json();

      await setTokens({
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken ?? undefined,
        expiresIn: tokenResponse.expiresIn,
        userName: profile.displayName,
        userEmail: profile.mail || profile.userPrincipalName,
      });
    });
  }, [response, request, setTokens]);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.icon}>🛒</Text>
        <Text style={styles.title}>Shopping List</Text>
        <Text style={styles.subtitle}>Companion app for eCookbook</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.description}>
          Sign in with your Microsoft account to sync your shopping list from OneDrive.
        </Text>

        <Pressable
          style={[styles.signInButton, !request && styles.signInButtonDisabled]}
          onPress={() => promptAsync()}
          disabled={!request}
        >
          {!request ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signInText}>Sign in with Microsoft</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    paddingTop: 120,
    paddingBottom: 60,
    paddingHorizontal: 32,
  },
  hero: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  bottom: {
    gap: 20,
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  signInButton: {
    backgroundColor: '#0078D4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
