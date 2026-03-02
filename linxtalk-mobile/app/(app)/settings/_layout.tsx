import {Stack, useRouter} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {Pressable} from "react-native";

export default function SettingsLayout() {
    const router = useRouter();
    return (
        <Stack screenOptions={{gestureEnabled: true, animation: 'fade'}}>
            <Stack.Screen name="index" options={{headerShown: false}}/>
            <Stack.Screen name="edit-info/index" options={{
                headerShown: true,
                headerTitle: "Account",
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
                        <Ionicons name="arrow-back-outline" size={24} color="black"/>
                    </Pressable>
                ),
            }}/>
        </Stack>
    );
}