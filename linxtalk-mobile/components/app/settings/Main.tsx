import { useAuthStore } from "@/store/auth-store";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { post } from "@/services/axios";
import { AUTH } from "@/constants/api";
import { AuthResponse, LogoutRequest, SavedAccount, SwitchAccountRequest } from "@/constants/type";
import { useRouter } from "expo-router";
import { useAccountStore } from "@/store/account-store";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { useSavedAccountStore } from "@/store/saved-account-store";
import { useModalStore } from "@/store/modal-store";
import AddNewAccount from "./AddNewAccount";
import ReloginAccount from "./ReloginAccount";
import { getDeviceId } from "@/utils/fn-common";
import { useLoadingStore } from "@/store/loading-store";
import { useToastStore } from "@/store/toast-store";

const SETTINGS_ITEMS: ListItemProps[] = [
    {
        title: "General",
        items: [
            {
                icon: "notifications-outline",
                title: "Notifications",
                description: "Manage your notifications",
                onPress: () => { }
            },
            {
                icon: "language-outline",
                title: "Language",
                description: "Change your language",
                onPress: () => { }
            },
        ]
    },
    {
        title: "About",
        items: [
            {
                icon: "information-circle-outline",
                title: "About",
                description: "Learn more about Linxtalk",
                onPress: () => { }
            },
        ]
    }
]


