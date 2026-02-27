import { View, Text, StyleSheet, Pressable, Platform, TextInput } from "react-native";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/library/Input";
import Button from "@/library/Button";
import { Image } from "expo-image";
import { regexPassword, regexUsername } from "@/constants/regex";
import { useMutation } from "@tanstack/react-query";
import { AuthResponse, LoginRequest } from "@/constants/type";
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

const loginSchema = z.object({
    username: z.string().regex(regexUsername, "Username must be 6-30 characters"),
    password: z.string().regex(regexPassword, "Password must be 6-30 characters, contain at least one uppercase letter, one lowercase letter, and one number"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function AddNewAccount() {
    const { showToast } = useToastStore();
    const usernameRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const { saveAccount } = useSavedAccountStore();
    const { showLoading, hideLoading } = useLoadingStore();
    const { hideModal } = useModalStore();

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
        onSuccess: (result, data) => {
            saveAccount({
                username: data.username,
                displayName: result.data.displayName,
                avatarUrl: result.data.avatarUrl,
            });
            showToast({
                message: result.message,
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
                            label="Username"
                            placeholder="Enter your username"
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
                            label="Password"
                            placeholder="Enter your password"
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
                    title={"Add Account"}
                    variant={"soft"}
                    onPress={handleSubmit(onSubmit)}
                    leftIcon="add-outline"
                    loading={isPending}
                />
            </View>

            <View className={"flex flex-row gap-4 my-6 items-center"}>
                <Divide className={"flex-1"} />
                <Text className={"text-sm text-grey-400"}>Or continue with</Text>
                <Divide className={"flex-1"} />
            </View>

            <View className="flex flex-col gap-4">
                {/* Google login */}
                <Pressable
                    className={"flex flex-row items-center justify-center gap-3 rounded-xl py-4 border border-grey-200 bg-white"}
                    style={styles.googleBtn}
                // onPress={handleGoogleLogin}
                >
                    <Image source={require("@/assets/images/google.png")} style={{ width: 20, height: 20 }} />
                    <Text className={"text-base font-semibold text-grey-700"}>Add with Google</Text>
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