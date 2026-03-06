import { useAuthStore } from "@/store/auth-store";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { queryClient, asyncStoragePersister } from "@/components/providers/query-client";
import { post } from "@/services/axios";
import { AUTH } from "@/constants/api";
import { AuthResponse, LoginWithGoogleRequest, LogoutRequest, SavedAccount, SwitchAccountRequest } from "@/constants/type";
import { useRouter } from "expo-router";
import { useAccountStore } from "@/store/account-store";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { Colors } from "@/constants/theme";
import { useSavedAccountStore } from "@/store/saved-account-store";
import { useModalStore } from "@/store/modal-store";
import ReloginAccount from "./ReloginAccount";
import { getDeviceId } from "@/utils/fn-common";
import { useLoadingStore } from "@/store/loading-store";
import { useToastStore } from "@/store/toast-store";
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";
import * as Device from "expo-device";
import * as Application from "expo-application";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import Icon from "@/library/Icon";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Main() {
    const router = useRouter();
    const { t } = useTranslation();
    const { logout, setTokens } = useAuthStore();
    const { account, clearAccount, setAccount } = useAccountStore();
    const { savedAccounts, removeAccount, saveAccount } = useSavedAccountStore();
    const { showModal } = useModalStore();
    const { showLoading, hideLoading } = useLoadingStore();
    const { showToast } = useToastStore();

    const SETTINGS_ITEMS: ListItemProps[] = [
        {
            title: t('settings.general'),
            items: [
                {
                    icon: "notifications-outline",
                    title: t('settings.notifications'),
                    description: t('settings.manageNotifications'),
                    onPress: () => { }
                },
                {
                    icon: "language-outline",
                    title: t('settings.language'),
                    description: t('settings.changeLanguage'),
                    onPress: () => {
                        router.push("/settings/language");
                    }
                },
                {
                    icon: "color-palette-outline",
                    title: t('settings.theme'),
                    description: t('settings.changeTheme'),
                    onPress: () => {
                        router.push("/settings/theme");
                    }
                },
            ]
        },
        {
            title: t('settings.about'),
            items: [
                {
                    icon: "information-circle-outline",
                    title: t('settings.about'),
                    description: t('settings.learnMore'),
                    onPress: () => { }
                },
            ]
        }
    ];

    const saveAccountExceptCurrentAccount = savedAccounts.filter((savedAccount) => {
        if (savedAccount.username && account.username) return savedAccount.username !== account.username;
        if (savedAccount.email && account.email) return savedAccount.email !== account.email;
        return true;
    });
    const { mutate } = useMutation({
        mutationFn: async (data: LogoutRequest) => {
            const res = await post<BaseResponse<any>>(`${AUTH}/logout`, data);
            return res.data;
        },
        onSettled: async () => {
            const { username, email } = account;
            logout(); // Xóa token
            removeAccount(username, email); // Xóa account khỏi savedAccount
            clearAccount(); // Xóa account khỏi Account
            queryClient.clear();
            await asyncStoragePersister.removeClient(); // Xóa toàn bộ cache query
            router.replace("/(auth)/save-account");
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
        onSuccess: async (result) => {
            queryClient.clear();
            await asyncStoragePersister.removeClient(); // Xóa cache của account cũ
            setTokens(result.data.accessToken, result.data.refreshToken);
            setAccount({
                username: result.data.username,
                email: result.data.email,
                displayName: result.data.displayName,
                avatarUrl: result.data.avatarUrl,
            });
            router.replace("/");
        },
        onSettled: () => {
            hideLoading();
        }
    });

    const { mutate: googleMutate } = useMutation({
        mutationFn: async (data: LoginWithGoogleRequest) => {
            const res = await post<BaseResponse<AuthResponse>>(`${AUTH}/login-google`, data);
            return res.data;
        },
        onMutate: () => {
            showLoading();
        },
        onSuccess: async (result) => {
            queryClient.clear();
            await asyncStoragePersister.removeClient(); // Xóa cache của account cũ
            setTokens(result.data.accessToken, result.data.refreshToken);
            saveAccount({
                username: result.data.username,
                email: result.data.email,
                displayName: result.data.displayName,
                avatarUrl: result.data.avatarUrl,
            });
            setAccount({
                username: result.data.username,
                email: result.data.email,
                displayName: result.data.displayName,
                avatarUrl: result.data.avatarUrl,
            });
            router.replace("/");
        },
        onError: (error) => {
            showToast({
                message: error.message,
                type: "error",
            });
        },
        onSettled: async () => {
            hideLoading();
        },
    });

    const handleLogout = async () => {
        const deviceId = await getDeviceId();
        mutate({ deviceId })
    }

    const handleSwitchAccount = async (account: SavedAccount) => {
        const deviceId = await getDeviceId();
        mutateSwitchAccount({ username: account.username, deviceId, email: account.email }, {
            onError: (error) => {
                showToast({
                    message: error.message,
                    type: "error",
                });
                if (!account.username) {
                    handleGoogleRelogin(account);
                } else {
                    showModal({
                        title: t('relogin.title'),
                        children: <ReloginAccount account={account} />,
                    });
                }
            },
        });
    }

    const handleGoogleRelogin = async (targetAccount: SavedAccount) => {
        if (!targetAccount.email) return;
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            if (isSuccessResponse(response) && response.data.idToken) {
                const signedInEmail = response.data.user.email;
                if (signedInEmail !== targetAccount.email) {
                    showToast({
                        message: t('errors.pleaseSignInWith', { email: targetAccount.email }),
                        type: "error",
                    });
                    return;
                }
                const idToken = response.data.idToken;
                const deviceId = await getDeviceId();
                googleMutate({
                    idTokenString: idToken,
                    deviceId,
                    platform: Platform.OS,
                    deviceName: Device.deviceName || "unknown",
                    deviceModel: Device.modelName || "unknown",
                    osVersion: Device.osVersion || "unknown",
                    appVersion: Application.nativeApplicationVersion || "unknown",
                });
            } else {
                showToast({ message: t('errors.googleSignInFailed'), type: "error" });
            }
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.IN_PROGRESS:
                        showToast({ message: t('errors.googleSignInInProgress'), type: "error" });
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        showToast({ message: t('errors.googlePlayNotAvailable'), type: "error" });
                        break;
                    default:
                        showToast({ message: t('errors.googleSignInFailed'), type: "error" });
                        break;
                }
            } else {
                showToast({ message: t('errors.googleSignInFailed'), type: "error" });
            }
        } finally {
            await GoogleSignin.signOut();
        }
    };

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
                className="bg-primary-50 dark:bg-primary-900 w-12 h-12 rounded-full border border-primary-100 dark:border-primary-800 items-center justify-center"
            >
                <Text className="text-2xl font-bold text-primary-500">
                    {item.displayName.charAt(0).toUpperCase()}
                </Text>
            </View>

            {/* Info */}
            <View className="flex-1 ml-4">
                <Text className="text-base font-semibold text-grey-800 dark:text-grey-100" numberOfLines={1}>
                    {item.displayName}
                </Text>
                <Text className="text-sm text-grey-500 dark:text-grey-400 mt-0.5" numberOfLines={1}>
                    {item.username ? `@${item.username}` : item.email}
                </Text>
            </View>

        </Pressable>
    );

    return (
        <SafeAreaView>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <View className="flex-col items-center justify-center gap-4 mt-4">
                    <View
                        style={{
                            shadowColor: '#1FBAC3',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                        className="bg-primary-50 dark:bg-primary-900 h-24 w-24 rounded-full border border-primary-100 dark:border-primary-800 items-center justify-center"
                    >
                        <Text className="text-4xl font-bold text-primary-500 ">
                            {account.displayName?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View className="items-center gap-1">
                        <Text className="text-3xl font-bold dark:text-grey-100">{account.displayName}</Text>
                        <Text className="text-sm text-grey-500 dark:text-grey-400">{account.email || `@${account.username}`}</Text>
                    </View>
                </View>

                <LinearGradient
                    colors={['transparent', Colors.grey["200"], 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="h-[1px] mx-12 mt-8"
                />
                <View className="flex-col mt-4 gap-4">
                    <ListItem title={t('settings.accountActions')} items={[
                        { icon: "camera-outline", title: t('settings.setPhoto'), description: null, onPress: () => { } },
                        { icon: "create-outline", title: t('settings.editInfo'), description: null, onPress: () => { router.push("/settings/edit-info") } },
                    ]} />
                    {saveAccountExceptCurrentAccount.length > 0 && (
                        <View className="flex-col rounded-2xl mx-4 p-4 bg-white dark:bg-background-dark gap-4">
                            <Text className="text-lg font-bold text-grey-800 dark:text-grey-100">{t('settings.savedAccounts')}</Text>
                            <View className="gap-4" style={{ paddingBottom: 8 }}>
                                {saveAccountExceptCurrentAccount.map((item) => (
                                    <React.Fragment key={item.username || item.email || ""}>
                                        {renderAccount({ item })}
                                    </React.Fragment>
                                ))}
                            </View>
                        </View>
                    )}

                    {SETTINGS_ITEMS.map((item, index) => (
                        <ListItem key={index} title={item.title} items={item.items} />
                    ))}
                </View>
                <Pressable
                    onPress={handleLogout}
                    className="flex-row items-center justify-center rounded-full h-14 mx-4 mt-4 border bg-red-50 dark:bg-transparent border-red-200 dark:border-red-800 "
                >
                    <Icon name="log-out-outline" size={24} color={Colors.red["600"]} />
                    <Text className="text-lg font-medium ml-2" style={{ color: Colors.red["600"] }}>{t('common.logout')}</Text>
                </Pressable>
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
        <View className="flex-col gap-2">
            <View className="flex-col rounded-3xl mx-4 p-4 bg-white dark:bg-background-dark gap-4">
                {title && <Text className="text-lg font-bold text-grey-800 dark:text-grey-100">{title}</Text>}
                {items.map((item, index) => (
                    <Pressable
                        key={index}
                        onPress={item.onPress}
                        className="flex-row items-center justify-between"
                    >
                        {item.icon && <View className="bg-primary-50 dark:bg-primary-900 p-2 rounded-full w-12 h-12 items-center justify-center mr-4">
                            <Icon name={item.icon} size={24} color={Colors.primary["500"]} />
                        </View>}
                        <View className="flex-1">
                            {item.title && <Text className="text-lg font-medium text-grey-800 dark:text-grey-100">{item.title}</Text>}
                            {item.description && <Text className="text-sm text-grey-500 dark:text-grey-400">{item.description}</Text>}
                        </View>

                    </Pressable>
                ))}
            </View>
        </View>
    );
}
