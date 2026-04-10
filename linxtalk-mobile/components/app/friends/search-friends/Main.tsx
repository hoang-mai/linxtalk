import { Colors } from "@/constants/theme";
import Icon from "@/library/Icon";
import { View, TextInput, useColorScheme, ScrollView, Text } from "react-native";
import { useModalStore } from "@/store/modal-store";
import AddMessageModal from "./AddMessageModal";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, patch, post } from "@/services/axios";
import { FRIEND_REQUEST, USER } from "@/constants/api";
import { QUERY_KEYS } from "@/constants/constant";
import { CreateFriendRequestRequest, FriendRequestResponse, UpdateFriendRequestStatusRequest, UserSearchResponse } from "@/constants/type";
import { useDebounce } from "@/hooks/useDebounce";
import Skeleton from "@/library/Skeleton";
import { getUserId } from "@/utils/fn-common";
import Button from "@/library/Button";
import { useToastStore } from "@/store/toast-store";

export default function Main() {
    const { t } = useTranslation();
    const { showToast } = useToastStore();
    const queryClient = useQueryClient();
    const requestTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const focused = useSharedValue(0);
    const colorScheme = useColorScheme();

    const handleFocus = () => {
        focused.value = withTiming(1, { duration: 200 });
    };

    const handleBlur = () => {
        focused.value = withTiming(0, { duration: 200 });
    };

    const borderStyle = useAnimatedStyle(() => {
        return {
            borderColor: interpolateColor(focused.value, [0, 1], [Colors.primary["300"], Colors.primary["500"]]),
            borderWidth: 1.5,
            borderRadius: 999,
            width: '100%',
        };
    });
    const userId = getUserId();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const { showModal } = useModalStore();

    const { data: searchResult, isFetching: isFetchingSearch } = useQuery({
        queryKey: [QUERY_KEYS.SEARCH_FRIENDS, debouncedSearchQuery],
        retry: 0,
        queryFn: async () => {
            const res = await get<BaseResponse<UserSearchResponse>>(`${USER}/search?q=${encodeURIComponent(debouncedSearchQuery)}`);
            return res.data.data;
        },
        enabled: debouncedSearchQuery.length > 0,
    });

    const { mutate: addFriend } = useMutation({
        mutationFn: async (data: CreateFriendRequestRequest) => {
            const res = await post<BaseResponse<FriendRequestResponse>>(`${FRIEND_REQUEST}`, data);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData<UserSearchResponse>(["search-friends", debouncedSearchQuery], (old) =>
                old ? {
                    ...old,
                    friendRequestResponse: data.data
                } : old
            );
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INCOMING_FRIEND_REQUESTS] });
        },
        onError: (error) => {
            showToast({
                message: error.message,
                type: "error",
            });
            queryClient.setQueryData<UserSearchResponse>(["search-friends", debouncedSearchQuery], (old) =>
                old ? {
                    ...old,
                    friendRequestResponse: null
                } : old
            );
        }
    })

    const { mutate: updateStatus } = useMutation({
        mutationFn: async ({ data, friendRequestId }: {
            data: UpdateFriendRequestStatusRequest;
            friendRequestId: string
        }) => {
            const res = await patch<BaseResponse<FriendRequestResponse | null>>(`${FRIEND_REQUEST}/${friendRequestId}/status`, data);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData<UserSearchResponse>(["search-friends", debouncedSearchQuery], (old) =>
                old ? {
                    ...old,
                    friendRequestResponse: data.data
                } : old
            );
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INCOMING_FRIEND_REQUESTS] });
        },
        onError: (error) => {
            showToast({
                message: error.message,
                type: "error",
            });
            queryClient.setQueryData<UserSearchResponse>(["search-friends", debouncedSearchQuery], (old) =>
                old ? {
                    ...old,
                    friendRequestResponse: {
                        ...(old.friendRequestResponse as any),
                        status: "PENDING"
                    }
                } : old
            );
        }
    })

    const handleAddFriend = (searchResult: UserSearchResponse, message: string) => {
        if (requestTimeoutRef.current) {
            clearTimeout(requestTimeoutRef.current);
            requestTimeoutRef.current = null;
        }

        queryClient.setQueryData<UserSearchResponse>(["search-friends", debouncedSearchQuery], (old) =>
            old ? {
                ...old,
                friendRequestResponse: {
                    ...(old.friendRequestResponse as any),
                    status: "PENDING",
                    senderId: userId,
                    message: message
                }
            } : old
        );

        requestTimeoutRef.current = setTimeout(() => {
            addFriend({ receiverId: searchResult.id, message });
            requestTimeoutRef.current = null;
        }, 1000);
    }

    const handleUpdateStatus = (searchResult: UserSearchResponse, status: "ACCEPTED" | "REJECTED" | "CANCELLED") => {
        if (requestTimeoutRef.current) {
            clearTimeout(requestTimeoutRef.current);
            requestTimeoutRef.current = null;
        }

        queryClient.setQueryData<UserSearchResponse>(["search-friends", debouncedSearchQuery], (old) =>
            old ? {
                ...old,
                friendRequestResponse: {
                    ...(old.friendRequestResponse as any),
                    status: status
                }
            } : old
        );
        if (searchResult.friendRequestResponse && searchResult.friendRequestResponse.id) {
            requestTimeoutRef.current = setTimeout(() => {
                updateStatus({ data: { status }, friendRequestId: searchResult.friendRequestResponse!.id });
                requestTimeoutRef.current = null;
            }, 1000);
        }
    }

    const renderAction = () => {
        if (!searchResult) return null;

        const status = searchResult.friendRequestResponse?.status;
        const senderId = searchResult.friendRequestResponse?.senderId;

        if (!searchResult.friendRequestResponse || status === "CANCELLED" || status === "REJECTED") {
            return (
                <Button
                    title={t('friends.addFriend')}
                    onPress={() => showModal({
                        title: t('friends.addFriendTitle'),
                        children: <AddMessageModal onSend={(msg) => handleAddFriend(searchResult, msg)} />
                    })}
                    className="rounded-full px-4 py-1.5"
                    textClassName="text-sm"
                />
            );
        }

        if (status === "PENDING") {
            if (senderId === userId) {
                return (
                    <Button
                        variant="soft"
                        title={t('friends.cancel')}
                        onPress={() => handleUpdateStatus(searchResult, "CANCELLED")}
                        className="rounded-full px-4 py-1.5"
                        textClassName="text-sm"
                    />

                );
            } else {
                return (
                    <View className="flex flex-row gap-2">
                        <Button
                            leftIcon="checkmark"
                            variant="soft"
                            onPress={() => {
                                handleUpdateStatus(searchResult, "ACCEPTED");
                            }}
                            className="rounded-lg !px-2 !py-2"
                            textClassName="text-sm"
                        />
                        <Button
                            variant="secondary"
                            leftIcon="close"
                            leftIconColor={Colors.grey["500"]}
                            onPress={() => {
                                handleUpdateStatus(searchResult, "REJECTED");
                            }}
                            className="rounded-md !px-2 !py-2"
                        />
                    </View>
                );
            }
        }

        if (status === "ACCEPTED") {
            return (
                <Button
                    variant="soft"
                    title={t('friends.message')}
                    onPress={() => {

                    }}
                    className="rounded-full px-4 py-1.5"
                    textClassName="text-sm"
                />
            );
        }

        return null;
    };

    return (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }} showsVerticalScrollIndicator={false}>
                <View className="relative">
                    <Animated.View style={borderStyle}>
                        <TextInput
                            placeholder={t('friends.searchPlaceholder')}
                            placeholderTextColor={colorScheme === "dark" ? Colors.grey["400"] : Colors.grey["500"]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            autoFocus
                            className="w-full py-3.5 text-base text-grey-800 dark:text-grey-100 pl-14 pr-4 bg-white dark:bg-background-dark rounded-full"
                        />
                    </Animated.View>
                    <Icon
                        name="search-outline"
                        size={24}
                        color={Colors.primary["400"]}
                        className="absolute left-4 top-0 bottom-0 justify-center mt-3.5"
                    />
                    {searchQuery.length > 0 && (
                        <Icon
                            onPress={() => setSearchQuery("")}
                            name="close-circle"
                            size={24}
                            color={Colors.grey["400"]}
                            className="absolute right-4 top-0 bottom-0 justify-center mt-3.5"
                        />
                    )}
                </View>
                <Text className="text-xl font-bold dark:text-white mt-4">{t('friends.result')}</Text>

                {isFetchingSearch ? (
                    <View className="mt-4 gap-4">
                        <View className="flex-row items-center gap-4 bg-white dark:bg-background-dark p-4 rounded-xl border border-grey-200 dark:border-grey-800">
                            <Skeleton width={50} height={50} borderRadius={25} />
                            <View className="gap-2 flex-1">
                                <Skeleton width="60%" height={16} />
                                <Skeleton width="40%" height={14} />
                            </View>
                        </View>
                    </View>
                ) : searchResult ? (
                    <View className="mt-4 gap-4">
                        <View className="flex-row items-center gap-4 bg-white dark:bg-background-dark p-4 rounded-xl border border-grey-200 dark:border-grey-800">
                            <View className="w-14 h-14 rounded-full bg-grey-200 overflow-hidden" />
                            <View className=" flex-1">
                                <Text className="text-xl font-bold dark:text-white">{searchResult.displayName}</Text>
                                <Text className="text-sm text-grey-500 dark:text-grey-400">{searchResult.username ? `@${searchResult.username}` : searchResult.email}</Text>
                            </View>
                            {renderAction()}
                        </View>

                    </View>
                ) : (
                    <View className="mt-4 gap-4">
                        <Text className="text-center text-grey-500 dark:text-grey-400">{t('friends.noResultFound')}</Text>
                    </View>
                )}
            </ScrollView>
    );
}