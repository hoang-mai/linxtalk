import { useAuthStore } from "@/store/auth-store";
import { Platform, Pressable, Text, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { post } from "@/services/axios";
import { AUTH } from "@/constants/api";
import { LogoutRequest } from "@/constants/type";
import * as Application from "expo-application";
import { useRouter } from "expo-router";

export default function Main() {
    const router = useRouter();
    const { logout } = useAuthStore();
    const { mutate } = useMutation({
        mutationFn: async (data: LogoutRequest) => {
            const res = await post<BaseResponse<any>>(`${AUTH}/logout`, data);
            return res.data;
        },
    });

    const handleLogout = async () => {
        let deviceId = "unknown";
        try {
            if (Platform.OS === "android") {
                deviceId = Application.getAndroidId();
            } else if (Platform.OS === "ios") {
                deviceId = (await Application.getIosIdForVendorAsync()) || "unknown";
            }
        } catch (e) {
            console.error("Failed to get device ID", e);
        }
        mutate({ deviceId }, {
            onSettled: () => {
                logout();
                router.replace("/(auth)/save-account");
            }
        })
    }

    return (
        <View>
            <Text>Settings</Text>
            <Pressable
                onPress={handleLogout}
                className="bg-red-500 p-2 rounded-md"
            >
                <Text>Logout</Text>
            </Pressable>
        </View>
    );
}
