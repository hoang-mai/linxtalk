import { View, Text, StyleSheet, Pressable, Platform, TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import Input from "@/library/Input";
import Button from "@/library/Button";
import Divide from "@/library/Divide";
import Ionicons from "@expo/vector-icons/Ionicons";
import { regexPassword, regexUsername } from "@/constants/regex";
import { Image } from "expo-image";
import { useMutation } from "@tanstack/react-query";
import { AuthResponse, LoginRequest } from "@/constants/type";
import { post } from "@/services/axios";
import { AUTH } from "@/constants/api";
import * as Device from "expo-device";
import * as Application from "expo-application";
import { useAuthStore } from "@/store/auth-store";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/theme";
import { useRef } from "react";
import { useToastStore } from "@/store/toast-store";
import { useSavedAccountStore } from "@/store/saved-account-store";
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { LoginWithGoogleRequest } from "../../../constants/type";
import { getDeviceId } from "@/utils/fn-common";
import { useLoadingStore } from "@/store/loading-store";
import { useAccountStore } from "@/store/account-store";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";
import { queryClient, asyncStoragePersister } from "@/components/providers/query-client";

export default function Main() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const { t } = useTranslation();
    const { showToast } = useToastStore();
    const usernameRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const { setTokens } = useAuthStore();
    const { saveAccount, isSavedAccount } = useSavedAccountStore();
    const { showLoading, hideLoading } = useLoadingStore();
    const { setAccount } = useAccountStore();

    const loginSchema = z.object({
        username: z.string().regex(regexUsername, t('validation.usernameInvalid')),
        password: z.string().regex(regexPassword, t('validation.passwordInvalid')),
    });

    type LoginSchema = z.infer<typeof loginSchema>;

    const { control, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
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
        onSuccess: async (result) => {
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
            await queryClient.resetQueries();
            await asyncStoragePersister.removeClient();
            hideLoading();
            router.replace("/(app)");
        },
        onError: (error) => {
            hideLoading();
            showToast({
                message: error.message,
                type: "error",
            });
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
        onError: (error) => {
            hideLoading();
            showToast({
                message: error.message,
                type: "error",
            });
        },
        onSuccess: async (result) => {
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
            await queryClient.resetQueries();
            await asyncStoragePersister.removeClient();
            router.replace("/(app)");
        },
        onSettled: async () => {
            hideLoading();
        }
    });

    const onSubmit = async (data: LoginSchema) => {
        const deviceId = await getDeviceId();

        mutate({
            username: data.username.trim(),
            password: data.password.trim(),
            deviceId: deviceId,
            platform: Platform.OS,
            deviceName: Device.deviceName || "unknown",
            deviceModel: Device.modelName || "unknown",
            osVersion: Device.osVersion || "unknown",
            appVersion: Application.nativeApplicationVersion || "unknown",
        })
    };

    const handleGoogleLogin = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            if (isSuccessResponse(response) && response.data.idToken) {
                const idToken = response.data.idToken;
                const deviceId = await getDeviceId();

                googleMutate({
                    idTokenString: idToken,
                    deviceId: deviceId,
                    platform: Platform.OS,
                    deviceName: Device.deviceName || "unknown",
                    deviceModel: Device.modelName || "unknown",
                    osVersion: Device.osVersion || "unknown",
                    appVersion: Application.nativeApplicationVersion || "unknown",
                })
            } else {
                showToast({
                    message: t('errors.googleSignInFailed'),
                    type: "error",
                })
            }
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.IN_PROGRESS:
                        showToast({
                            message: t('errors.googleSignInInProgress'),
                            type: "error",
                        })
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        showToast({
                            message: t('errors.googlePlayNotAvailable'),
                            type: "error",
                        })
                        break;
                    default:
                        showToast({
                            message: t('errors.googleSignInFailed'),
                            type: "error",
                        })
                        break;
                }
            } else {
                showToast({
                    message: t('errors.googleSignInFailed'),
                    type: "error",
                })
            }
        }
        finally {
            await GoogleSignin.signOut();
        }
    }


    return (
        <>
            <LinearGradient
                colors={colorScheme === "dark"
                    ? [Colors.primary[800], "#122020"]
                    : [Colors.primary[400], "#FFFFFF"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                className="absolute w-full h-full"
            />
            <SafeAreaView className={"flex-1"}>
                <View style={styles.card} className="flex-1 mx-6 mt-16 mb-6 border border-white dark:border-background-dark rounded-2xl bg-white dark:bg-background-dark">
                    <KeyboardAwareScrollView
                        className={"flex-1"}
                        contentContainerClassName={"flex-grow px-8 pt-10"}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View className={"items-center mb-8"}>
                            <View
                                style={styles.ball}
                                className={"bg-primary-50 dark:bg-primary-900 h-24 w-24 rounded-full border border-primary-100 dark:border-primary-800 items-center justify-center mb-5"}
                            >
                                <Ionicons name="chatbubbles" size={40} color="#1FBAC3" />
                            </View>
                            <Text className={"text-3xl font-bold text-primary-500"}>{t('login.welcomeBack')}</Text>
                            <Text numberOfLines={1} className={"text-base text-grey-500 dark:text-grey-400 mt-2"}>{t('login.subtitle')}</Text>
                        </View>

                        {/* Form */}
                        <View className={"flex flex-col gap-7"}>
                            <Controller
                                control={control}
                                name="username"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label={t('common.username')}
                                        placeholder={t('login.usernamePlaceholder')}
                                        icon="person-outline"
                                        required
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.username?.message}
                                        ref={usernameRef}
                                        returnKeyType="next"
                                        onSubmitEditing={() => passwordRef.current?.focus()}
                                        loading={isPending}
                                    />
                                )}
                            />
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
                        </View>

                        {/* Forgot password */}
                        <Pressable className={"self-end mt-3 mb-6 mr-2"}>
                            <Text className={"text-sm font-medium text-primary-500"}>{t('login.forgotPassword')}</Text>
                        </Pressable>

                        {/* Login button */}
                        <Button
                            title={t('common.login')}
                            variant={"primary"}
                            onPress={handleSubmit(onSubmit)}
                            rightIcon="log-in-outline"
                            loading={isPending}
                            style={styles.loginBtn}
                        />

                        {/* Divider */}
                        <View className={"flex flex-row gap-4 my-6 items-center"}>
                            <Divide className={"flex-1"} />
                            <Text className={"text-sm text-grey-400"}>{t('common.orContinueWith')}</Text>
                            <Divide className={"flex-1"} />
                        </View>

                        <View className="flex flex-col gap-4">
                            {/* Google login */}
                            <Pressable
                                className={"flex flex-row items-center justify-center gap-3 rounded-full py-4 border border-grey-200 bg-white dark:bg-background-dark"}
                                style={styles.googleBtn}
                                onPress={handleGoogleLogin}
                            >
                                <Image source={require("@/assets/images/google.png")} style={{ width: 20, height: 20 }} />
                                <Text className={"text-base font-semibold text-grey-800 dark:text-grey-100"}>{t('common.loginWithGoogle')}</Text>
                            </Pressable>
                            {isSavedAccount && <View className="pb-6 pt-2">
                                <Button
                                    title={t('login.loginWithAnotherAccount')}
                                    variant="outline"
                                    leftIcon="log-in-outline"
                                    onPress={() => router.push("/(auth)/save-account")}
                                />
                            </View>}
                        </View>
                        {/* Spacer */}
                        <View className={"flex-1"} />

                        {/* Index link */}
                        <View className={"flex flex-row items-center justify-center mt-8 mb-6"}>
                            <Text className={"text-sm text-grey-500"}>{t('login.noAccount')} </Text>
                            <Pressable onPress={() => router.push("/register")}>
                                <Text numberOfLines={1} className={"text-sm font-semibold text-primary-500 underline underline-offset-1"}>{t('login.registerLink')}</Text>
                            </Pressable>
                        </View>
                    </KeyboardAwareScrollView>
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
    googleBtn: {
        shadowColor: '#666666ff',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    loginBtn: {
        shadowColor: Colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
});
