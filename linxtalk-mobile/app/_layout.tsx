import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "./global.css"
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

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});
const queryClient = new QueryClient();

export default function RootLayout() {
  const { isHydrated: isAuthHydrated, isAuthenticated } = useAuthStore();
  const { isHydrated: isSavedAccountHydrated } = useSavedAccountStore();
  const { isHydrated: isAccountHydrated } = useAccountStore();

  if (!isAuthHydrated || !isSavedAccountHydrated || !isAccountHydrated) {
    return null;
  }

  return (
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
  );
}
