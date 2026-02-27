import { View, Text, Platform, TextInput } from "react-native";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/library/Input";
import Button from "@/library/Button";
import { regexPassword } from "@/constants/regex";
import { useMutation } from "@tanstack/react-query";
import { AuthResponse, LoginRequest, SavedAccount } from "@/constants/type";
import { post } from "@/services/axios";
import { AUTH } from "@/constants/api";
import * as Device from "expo-device";
import * as Application from "expo-application";
import { useAuthStore } from "@/store/auth-store";
import { useRef } from "react";
import { useToastStore } from "@/store/toast-store";
import { useAccountStore } from "@/store/account-store";
import { getDeviceId } from "@/utils/fn-common";
import { useLoadingStore } from "@/store/loading-store";
import { useModalStore } from "@/store/modal-store";
import { useRouter } from "expo-router";

const passwordSchema = z.object({
    password: z.string().regex(regexPassword, "Password must be 6-30 characters, contain at least one uppercase letter, one lowercase letter, and one number"),
});

type PasswordSchema = z.infer<typeof passwordSchema>;

interface ReloginAccountProps {
    account: SavedAccount;
}

export default function ReloginAccount({ account }: ReloginAccountProps) {
    const router = useRouter();
    const { showToast } = useToastStore();
    const { setTokens } = useAuthStore();
    const { setAccount } = useAccountStore();
    const passwordRef = useRef<TextInput>(null);
    const { showLoading, hideLoading } = useLoadingStore();
    const { hideModal } = useModalStore();

    const { control, handleSubmit, formState: { errors } } = useForm<PasswordSchema>({
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
        onSuccess: (result, data) => {
            setTokens(result.data.accessToken, result.data.refreshToken);
            setAccount({
                username: data.username,
                email: null,
                displayName: result.data.displayName,
                avatarUrl: result.data.avatarUrl,
            });
            hideModal();
            router.replace("/");
        },
        onError: (error) => {
            showToast({
                message: error.message,
                type: "error",
            });
        },
        onSettled: () => {
            hideLoading();
        },
    });

    const onSubmit = async (data: PasswordSchema) => {
        const deviceId = await getDeviceId();

        mutate({
            username: account.username,
            password: data.password.trim(),
            deviceId,
            platform: Platform.OS,
            deviceName: Device.deviceName || "unknown",
            deviceModel: Device.modelName || "unknown",
            osVersion: Device.osVersion || "unknown",
            appVersion: Application.nativeApplicationVersion || "unknown",
        });
    };

    return (
        <>
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
                        {account.displayName.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text className="text-lg font-semibold text-grey-900">
                    {account.displayName}
                </Text>
                <Text className="text-sm text-grey-500 mt-0.5">
                    @{account.username}
                </Text>
            </View>

            {/* Password input */}
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

            {/* Login button */}
            <View style={{ marginTop: 12 }}>
                <Button
                    title="Login"
                    variant="primary"
                    rightIcon="log-in-outline"
                    onPress={handleSubmit(onSubmit)}
                    loading={isPending}
                />
            </View>
        </>
    );
}