export default function Main() {
    const router = useRouter();
    const { logout, setTokens } = useAuthStore();
    const { account, clearAccount, setAccount } = useAccountStore();
    const { savedAccounts, removeAccount } = useSavedAccountStore();
    const { showModal } = useModalStore();
    const { showLoading, hideLoading } = useLoadingStore();
    const { showToast } = useToastStore();
    const saveAccountExceptCurrentAccount = savedAccounts.filter((savedAccount) => savedAccount.username !== account.username);
    const { mutate } = useMutation({
        mutationFn: async (data: LogoutRequest) => {
            const res = await post<BaseResponse<any>>(`${AUTH}/logout`, data);
            return res.data;
        },
        onSettled: async () => {
            logout();
            clearAccount();
            if (account.username) {
                removeAccount(account.username);
            }
            router.replace("/(auth)/save-account");
        }
    });

    const { mutate: mutateRemoveAccount } = useMutation({
        mutationFn: async (data: SwitchAccountRequest) => {
            const res = await post<BaseResponse<any>>(`${AUTH}/remove-account`, data);
            return res.data;
        },
        onSettled: async (_, __, variables) => {
            removeAccount(variables.username);
        }
    });

    const { mutate: mutateSwitchAccount } = useMutation({
        mutationFn: async (data: SwitchAccountRequest) => {
            const res = await post<BaseResponse<AuthResponse>>(`${AUTH}/switch-account`, data);
            return res.data;
        },
        onMutate: () => {
            showLoading();
        },
        onSuccess: (result, data) => {
            setTokens(result.data.accessToken, result.data.refreshToken);
            setAccount({
                username: data.username,
                email: null,
                displayName: result.data.displayName,
                avatarUrl: result.data.avatarUrl,
            });
            router.replace("/");
        },
        onSettled: () => {
            hideLoading();
        }
    });

    const handleLogout = async () => {
        const deviceId = await getDeviceId();
        mutate({ deviceId })
    }

    const handleAddNewAccount = () => {
        showModal({
            title: "Add New Account",
            children: <AddNewAccount />,
        });
    }

    const handleRemoveAccount = async (username: string) => {
        const deviceId = await getDeviceId();
        mutateRemoveAccount({ username, deviceId });
    }

    const handleSwitchAccount = async (account: SavedAccount) => {
        const deviceId = await getDeviceId();
        mutateSwitchAccount({ username: account.username, deviceId }, {
            onError: (error) => {
                showToast({
                    message: error.message,
                    type: "error",
                });
                showModal({
                    title: "Re-login",
                    children: <ReloginAccount account={account} />,
                });
            },
        });
    }

    const renderAccount = ({ item }: { item: SavedAccount }) => (
        <Pressable className="flex-row items-center" onPress={() => handleSwitchAccount(item)}>
            {/* Avatar */}
            <View
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                }}
                className="bg-primary-50 w-12 h-12 rounded-full border border-primary-100 items-center justify-center"
            >
                <Text className="text-2xl font-bold text-primary-500">
                    {item.displayName.charAt(0).toUpperCase()}
                </Text>
            </View>

            {/* Info */}
            <View className="flex-1 ml-4">
                <Text className="text-base font-semibold text-grey-900" numberOfLines={1}>
                    {item.displayName}
                </Text>
                <Text className="text-sm text-grey-500 mt-0.5" numberOfLines={1}>
                    @{item.username}
                </Text>
            </View>

            {/* Remove button */}
            <Pressable
                className="p-2"
                onPress={() => handleRemoveAccount(item.username)}
                hitSlop={8}
            >
                <Ionicons name="close-circle-outline" size={24} color={Colors.grey["400"]} />
            </Pressable>
        </Pressable>
    );

    return (
        <SafeAreaView>
            <ScrollView>
                <View className="flex-col items-center justify-center gap-4 mt-4">
                    <View
                        style={{
                            shadowColor: '#1FBAC3',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                        className="bg-primary-50 h-24 w-24 rounded-full border border-primary-100 items-center justify-center"
                    >
                        <Text className="text-4xl font-bold text-primary-500">
                            {account.displayName?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View className="flex-1 items-center gap-1">
                        <Text className="text-3xl font-bold">{account.displayName}</Text>
                        <Text className="text-sm text-gray-500">{account.email || `@${account.username}`}</Text>
                    </View>
                </View>
                <View className="flex-row gap-2 mt-4 mx-4">
                    <ButtonSetting icon="camera-outline" title="Set Photo" onPress={() => { }} />
                    <ButtonSetting icon="create-outline" title="Edit Profile" onPress={() => { }} />
                    <ButtonSetting icon="log-out-outline" title="Log out" onPress={handleLogout} />
                </View>
                <View className="flex-col gap-4 mt-4">
                    <View className="flex-col rounded-2xl mx-4 p-4 bg-white">
                        <Text className="text-lg font-medium text-primary-500 mb-4">Accounts</Text>
                        <FlatList
                            data={saveAccountExceptCurrentAccount}
                            keyExtractor={(item) => item.username}
                            renderItem={renderAccount}
                            contentContainerStyle={{ paddingBottom: 8 }}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                            ItemSeparatorComponent={() => <View className="h-4" />}
                        />
                        <View>
                            <Pressable
                                className="flex-row items-center"
                                onPress={handleAddNewAccount}
                            >
                                <View className="bg-primary-50 p-2 rounded-full w-12 h-12 items-center justify-center mr-4">
                                    <Ionicons name="add-outline" size={24} color={Colors.grey["400"]} />
                                </View>
                                <Text className="text-lg font-medium">Add Account</Text>
                            </Pressable>
                        </View>
                    </View>
                    {SETTINGS_ITEMS.map((item, index) => (
                        <ListItem key={index} title={item.title} items={item.items} />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

interface ItemProps {
    icon: keyof typeof Ionicons.glyphMap | null;
    title: string | null;
    description: string | null;
    onPress: () => void;
}

interface ListItemProps {
    title: string | null;
    items: ItemProps[];
}

function ListItem({ title, items }: ListItemProps) {
    return (
        <View className="flex-col rounded-2xl mx-4 p-4 bg-white">
            {title && <Text className="text-lg font-medium text-primary-500">{title}</Text>}
            {items.map((item, index) => (
                <Pressable
                    key={index}
                    onPress={item.onPress}
                    className="flex-row items-center justify-between mt-4"
                >
                    {item.icon && <View className="bg-primary-50 p-2 rounded-full w-12 h-12 items-center justify-center mr-4"><Ionicons name={item.icon} size={24} color="#9CA3AF" /></View>}
                    <View className="flex-1">
                        {item.title && <Text className="text-lg font-medium">{item.title}</Text>}
                        {item.description && <Text className="text-sm text-gray-500">{item.description}</Text>}
                    </View>

                </Pressable>
            ))}
        </View>
    );
}

interface ButtonSettingProps {
    icon: keyof typeof Ionicons.glyphMap | null;
    title: string;
    onPress: () => void;
}

function ButtonSetting({ icon, title, onPress }: ButtonSettingProps) {

    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withTiming(0.95, { duration: 100 });
    }

    const handlePressOut = () => {
        scale.value = withTiming(1, { duration: 100 });
    }

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            className="flex-1 items-center justify-center bg-white rounded-2xl"
        >
            <Animated.View style={animatedStyle}>
                <View className="flex-col items-center justify-center">
                    {icon && <View className="mt-2 mb-1"><Ionicons name={icon} size={22} color="#000" /></View>}
                    <Text className="text-xs font-medium text-black mb-3">{title}</Text>
                </View>
            </Animated.View>
        </Pressable>
    );
}
