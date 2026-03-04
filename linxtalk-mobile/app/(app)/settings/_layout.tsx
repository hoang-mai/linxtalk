import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "@/library/Icon";

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
                headerLeft: () => (
                    <Pressable onPress={() => router.back()}>
                        <Icon name="arrow-back-outline" size={24} color={"black"} darkColor={"white"} />
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
                headerLeft: () => (
                    <Pressable onPress={() => router.back()}>
                        <Icon name="arrow-back-outline" size={24} color={"black"} darkColor={"white"} />
                    </Pressable>
                ),
            }} />
            <Stack.Screen name="theme/index" options={{
                headerShown: true,
                headerTitle: t('settings.theme'),
                headerShadowVisible: false,
                headerTitleStyle: {
                    fontWeight: "bold",
                },
                headerTitleAlign: "center",
                headerLeft: () => (
                    <Pressable onPress={() => router.back()}>
                        <Icon name="arrow-back-outline" size={24} color={"black"} darkColor={"white"} />
                    </Pressable>
                ),
            }} />
        </Stack>
    );
}