import Icon from "@/library/Icon";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";

export default function FriendsLayout() {
    const router = useRouter();
    const { t } = useTranslation();
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="search-friends/index" options={{
                            headerShown: true,
                            headerTitle: t('friends.searchFriends'),
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
            <Stack.Screen name="see-all/index" options={{
                            headerShown: true,
                            headerTitle: t('friends.seeAll'),
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