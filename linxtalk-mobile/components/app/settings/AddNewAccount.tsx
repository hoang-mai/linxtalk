import { View, Text, StyleSheet, Pressable, Platform, TextInput } from "react-native";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/library/Input";
import Button from "@/library/Button";
import { Image } from "expo-image";
import { regexPassword, regexUsername } from "@/constants/regex";
import { useMutation } from "@tanstack/react-query";
import { AuthResponse, LoginRequest, LoginWithGoogleRequest } from "@/constants/type";
import { post } from "@/services/axios";
import { AUTH } from "@/constants/api";
import * as Device from "expo-device";
import * as Application from "expo-application";
import { useAuthStore } from "@/store/auth-store";
import { useRef } from "react";
import { useToastStore } from "@/store/toast-store";
import { useSavedAccountStore } from "@/store/saved-account-store";
import { getDeviceId } from "@/utils/fn-common";
import { useLoadingStore } from "@/store/loading-store";
import { useModalStore } from "@/store/modal-store";
import Divide from "@/library/Divide";
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";
import { useTranslation } from "react-i18next";

export default function AddNewAccount() {
    const { t } = useTranslation();
    const { showToast } = useToastStore();
    const usernameRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const { saveAccount } = useSavedAccountStore();
    const { showLoading, hideLoading } = useLoadingStore();
    const { hideModal } = useModalStore();

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
            const res = await post<BaseResponse<AuthResponse>>(`${AUTH}/add-account`, data);
            return res.data;
        },
        onMutate: () => {
            showLoading();
        },
        onSuccess: (result) => {
            saveAccount({
                username: result.data.username,
                email: result.data.email,
                displayName: result.data.displayName,
                avatarUrl: result.data.avatarUrl,
            });
            showToast({
                message: t('addAccount.addAccountSuccess'),
                type: "success",
            });
            hideModal();
        },
        onError: (error) => {
            showToast({
                message: error.message,
                type: "error",
            });
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
            saveAccount({
                username: result.data.username,
                email: result.data.email,
                displayName: result.data.displayName,
                avatarUrl: result.data.avatarUrl,
            });
            hideModal();
            showToast({
                message: t('addAccount.addAccountSuccess'),
                type: "success",
            });
        },
        onError: (error) => {
            showToast({
                message: error.message,
                type: "error",
            });
        },
        onSettled: async () => {
            hideLoading();
        }
    });
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

    return (
        <>

            {/* Form */}
            <View className={"flex flex-col gap-6"}>
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
                <Button
                    title={t('editInfo.addAccount')}
                    variant={"soft"}
                    onPress={handleSubmit(onSubmit)}
                    leftIcon="add-outline"
                    loading={isPending}
                />
            </View>

            <View className={"flex flex-row gap-4 my-6 items-center"}>
                <Divide className={"flex-1"} />
                <Text className={"text-sm text-grey-400"}>{t('common.orContinueWith')}</Text>
                <Divide className={"flex-1"} />
            </View>

            <View className="flex flex-col gap-4">
                {/* Google login */}
                <Pressable
                    className={"flex flex-row items-center justify-center gap-3 rounded-full py-4 border border-grey-200 bg-white"}
                    style={styles.googleBtn}
                    onPress={handleGoogleLogin}
                >
                    <Image source={require("@/assets/images/google.png")} style={{ width: 20, height: 20 }} />
                    <Text className={"text-base font-semibold text-grey-700"}>{t('common.addWithGoogle')}</Text>
                </Pressable>
            </View>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
});