import { Stack } from "expo-router";
import { useSavedAccountStore } from "@/store/saved-account-store";

export default function AuthLayout() {
  const { isSavedAccount } = useSavedAccountStore();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
      <Stack.Protected guard={isSavedAccount} >
        <Stack.Screen name="save-account/index" />
      </Stack.Protected>
      <Stack.Screen name="login/index" />
      <Stack.Screen name="register/index" />
    </Stack>
  );
}