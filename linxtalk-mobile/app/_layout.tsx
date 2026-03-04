import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "./global.css"
import '@/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { useSavedAccountStore } from '@/store/saved-account-store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from '@/components/modals/Toast';
import Loading from '@/components/modals/Loading';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAccountStore } from '@/store/account-store';
import ModalGlobal from '@/components/modals/ModalGlobal';
import { useLanguageStore } from '@/store/language-store';
import { useThemeStore } from '@/store/theme-store';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from '@react-navigation/native';
import { LightTheme, DarkTheme } from '@/constants/theme';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});
const queryClient = new QueryClient();

export default function RootLayout() {
  const { isHydrated: isAuthHydrated, isAuthenticated } = useAuthStore();
  const { isHydrated: isSavedAccountHydrated } = useSavedAccountStore();
  const { isHydrated: isAccountHydrated } = useAccountStore();
  const { isHydrated: isLanguageHydrated } = useLanguageStore();
  const { isHydrated: isThemeHydrated } = useThemeStore();
  const colorScheme = useColorScheme();

  if (!isAuthHydrated || !isSavedAccountHydrated || !isAccountHydrated || !isLanguageHydrated || !isThemeHydrated) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : LightTheme}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="auto" />
            <Loading />
            <ModalGlobal />
            <Toast />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Protected guard={isAuthenticated}>
                <Stack.Screen name='(app)' />
              </Stack.Protected>
              <Stack.Protected guard={!isAuthenticated}>
                <Stack.Screen name='(auth)' />
              </Stack.Protected>
            </Stack>
          </QueryClientProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
