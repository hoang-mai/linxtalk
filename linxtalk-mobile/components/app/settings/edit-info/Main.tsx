import {FlatList, Platform, Pressable, Text, View} from "react-native";
import React, {useLayoutEffect, useState} from "react";
import Input from "@/library/Input";
import DateTimePicker from "@react-native-community/datetimepicker";
import {useAccountStore} from "@/store/account-store";
import {useNavigation, useRouter} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {regexPhoneNumber} from "@/constants/regex";
import {useSavedAccountStore} from "@/store/saved-account-store";
import {useModalStore} from "@/store/modal-store";
import {useLoadingStore} from "@/store/loading-store";
import {useToastStore} from "@/store/toast-store";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {get, post, put} from "@/services/axios";
import {AUTH, USER} from "@/constants/api";
import {
    AuthResponse,
    LinkEmailRequest,
    LoginWithGoogleRequest,
    ProfileResponse,
    SavedAccount,
    SwitchAccountRequest,
    UpdateProfileRequest
} from "@/constants/type";
import {useAuthStore} from "@/store/auth-store";
import {Colors} from "@/constants/theme";
import {getDeviceId} from "@/utils/fn-common";
import {GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes} from "@react-native-google-signin/google-signin";
import * as Device from "expo-device";
import * as Application from "expo-application";
import AddNewAccount from "../AddNewAccount";
import ReloginAccount from "../ReloginAccount";
import {MAX_ACCOUNT} from "@/constants/constant";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";

const editInfoSchema = z.object({
    phoneNumber: z.string().regex(regexPhoneNumber, "Invalid phone number").optional(),
    birthday: z.string().optional(),
    displayName: z.string().min(1, "Display name is required").max(50, "Display name must be at most 50 characters"),
    bio: z.string().max(100, "Bio must be at most 100 characters").optional(),
});

type EditInfoForm = z.infer<typeof editInfoSchema>;

