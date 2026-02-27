import {View, Text, StyleSheet, Pressable, Platform, TextInput} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import {SafeAreaView} from "react-native-safe-area-context";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "expo-router";
import Input from "@/library/Input";
import Button from "@/library/Button";
import Divide from "@/library/Divide";
import Ionicons from "@expo/vector-icons/Ionicons";
import {regexPassword, regexUsername} from "@/constants/regex";
import {Image} from "expo-image";
import {useMutation} from "@tanstack/react-query";
import {AuthResponse, LoginRequest} from "@/constants/type";
import {post} from "@/services/axios";
import {AUTH} from "@/constants/api";
import * as Device from "expo-device";
import * as Application from "expo-application";
import {useAuthStore} from "@/store/auth-store";
import {LinearGradient} from "expo-linear-gradient";
import {Colors} from "@/constants/theme";
import {useRef} from "react";
import {useToastStore} from "@/store/toast-store";
import {useSavedAccountStore} from "@/store/saved-account-store";
import {GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes} from '@react-native-google-signin/google-signin';
import {LoginWithGoogleRequest} from "../../../constants/type";
import {getDeviceId} from "@/utils/fn-common";
import {useLoadingStore} from "@/store/loading-store";
import {useAccountStore} from "@/store/account-store";
const loginSchema = z.object({
    username: z.string().regex(regexUsername, "Username must be 6-30 characters"),
    password: z.string().regex(regexPassword, "Password must be 6-30 characters, contain at least one uppercase letter, one lowercase letter, and one number"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function Main() {
    const router = useRouter();
    const {showToast} = useToastStore();
    const usernameRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const {setTokens} = useAuthStore();
    const {saveAccount, isSavedAccount} = useSavedAccountStore();
    const {showLoading, hideLoading} = useLoadingStore();
    const {setAccount} = useAccountStore();

    const {control, handleSubmit, formState: {errors}} = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const {isPending, mutate} = useMutation({
        mutationFn: async (data: LoginRequest) => {
            const res = await post<BaseResponse<AuthResponse>>(`${AUTH}/login`, data);
            return res.data;
        },
        onMutate: () => {
            showLoading();
        },
        onSuccess: (result, data) => {
            setTokens(result.data.accessToken, result.data.refreshToken);
            saveAccount({
                username: data.username,
                displayName: result.data.displayName,
                avatarUrl: result.data.avatarUrl,
            });
            setAccount({
                username: data.username,
                email: null,
                displayName: result.data.displayName,
                avatarUrl: result.data.avatarUrl,
            });
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

    const {mutate: googleMutate} = useMutation({
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
                }, {
                    onSuccess: async (result) => {
                        setTokens(result.data.accessToken, result.data.refreshToken);
                        setAccount({
                            username: null,
                            email: response.data.user.email,
                            displayName: result.data.displayName,
                            avatarUrl: result.data.avatarUrl,
                        });
                        hideLoading();
                        await GoogleSignin.signOut();
                        router.replace("/(app)");
                    },
                })
            } else {
                showToast({
                    message: "Google sign-in failed",
                    type: "error",
                })
            }
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.IN_PROGRESS:
                        showToast({
                            message: "Google sign-in in progress",
                            type: "error",
                        })
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        showToast({
                            message: "Google Play Services not available",
                            type: "error",
                        })
                        break;
                    default:
                        showToast({
                            message: "Google sign-in failed",
                            type: "error",
                        })
                        break;
                }
            } else {
                showToast({
                    message: "Google sign-in failed",
                    type: "error",
                })
            }
        }
    }


    return (
        <>
            <LinearGradient
                colors={[Colors.primary[400], "#FFFFFF"]}
                start={{x: 0, y: 0}}
                end={{x: 0.5, y: 0.5}}
                className="absolute w-full h-full"
            />
            <SafeAreaView className={"flex-1"}>
                <View style={styles.card} className="flex-1 mx-6 mt-16 mb-6 border border-white rounded-2xl bg-white">
                    <KeyboardAwareScrollView
                        className={"flex-1"}
                        contentContainerClassName={"flex-grow px-4 pt-10"}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View className={"items-center mb-8"}>
                            <View
                                style={styles.ball}
                                className={"bg-primary-50 h-24 w-24 rounded-full border border-primary-100 items-center justify-center mb-5"}
                            >
                                <Ionicons name="chatbubbles" size={40} color="#1FBAC3"/>
                            </View>
                            <Text className={"text-3xl font-bold text-primary-500"}>Welcome back</Text>
                            <Text className={"text-base text-grey-500 mt-2"}>Login to your Linxtalk account</Text>
                        </View>

                        {/* Form */}
                        <View className={"flex flex-col gap-7"}>
                            <Controller
                                control={control}
                                name="username"
                                render={({field: {onChange, onBlur, value}}) => (
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
                                render={({field: {onChange, onBlur, value}}) => (
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
                        </View>

                        {/* Forgot password */}
                        <Pressable className={"self-end mt-3 mb-6"}>
                            <Text className={"text-sm font-medium text-primary-500"}>Forgot password?</Text>
                        </Pressable>

                        {/* Login button */}
                        <Button
                            title={"Login"}
                            variant={"primary"}
                            onPress={handleSubmit(onSubmit)}
                            rightIcon="log-in-outline"
                            loading={isPending}
                        />

                        {/* Divider */}
                        <View className={"flex flex-row gap-4 my-6 items-center"}>
                            <Divide className={"flex-1"}/>
                            <Text className={"text-sm text-grey-400"}>Or continue with</Text>
                            <Divide className={"flex-1"}/>
                        </View>

                        <View className="flex flex-col gap-4">
                            {/* Google login */}
                            <Pressable
                                className={"flex flex-row items-center justify-center gap-3 rounded-xl py-4 border border-grey-200 bg-white"}
                                style={styles.googleBtn}
                                onPress={handleGoogleLogin}
                            >
                                <Image source={require("@/assets/images/google.png")} style={{width: 20, height: 20}}/>
                                <Text className={"text-base font-semibold text-grey-700"}>Login with Google</Text>
                            </Pressable>
                            {isSavedAccount && <View className="pb-6 pt-2">
                                <Button
                                    title="Login with another account"
                                    variant="outline"
                                    leftIcon="log-in-outline"
                                    onPress={() => router.push("/(auth)/save-account")}
                                />
                            </View>}
                        </View>
                        {/* Spacer */}
                        <View className={"flex-1"}/>

                        {/* Index link */}
                        <View className={"flex flex-row items-center justify-center mt-8 mb-6"}>
                            <Text className={"text-sm text-grey-500"}>Don&apos;t have an account? </Text>
                            <Pressable onPress={() => router.push("/register")}>
                                <Text
                                    className={"text-sm font-semibold text-primary-500 underline underline-offset-1"}>Register</Text>
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
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    ball: {
        shadowColor: '#1FBAC3',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    googleBtn: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
});

