import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "./global.css"
import '@/i18n';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, persistOptions } from '@/components/providers/query-client';
import { useAuthStore } from '@/store/auth-store';
import { useSavedAccountStore } from '@/store/saved-account-store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from '@/components/modals/Toast';
import Loading from '@/components/modals/Loading';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAccountStore } from '@/store/account-store';
import ModalGlobal from '@/components/modals/ModalGlobal';
import BottomSheet from '@/library/BottomSheet';
import { useLanguageStore } from '@/store/language-store';
import { useThemeStore } from '@/store/theme-store';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from '@react-navigation/native';
import { LightTheme, DarkTheme } from '@/constants/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : LightTheme}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
              <StatusBar style="auto" />
              <Loading />
              <ModalGlobal />
              <BottomSheet />
              <Toast />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Protected guard={isAuthenticated}>
                  <Stack.Screen name='(app)' />
                </Stack.Protected>
                <Stack.Protected guard={!isAuthenticated}>
                  <Stack.Screen name='(auth)' />
                </Stack.Protected>
              </Stack>
            </PersistQueryClientProvider>
          </KeyboardProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
