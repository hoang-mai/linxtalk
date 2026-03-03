import { View, Text, StyleSheet, Pressable, FlatList, Platform, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSavedAccountStore } from "@/store/saved-account-store";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "@/library/Button";
import Input from "@/library/Input";
import { AuthResponse, LoginRequest, LoginWithGoogleRequest, SavedAccount, SwitchAccountRequest } from "@/constants/type";
import { useRef, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useLoadingStore } from "@/store/loading-store";
import { useMutation } from "@tanstack/react-query";
import { post } from "@/services/axios";
import { AUTH } from "@/constants/api";
import * as Device from "expo-device";
import * as Application from "expo-application";
import { useToastStore } from "@/store/toast-store";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { regexPassword } from "@/constants/regex";
import { getDeviceId } from "@/utils/fn-common";
import { useAccountStore } from "@/store/account-store";
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";

export default function Main() {
    const router = useRouter();
    const { t } = useTranslation();
    const { savedAccounts, removeAccount, saveAccount } = useSavedAccountStore();
    const { setAccount } = useAccountStore();
    const { setTokens } = useAuthStore();
    const { showToast } = useToastStore();
    const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(null);
    const passwordRef = useRef<TextInput>(null);
    const { showLoading, hideLoading } = useLoadingStore();

    const passwordSchema = z.object({
        password: z.string().regex(regexPassword, t('validation.passwordInvalid')),
    });

    type PasswordSchema = z.infer<typeof passwordSchema>;

    const { control, handleSubmit, formState: { errors }, reset } = useForm<PasswordSchema>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: '',
        },
    });

    const { isPending, mutate } = useMutation({
        mutationFn: async (data: LoginRequest) => {
            const res = await post<BaseResponse<AuthResponse>>(`${AUTH}/login`, data);
            return res.data;
        },
        onMutate: () => {
            showLoading();
        },
        onSuccess: (result) => {
            hideLoading();
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
            router.replace("/(app)");
        },
        onError: (error) => {
            hideLoading();
            showToast({
                message: error.message,
                type: "error",
            });
        },
    });

    const { mutate: mutateSwitchAccount } = useMutation({
        mutationFn: async (data: SwitchAccountRequest) => {
            const res = await post<BaseResponse<AuthResponse>>(`${AUTH}/switch-account`, data);
            return res.data;
        },
        onMutate: () => {
            showLoading();
        },
        onSuccess: (result) => {
            setTokens(result.data.accessToken, result.data.refreshToken);
            setAccount({
                username: result.data.username,
                email: result.data.email,
                displayName: result.data.displayName,
                avatarUrl: result.data.avatarUrl,
            });
            router.replace("/(app)");
        },

        onSettled: () => {
            hideLoading();
        },
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
            setTokens(result.data.accessToken, result.data.refreshToken);
            setAccount({
                username: result.data.username,
                email: result.data.email,
                displayName: result.data.displayName,
                avatarUrl: result.data.avatarUrl,
            });
            router.replace("/(app)");
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

    const handleSelectAccount = async (account: SavedAccount) => {
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
                    setSelectedAccount(account);
                }
            },
        });
    };

    const handleBack = () => {
        setSelectedAccount(null);
        reset();
    };

    const handleLoginOther = () => {
        router.push("/(auth)/login");
    };

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

    const onSubmit = async (data: PasswordSchema) => {
        if (!selectedAccount) return;

        const deviceId = await getDeviceId();

        mutate({
            username: selectedAccount!.username!,
            password: data.password.trim(),
            deviceId,
            platform: Platform.OS,
            deviceName: Device.deviceName || "unknown",
            deviceModel: Device.modelName || "unknown",
            osVersion: Device.osVersion || "unknown",
            appVersion: Application.nativeApplicationVersion || "unknown",
        });
    };

    const renderAccount = ({ item }: { item: SavedAccount }) => (
        <Pressable
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
            }}
            className="flex-row items-center bg-white rounded-2xl px-4 py-4 mb-3 border border-grey-100"
            onPress={() => handleSelectAccount(item)}
        >
            {/* Avatar */}
            <View
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                }}
                className="bg-primary-50 h-14 w-14 rounded-full border border-primary-100 items-center justify-center"
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
                    {item.username ? `@${item.username}` : item.email}
                </Text>
            </View>

            {/* Remove button */}
            <Pressable
                className="p-2"
                onPress={() => removeAccount(item.username, item.email)}
                hitSlop={8}
            >
                <Ionicons name="close-circle-outline" size={24} color={Colors.grey["400"]} />
            </Pressable>
        </Pressable>
    );

    return (
        <>
            <LinearGradient
                colors={[Colors.primary[400], "#FFFFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                className="absolute w-full h-full"
            />
            <SafeAreaView className="flex-1">
                <View style={styles.card} className="flex-1 mx-6 mt-16 mb-6 border border-white rounded-2xl bg-white">

                    {/* Header */}
                    <View className="items-center pt-10 pb-6 px-4">
                        <View
                            style={styles.ball}
                            className="bg-primary-50 h-24 w-24 rounded-full border border-primary-100 items-center justify-center mb-5"
                        >
                            <Ionicons name="people" size={40} color="#1FBAC3" />
                        </View>
                        <Text className="text-2xl font-bold text-primary-500">
                            {selectedAccount ? t('saveAccount.welcomeBack') : t('saveAccount.selectAccount')}
                        </Text>
                        <Text className="text-base text-grey-500 mt-2">
                            {selectedAccount
                                ? t('saveAccount.enterPasswordToContinue')
                                : t('saveAccount.loginQuickly')}
                        </Text>
                    </View>

                    {selectedAccount ? (
                        <KeyboardAwareScrollView
                            className="flex-1"
                            contentContainerClassName="flex-grow px-4"
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Selected account info */}
                            <View className="items-center mb-6">
                                <View
                                    style={{
                                        shadowColor: '#1FBAC3',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.15,
                                        shadowRadius: 4,
                                        elevation: 3,
                                    }}
                                    className="bg-primary-50 h-14 w-14 rounded-full border border-primary-100 items-center justify-center"
                                >
                                    <Text className="text-2xl font-bold text-primary-500">
                                        {selectedAccount.displayName.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <Text className="text-lg font-semibold text-grey-900">
                                    {selectedAccount.displayName}
                                </Text>
                                <Text className="text-sm text-grey-500 mt-0.5">
                                    @{selectedAccount.username}
                                </Text>
                            </View>

                            {/* Password input */}
                            <Controller
                                control={control}
                                name="password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label={t('common.password')}
                                        placeholder={t('login.passwordPlaceholder')}
                                        icon="lock-closed-outline"
                                        required
                                        secureTextEntry
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.password?.message}
                                        ref={passwordRef}
                                        returnKeyType="done"
                                        isBlurAndSubmit
                                        onSubmitEditing={handleSubmit(onSubmit)}
                                        loading={isPending}
                                    />
                                )}
                            />

                            {/* Login button */}
                            <View style={{ marginTop: 12 }}>
                                <Button
                                    title={t('common.login')}
                                    variant="primary"
                                    rightIcon="log-in-outline"
                                    onPress={handleSubmit(onSubmit)}
                                    loading={isPending}
                                />
                            </View>

                            {/* Back to account list */}
                            <Pressable className="self-center" onPress={handleBack} style={{ marginTop: 12 }}>
                                <Text className="text-sm font-medium text-primary-500">
                                    {t('saveAccount.chooseAnotherAccount')}
                                </Text>
                            </Pressable>
                        </KeyboardAwareScrollView>
                    ) : (
                        <>
                            {/* Account list */}
                            <FlatList
                                data={savedAccounts}
                                keyExtractor={(item) => item.username || item.email || ""}
                                renderItem={renderAccount}
                                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <View className="items-center py-8">
                                        <Ionicons name="person-outline" size={48} color={Colors.grey["300"]} />
                                        <Text className="text-grey-400 mt-3 text-base">
                                            {t('saveAccount.noSavedAccounts')}
                                        </Text>
                                    </View>
                                }
                            />
                        </>
                    )}

                    {/* Bottom actions */}
                    <View className="px-4 pb-6 pt-2">
                        <Button
                            title={t('saveAccount.loginWithNewAccount')}
                            variant="outline"
                            leftIcon="log-in-outline"
                            onPress={handleLoginOther}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    ball: {
        shadowColor: '#1FBAC3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
});