export default function Main() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const {account, setAccount} = useAccountStore();
    const {setTokens} = useAuthStore();
    const navigation = useNavigation();
    const {savedAccounts, removeAccount, saveAccount} = useSavedAccountStore();
    const {showModal} = useModalStore();
    const {showLoading, hideLoading} = useLoadingStore();
    const {showToast} = useToastStore();
    const [showDatePicker, setShowDatePicker] = useState(false);

    const saveAccountExceptCurrentAccount = savedAccounts.filter((savedAccount) => {
        if (savedAccount.username && account.username) return savedAccount.username !== account.username;
        if (savedAccount.email && account.email) return savedAccount.email !== account.email;
        return true;
    });

    const {data} = useQuery({
        queryKey: ["profile"],
        placeholderData: (prevData) => prevData,
        queryFn: async () => {
            try {
                showLoading();
                const res = await get<BaseResponse<ProfileResponse>>(`${USER}/profile`);
                return res.data.data;
            } catch (error: any) {
                showToast({message: error.message, type: "error"});
                throw error;
            } finally {
                hideLoading();
            }
        },
    });

    const formValues = data ? {
        phoneNumber: data.phoneNumber ?? undefined,
        birthday: data.birthday ?? undefined,
        displayName: account.displayName,
        bio: data.bio ?? undefined,
    } : undefined;

    const {control, handleSubmit, formState: {errors, isDirty }} = useForm<EditInfoForm>({
        resolver: zodResolver(editInfoSchema),
        defaultValues: {
            phoneNumber: undefined,
            birthday: undefined,
            displayName: account.displayName,
            bio: undefined,
        },
        values: formValues,
    });


    const {mutate: mutateUpdateProfile} = useMutation({
        mutationFn: async (data: UpdateProfileRequest) => {
            const res = await put<BaseResponse<any>>(`${USER}/profile`, data);
            return res.data;
        },
        onMutate: () => {
            showLoading();
        },
        onSuccess: (result, variables) => {
            setAccount({
                ...account,
                displayName: variables.displayName,
            });
            showToast({
                message: result.message,
                type: "success",
            });
            queryClient.invalidateQueries({queryKey: ["profile"]});
            router.back();
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
    

    const {mutate: mutateRemoveAccount} = useMutation({
        mutationFn: async (data: SwitchAccountRequest) => {
            const res = await post<BaseResponse<any>>(`${AUTH}/remove-account`, data);
            return res.data;
        },
        onSettled: async (_, __, variables) => {
            removeAccount(variables.username, variables.email);
        }
    });

    const {mutate: mutateSwitchAccount} = useMutation({
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
            router.replace("/");
        },
        onSettled: () => {
            hideLoading();
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
        onSuccess: (result) => {
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
        onSettled: () => {
            hideLoading();
        },
    });

    const {mutate: linkEmailMutate} = useMutation({
        mutationFn: async (data: LinkEmailRequest) => {
            const res = await post<BaseResponse<any>>(`${AUTH}/link-email`, data);
            return res.data;
        },
        onMutate: () => {
            showLoading();
        },
        onSuccess: (_, variables) => {
            setAccount({
                ...account,
                email: variables.email,
            });
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

    const handleAddNewAccount = () => {
        showModal({
            title: "Add New Account",
            children: <AddNewAccount/>,
        });
    };

    const handleRemoveAccount = async (account: SavedAccount) => {
        const deviceId = await getDeviceId();
        mutateRemoveAccount({username: account.username, deviceId, email: account.email});
    };

    const handleSwitchAccount = async (account: SavedAccount) => {
        const deviceId = await getDeviceId();
        mutateSwitchAccount({username: account.username, deviceId, email: account.email}, {
            onError: (error) => {
                showToast({
                    message: error.message,
                    type: "error",
                });
                if (!account.username) {
                    handleGoogleRelogin(account);
                } else {
                    showModal({
                        title: "Re-login",
                        children: <ReloginAccount account={account}/>,
                    });
                }
            },
        });
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
                        message: `Please sign in with ${targetAccount.email}`,
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
                showToast({message: "Google sign-in failed", type: "error"});
            }
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.IN_PROGRESS:
                        showToast({message: "Google sign-in in progress", type: "error"});
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        showToast({message: "Google Play Services not available", type: "error"});
                        break;
                    default:
                        showToast({message: "Google sign-in failed", type: "error"});
                        break;
                }
            } else {
                showToast({message: "Google sign-in failed", type: "error"});
            }
        } finally {
            await GoogleSignin.signOut();
        }
    };

    const handleLinkEmail = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            if (isSuccessResponse(response) && response.data.idToken) {
                linkEmailMutate({
                    email: response.data.user.email,
                })
            } else {
                showToast({
                    message: "Link email failed",
                    type: "error",
                })
            }
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.IN_PROGRESS:
                        showToast({
                            message: "Link email in progress",
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
                            message: "Link email failed",
                            type: "error",
                        })
                        break;
                }
            } else {
                showToast({
                    message: "Link email failed",
                    type: "error",
                })
            }
        } finally {
            await GoogleSignin.signOut();
        }
    }

    const renderAccount = ({item}: { item: SavedAccount }) => (
        <Pressable className="flex-row items-center" onPress={() => handleSwitchAccount(item)}>
            <View
                style={{
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 1},
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
            <View className="flex-1 ml-4">
                <Text className="text-base font-semibold text-grey-900" numberOfLines={1}>
                    {item.displayName}
                </Text>
                <Text className="text-sm text-grey-500 mt-0.5" numberOfLines={1}>
                    {item.username ? `@${item.username}` : item.email}
                </Text>
            </View>
            <Pressable
                className="p-2"
                onPress={() => handleRemoveAccount(item)}
                hitSlop={8}
            >
                <Ionicons name="close-circle-outline" size={24} color={Colors.grey["400"]}/>
            </Pressable>
        </Pressable>
    );

    useLayoutEffect(() => {
        const onSubmit = (data: EditInfoForm) => {
            mutateUpdateProfile(data);
        };
        navigation.setOptions({
            headerRight: () => isDirty ? (
                <Pressable onPress={handleSubmit(onSubmit)}>
                    <Ionicons name="checkmark-outline" size={24} color="black"/>
                </Pressable>
            ) : null,
        });
    }, [navigation, handleSubmit, isDirty, mutateUpdateProfile]);


    return (
        <KeyboardAwareScrollView
            className="px-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 20}}
        >
            {/* Section: Your Info */}
            <Section title="Your info">
                <Controller
                    control={control}
                    name="phoneNumber"
                    render={({field: {onChange, onBlur, value}}) => (
                        <Input
                            label="Phone number"
                            placeholder="Enter your phone number"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="phone-pad"
                            icon="call-outline"
                            error={errors.phoneNumber?.message}
                            isBlurAndSubmit
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="birthday"
                    render={({field: {onChange, value}}) => {
                        const dateValue = value ? new Date(value) : undefined;
                        const formattedDate = dateValue
                            ? `${String(dateValue.getDate()).padStart(2, '0')}/${String(dateValue.getMonth() + 1).padStart(2, '0')}/${dateValue.getFullYear()}`
                            : "";

                        return (
                            <>
                                <Pressable onPress={() => setShowDatePicker(true)}>
                                    <View className="flex flex-col w-full gap-1 relative">
                                        <View
                                            className="flex flex-row gap-1 absolute -top-2.5 left-4 z-10 bg-white px-1 rounded-md">
                                            <Text className="text-sm font-medium"
                                                  style={{color: Colors.primary["400"]}}>Birthday</Text>
                                        </View>
                                        <View className="relative flex flex-row items-center bg-white">
                                            <View
                                                className="w-full rounded-full py-4 pl-14 pr-4 bg-white"
                                                style={{
                                                    borderWidth: 1.5,
                                                    borderRadius: 999,
                                                    borderColor: Colors.primary["400"]
                                                }}
                                            >
                                                <Text className="text-base"
                                                      style={{color: formattedDate ? Colors.grey["900"] : Colors.grey["600"]}}>
                                                    {formattedDate || "DD/MM/YYYY"}
                                                </Text>
                                            </View>
                                            <View className="absolute left-6 top-0 bottom-0 justify-center">
                                                <Ionicons name="calendar-outline" size={20} color={Colors.grey["500"]}/>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={dateValue || new Date()}
                                        mode="date"
                                        display={Platform.OS === "ios" ? "spinner" : "default"}
                                        maximumDate={new Date()}
                                        onChange={(_, selectedDate) => {
                                            setShowDatePicker(Platform.OS === "ios");
                                            if (selectedDate) {
                                                onChange(selectedDate.toISOString());
                                            }
                                        }}
                                    />
                                )}
                            </>
                        );
                    }}
                />
                {/* Link email */}
                <View className="flex flex-col w-full gap-1 relative">
                    <View className="flex flex-row gap-1 absolute -top-2.5 left-4 z-10 bg-white px-1 rounded-md">
                        <Text className="text-sm font-medium" style={{color: Colors.primary["400"]}}>Email</Text>
                    </View>
                    <View className="relative flex flex-row items-center bg-white">
                        <Pressable
                            className="w-full rounded-full py-4 pl-14 pr-4 bg-white"
                            style={{borderWidth: 1.5, borderRadius: 999, borderColor: Colors.primary["400"]}}
                            onPress={handleLinkEmail}
                            disabled={account.username === null || account.username === undefined}
                        >
                            <Text className="text-base"
                                  style={{color: account.email ? Colors.grey["900"] : Colors.grey["600"]}}>
                                {account.email || "Link your email"}
                            </Text>
                        </Pressable>
                        <View className="absolute left-6 top-0 bottom-0 justify-center">
                            <Ionicons name="mail-outline" size={20} color={Colors.grey["500"]}/>
                        </View>
                    </View>
                </View>
            </Section>

            {/* Section: Your Name */}
            <Section title="Your name">
                <Controller
                    control={control}
                    name="displayName"
                    render={({field: {onChange, onBlur, value}}) => (
                        <Input
                            label="Display name"
                            placeholder="Enter your display name"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            icon="person-outline"
                            error={errors.displayName?.message}
                            maxCharCount={50}
                            isBlurAndSubmit
                        />
                    )}
                />
            </Section>

            {/* Section: Your Bio */}
            <Section title="Bio">
                <Controller
                    control={control}
                    name="bio"
                    render={({field: {onChange, onBlur, value}}) => (
                        <Input
                            label="Bio"
                            placeholder="Tell us about yourself"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            icon="document-text-outline"
                            multiline
                            error={errors.bio?.message}
                            maxCharCount={100}
                            isBlurAndSubmit
                        />
                    )}
                />
            </Section>

            {/* Section: Saved Accounts */}
            <View className="mt-6">
                <View className="flex-col rounded-2xl p-4 bg-white gap-4">
                    <Text className="text-lg font-bold text-grey-700">Saved Accounts</Text>
                    <FlatList
                        data={saveAccountExceptCurrentAccount}
                        keyExtractor={(item) => item.username || item.email || ""}
                        renderItem={renderAccount}
                        contentContainerStyle={{paddingBottom: 8}}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View className="h-4"/>}
                    />
                    {savedAccounts.length < MAX_ACCOUNT && (
                        <View>
                            <Pressable
                                className="flex-row items-center"
                                onPress={handleAddNewAccount}
                            >
                                <View className="bg-primary-50 rounded-full w-12 h-12 items-center justify-center mr-4">
                                    <Ionicons name="person-add-outline" size={24} color={Colors.primary["500"]}/>
                                </View>
                                <Text className="text-lg font-medium">Add Account</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
                <Text
                    className="text-sm text-grey-500 mt-2 ml-4">{`You can only have ${MAX_ACCOUNT} accounts saved`}</Text>
            </View>

        </KeyboardAwareScrollView>
    );
}

function Section({title, children}: { title: string; children: React.ReactNode }) {
    return (
        <View className="mt-6">
            <View className="flex-col rounded-3xl p-5 bg-white gap-5">
                <Text className="text-lg font-bold text-grey-700">{title}</Text>
                {children}
            </View>
        </View>
    );
}