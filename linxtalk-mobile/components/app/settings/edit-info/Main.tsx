import { Platform, Pressable, Text, View } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import Input from "@/library/Input";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAccountStore } from "@/store/account-store";
import { useNavigation, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { regexPhoneNumber } from "@/constants/regex";
import { useSavedAccountStore } from "@/store/saved-account-store";
import { useModalStore } from "@/store/modal-store";
import { useLoadingStore } from "@/store/loading-store";
import { useToastStore } from "@/store/toast-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { asyncStoragePersister } from "@/components/providers/query-client";
import { get, post, put } from "@/services/axios";
import { AUTH, USER } from "@/constants/api";
import { MAX_ACCOUNT, QUERY_KEYS } from "@/constants/constant";
import {
    AuthResponse,
    LinkEmailRequest,
    LoginWithGoogleRequest,
    ProfileResponse,
    SavedAccount,
    SwitchAccountRequest,
    UpdateProfileRequest
} from "@/constants/type";
import { useAuthStore } from "@/store/auth-store";
import { Colors } from "@/constants/theme";
import { getDeviceId } from "@/utils/fn-common";
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";
import * as Device from "expo-device";
import * as Application from "expo-application";
import AddNewAccount from "../AddNewAccount";
import ReloginAccount from "../ReloginAccount";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useTranslation } from "react-i18next";
import Icon from "@/library/Icon";

