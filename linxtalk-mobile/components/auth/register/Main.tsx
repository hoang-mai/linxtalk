import {View, Text, StyleSheet, Pressable} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import {SafeAreaView} from "react-native-safe-area-context";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "expo-router";
import {useRef} from "react";
import {TextInput} from "react-native";
import Input from "@/library/Input";
import Button from "@/library/Button";
import Ionicons from "@expo/vector-icons/Ionicons";
import {regexPassword, regexUsername} from "@/constants/regex";
import {useMutation} from "@tanstack/react-query";
import {RegisterRequest} from "@/constants/type";
import {post} from "@/services/axios";
import {AUTH} from "@/constants/api";
import {LinearGradient} from "expo-linear-gradient";
import {Colors} from "@/constants/theme";
import {useToastStore} from "@/store/toast-store";
import {useLoadingStore} from "@/store/loading-store";

const registerSchema = z.object({
    username: z.string().regex(regexUsername, "Username must be 6-30 characters"),
    displayName: z.string().min(1, "Display name is required"),
    password: z.string().regex(regexPassword, "Password must be 6-30 characters, contain at least one uppercase letter, one lowercase letter, and one number"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterSchema = z.infer<typeof registerSchema>;

export default function Main() {
    const router = useRouter();
    const usernameRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);
    const {showLoading, hideLoading} = useLoadingStore();
    const {showToast} = useToastStore();
    const {control, handleSubmit, formState: {errors}} = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            displayName: '',
            password: '',
            confirmPassword: '',
        },
    });

    const {isPending, mutate} = useMutation({
        mutationFn: async (data: RegisterRequest) => {
            const res = await post<BaseResponse<any>>(`${AUTH}/register`, data);
            return res.data;
        },
        onMutate: () => {   
            showLoading();
        },
        onSuccess: (data) => {
            hideLoading();
            showToast({
                message: data.message,
                type: "success"
            });
            router.push("/login");
        },
        onError: (error) => {
            hideLoading();
            showToast({
                message: error.message,
                type: "error",
            });
        }
    });
    const onSubmit = async (data: RegisterSchema) => {
        mutate({
            username: data.username.trim(),
            displayName: data.displayName.trim(),
            password: data.password.trim(),
        });
    };

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
                                <Ionicons name="person-add" size={40} color="#1FBAC3"/>
                            </View>
                            <Text className={"text-3xl font-bold text-primary-500"}>Create Account</Text>
                            <Text className={"text-base text-grey-500 mt-2"}>Join the Linxtalk community</Text>
                        </View>

                        {/* Form */}
                        <View className={"flex flex-col gap-7"}>
                            <Controller
                                control={control}
                                name="displayName"
                                render={({field: {onChange, onBlur, value}}) => (
                                    <Input
                                        label="Display Name"
                                        placeholder="Your full name"
                                        icon="person-circle-outline"
                                        required
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.displayName?.message}
                                        returnKeyType="next"
                                        onSubmitEditing={() => usernameRef.current?.focus()}
                                        loading={isPending}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="username"
                                render={({field: {onChange, onBlur, value}}) => (
                                    <Input
                                        ref={usernameRef}
                                        label="Username"
                                        placeholder="Choose a username"
                                        icon="person-outline"
                                        required
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.username?.message}
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
                                        ref={passwordRef}
                                        label="Password"
                                        placeholder="Create a password"
                                        icon="lock-closed-outline"
                                        required
                                        secureTextEntry
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.password?.message}
                                        returnKeyType="next"
                                        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                        loading={isPending}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="confirmPassword"
                                render={({field: {onChange, onBlur, value}}) => (
                                    <Input
                                        ref={confirmPasswordRef}
                                        label="Confirm Password"
                                        placeholder="Repeat your password"
                                        icon="checkmark-circle-outline"
                                        required
                                        secureTextEntry
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.confirmPassword?.message}
                                        returnKeyType="done"
                                        isBlurAndSubmit
                                        onSubmitEditing={handleSubmit(onSubmit)}
                                        loading={isPending}
                                    />
                                )}
                            />
                        </View>

                        {/* Register button */}
                        <View className="mt-8">
                            <Button
                                title={"Register"}
                                variant={"primary"}
                                onPress={handleSubmit(onSubmit)}
                                rightIcon="person-add-outline"
                                loading={isPending}
                            />
                        </View>

                        {/* Spacer */}
                        <View className={"flex-1"}/>

                        {/* Index link */}
                        <View className={"flex flex-row items-center justify-center mt-8 mb-6"}>
                            <Text className={"text-sm text-grey-500"}>Already have an account? </Text>
                            <Pressable onPress={() => router.replace("/login")}>
                                <Text
                                    className={"text-sm font-semibold text-primary-500 underline underline-offset-1"}>Login</Text>
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
