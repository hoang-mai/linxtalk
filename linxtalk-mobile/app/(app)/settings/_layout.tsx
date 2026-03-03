import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";

export default function SettingsLayout() {
    const router = useRouter();
    const { t } = useTranslation();
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="edit-info/index" options={{
                headerShown: true,
                headerTitle: t('editInfo.account'),
                headerShadowVisible: false,
                headerTitleStyle: {
                    fontWeight: "bold",
                },
                headerTitleAlign: "center",
                headerStyle: {
                    backgroundColor: "transparent",
                },
                headerLeft: () => (
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="arrow-back-outline" size={24} color="black" />
                    </Pressable>
                ),
            }} />
            <Stack.Screen name="language/index" options={{
                headerShown: true,
                headerTitle: t('settings.language'),
                headerShadowVisible: false,
                headerTitleStyle: {
                    fontWeight: "bold",
                },
                headerTitleAlign: "center",
                headerStyle: {
                    backgroundColor: "transparent",
                },
                headerLeft: () => (
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="arrow-back-outline" size={24} color="black" />
                    </Pressable>
                ),
            }} />
        </Stack>
    );
}