export default function Main() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { t } = useTranslation();
    const { account, setAccount } = useAccountStore();
    const { setTokens } = useAuthStore();
    const navigation = useNavigation();
    const { savedAccounts, removeAccount, saveAccount } = useSavedAccountStore();
    const { showModal } = useModalStore();
    const { showLoading, hideLoading } = useLoadingStore();
    const { showToast } = useToastStore();
    const [showDatePicker, setShowDatePicker] = useState(false);

    const editInfoSchema = z.object({
        phoneNumber: z.string().regex(regexPhoneNumber, t('validation.phoneNumberInvalid')).optional(),
        birthday: z.string().optional(),
        displayName: z.string().min(1, t('validation.displayNameRequired')).max(50, t('validation.displayNameMax')),
        bio: z.string().max(100, t('validation.bioMax')).optional(),
    });

    type EditInfoForm = z.infer<typeof editInfoSchema>;

    const saveAccountExceptCurrentAccount = savedAccounts.filter((savedAccount) => {
        if (savedAccount.username && account.username) return savedAccount.username !== account.username;
        if (savedAccount.email && account.email) return savedAccount.email !== account.email;
        return true;
    });

    const { data, isFetching, isLoading } = useQuery({
        queryKey: [QUERY_KEYS.PROFILE],
        staleTime: 12 * 60 * 60 * 1000,
        queryFn: () => {
            return get<BaseResponse<ProfileResponse>>(`${USER}/profile`)
                .then((res) => {
                    return res.data.data;
                }).catch((error: Error) => {
                    showToast({ message: error.message, type: "error" });
                })
        },
    });

    useEffect(() => {
        if (isLoading) {
            showLoading();
        } else {
            hideLoading();
        }
    }, [isLoading])

    const formValues = data ? {
        phoneNumber: data.phoneNumber ?? undefined,
        birthday: data.birthday ?? undefined,
        displayName: account.displayName,
        bio: data.bio ?? undefined,
    } : undefined;

    const { control, handleSubmit, formState: { errors, isDirty } } = useForm<EditInfoForm>({
        resolver: zodResolver(editInfoSchema),
        defaultValues: {
            phoneNumber: undefined,
            birthday: undefined,
            displayName: account.displayName,
            bio: undefined,
        },
        values: formValues,
    });


    const { mutate: mutateUpdateProfile } = useMutation({
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
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE] });
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


    const { mutate: mutateRemoveAccount } = useMutation({
        mutationFn: async (data: SwitchAccountRequest) => {
            const res = await post<BaseResponse<any>>(`${AUTH}/remove-account`, data);
            return res.data;
        },
        onSettled: async (_, __, variables) => {
            removeAccount(variables.username, variables.email);
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
            setTokens(result.data.accessToken, result.data.refreshToken);
            setAccount({
                username: result.data.username,
                email: result.data.email,
                displayName: result.data.displayName,
                avatarUrl: result.data.avatarUrl,
            });
            hideLoading();
            await queryClient.resetQueries();
            await asyncStoragePersister.removeClient();
            router.dismissTo("/settings");
            router.replace("/");
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
            hideLoading();
            await queryClient.resetQueries();
            await asyncStoragePersister.removeClient();
            router.dismissTo("/settings");
            router.replace("/");
        },
        onError: (error) => {
            hideLoading();
            showToast({
                message: error.message,
                type: "error",
            });
        },
    });

    const { mutate: linkEmailMutate } = useMutation({
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
            title: t('editInfo.addNewAccount'),
            children: <AddNewAccount />,
        });
    };

    const handleRemoveAccount = async (account: SavedAccount) => {
        const deviceId = await getDeviceId();
        mutateRemoveAccount({ username: account.username, deviceId, email: account.email });
    };

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
                    message: t('errors.linkEmailFailed'),
                    type: "error",
                })
            }
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.IN_PROGRESS:
                        showToast({
                            message: t('errors.linkEmailInProgress'),
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
                            message: t('errors.linkEmailFailed'),
                            type: "error",
                        })
                        break;
                }
            } else {
                showToast({
                    message: t('errors.linkEmailFailed'),
                    type: "error",
                })
            }
        } finally {
            await GoogleSignin.signOut();
        }
    }

    const renderAccount = ({ item }: { item: SavedAccount }) => (
        <Pressable className="flex-row items-center" onPress={() => handleSwitchAccount(item)}>
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
            <View className="flex-1 ml-4">
                <Text className="text-base font-semibold text-grey-800 dark:text-grey-100" numberOfLines={1}>
                    {item.displayName}
                </Text>
                <Text className="text-sm text-grey-500 dark:text-grey-400 mt-0.5" numberOfLines={1}>
                    {item.username ? `@${item.username}` : item.email}
                </Text>
            </View>
            <Pressable
                className="p-2"
                onPress={() => handleRemoveAccount(item)}
                hitSlop={8}
            >
                <Ionicons name="close-circle-outline" size={24} color={Colors.grey["400"]} />
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
                    <Icon name="checkmark-outline" size={24} color={"black"} darkColor={"white"} />
                </Pressable>
            ) : null,
        });
    }, [navigation, handleSubmit, isDirty, mutateUpdateProfile]);


    return (
        <KeyboardAwareScrollView
            className="px-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
        >
            {/* Section: Your Info */}
            <Section title={t('editInfo.yourInfo')}>
                <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label={t('editInfo.phoneNumber')}
                            placeholder={t('editInfo.phoneNumberPlaceholder')}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="phone-pad"
                            icon="call-outline"
                            error={errors.phoneNumber?.message}
                            isBlurAndSubmit
                            loading={isFetching}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="birthday"
                    render={({ field: { onChange, value } }) => {
                        const dateValue = value ? new Date(value) : undefined;
                        const formattedDate = dateValue
                            ? `${String(dateValue.getDate()).padStart(2, '0')}/${String(dateValue.getMonth() + 1).padStart(2, '0')}/${dateValue.getFullYear()}`
                            : "";

                        return (
                            <>
                                <Pressable disabled={isFetching} onPress={() => setShowDatePicker(true)}>
                                    <View className="flex flex-col w-full gap-1 relative">
                                        <View
                                            className="flex flex-row gap-1 absolute -top-2.5 left-4 z-10 bg-white dark:bg-background-dark px-1 rounded-md">
                                            <Text className="text-sm font-medium"
                                                style={{ color: Colors.primary["400"] }}>{t('editInfo.birthday')}</Text>
                                        </View>
                                        <View className="relative flex flex-row items-center bg-white dark:bg-background-dark">
                                            <View
                                                className="w-full rounded-full py-4 pl-14 pr-4 bg-white dark:bg-background-dark"
                                                style={{
                                                    borderWidth: 1.5,
                                                    borderRadius: 999,
                                                    borderColor: Colors.primary["400"]
                                                }}
                                            >
                                                <Text className={`text-base ${formattedDate ? "text-grey-800 dark:text-grey-100" : "text-grey-500 dark:text-grey-200"}`}>
                                                    {formattedDate || "DD/MM/YYYY"}
                                                </Text>
                                            </View>
                                            <View className="absolute left-6 top-0 bottom-0 justify-center">
                                                <Icon name="calendar-outline" size={20} color={Colors.grey["500"]} darkColor={Colors.grey["200"]} />
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
                    <View className="flex flex-row gap-1 absolute -top-2.5 left-4 z-10 bg-white dark:bg-background-dark px-1 rounded-md">
                        <Text className="text-sm font-medium" style={{ color: Colors.primary["400"] }}>{t('common.email')}</Text>
                    </View>
                    <View className="relative flex flex-row items-center bg-white dark:bg-background-dark">
                        <Pressable
                            className="w-full rounded-full py-4 pl-14 pr-4 bg-white dark:bg-background-dark"
                            style={{ borderWidth: 1.5, borderRadius: 999, borderColor: Colors.primary["400"] }}
                            onPress={handleLinkEmail}
                            disabled={account.username === null || account.username === undefined || isFetching}
                        >
                            <Text className={`text-base ${account.email ? "text-grey-800 dark:text-grey-100" : "text-grey-600 dark:text-grey-200"}`}>
                                {account.email || t('editInfo.linkYourEmail')}
                            </Text>
                        </Pressable>
                        <View className="absolute left-6 top-0 bottom-0 justify-center">
                            <Icon name="mail-outline" size={20} color={Colors.grey["500"]} darkColor={Colors.grey["200"]} />
                        </View>
                    </View>
                </View>
            </Section>

            {/* Section: Your Name */}
            <Section title={t('editInfo.yourName')}>
                <Controller
                    control={control}
                    name="displayName"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label={t('editInfo.displayNameLabel')}
                            placeholder={t('editInfo.displayNamePlaceholder')}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            icon="person-outline"
                            error={errors.displayName?.message}
                            maxCharCount={50}
                            isBlurAndSubmit
                            loading={isFetching}
                        />
                    )}
                />
            </Section>

            {/* Section: Your Bio */}
            <Section title={t('editInfo.bio')}>
                <Controller
                    control={control}
                    name="bio"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label={t('editInfo.bio')}
                            placeholder={t('editInfo.bioPlaceholder')}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            icon="document-text-outline"
                            multiline
                            error={errors.bio?.message}
                            maxCharCount={100}
                            isBlurAndSubmit
                            loading={isFetching}
                        />
                    )}
                />
            </Section>

            {/* Section: Saved Accounts */}
            <View className="mt-6">
                <View className="flex-col rounded-2xl p-4 bg-white dark:bg-background-dark gap-4">
                    <Text className="text-lg font-bold text-grey-800 dark:text-grey-100">{t('settings.savedAccounts')}</Text>
                    <View className="gap-4" style={{ paddingBottom: 8 }}>
                        {saveAccountExceptCurrentAccount.map((item) => (
                            <React.Fragment key={item.username || item.email || ""}>
                                {renderAccount({ item })}
                            </React.Fragment>
                        ))}
                    </View>
                    {savedAccounts.length < MAX_ACCOUNT && (
                        <View>
                            <Pressable
                                className="flex-row items-center"
                                onPress={handleAddNewAccount}
                                disabled={isFetching}
                            >
                                <View className="bg-primary-50 dark:bg-primary-900 rounded-full w-12 h-12 items-center justify-center mr-4">
                                    <Ionicons name="person-add-outline" size={24} color={Colors.primary["500"]} />
                                </View>
                                <Text className="text-lg font-medium text-grey-800 dark:text-grey-100">{t('editInfo.addAccount')}</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
                <Text
                    className="text-sm text-grey-500 dark:text-grey-400 mt-2 ml-4">{t('editInfo.maxAccountMessage', { max: MAX_ACCOUNT })}</Text>
            </View>

        </KeyboardAwareScrollView>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View className="mt-6">
            <View className="flex-col rounded-3xl p-5 bg-white dark:bg-background-dark gap-5">
                <Text className="text-lg font-bold text-grey-800 dark:text-grey-100">{title}</Text>
                {children}
            </View>
        </View>
    );
}