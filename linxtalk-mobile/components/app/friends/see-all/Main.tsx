import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/theme";
import Button from "@/library/Button";
import Icon from "@/library/Icon";
import {useRouter} from "expo-router";
import {useInfiniteQuery, useMutation} from "@tanstack/react-query";
import {get, patch} from "@/services/axios";
import {FriendRequestResponse, UpdateFriendRequestStatusRequest} from "@/constants/type";
import {FRIEND_REQUEST} from "@/constants/api";
import {QUERY_KEYS} from "@/constants/constant";
import {useEffect} from "react";
import Skeleton from "@/library/Skeleton";
import {useLoadingStore} from "@/store/loading-store";
import {useToastStore} from "@/store/toast-store";
import {StyleSheet} from "react-native";
import {formatRelativeTime} from "@/utils/fn-common";
import {queryClient} from "@/components/providers/query-client";
import { useTranslation } from "react-i18next";


export default function Main() {
    const { showToast } = useToastStore();
    const { t } = useTranslation();
    const { 
        data, 
        isLoading, 
        fetchNextPage, 
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: [QUERY_KEYS.INCOMING_FRIEND_REQUESTS_SEE_ALL],
        staleTime: 30 * 1000,
        initialPageParam: 0,
        queryFn: ({ pageParam }) => {
            return get<BaseResponse<PageResponse<FriendRequestResponse>>>(`${FRIEND_REQUEST}?pageSize=10&pageNo=${pageParam}&status=PENDING`)
                .then((res) => {
                    return res.data.data;
                }).catch((error: Error) => {
                    showToast({ message: error.message, type: "error" });
                    throw error;
                });
        },
        getNextPageParam: (lastPage) => {
            if (lastPage?.hasNext) {
                return lastPage.pageNumber + 1;
            }
            return undefined;
        },
        getPreviousPageParam: (firstPage) => {
            if (firstPage?.hasPrevious) {
                return firstPage.pageNumber - 1;
            }
            return undefined;
        },
    });

    useEffect(() => {
        return () => {
            queryClient.setQueryData([QUERY_KEYS.INCOMING_FRIEND_REQUESTS_SEE_ALL], (data: any) => {
                if (!data || !data.pages || !data.pageParams) return data;
                return {
                    ...data,
                    pages: data.pages.slice(0, 1),
                    pageParams: data.pageParams.slice(0, 1),
                };
            });
        };
    }, []);

    const { mutate: updateStatus } = useMutation({
        mutationFn: async ({ data, friendRequestId }: {
            data: UpdateFriendRequestStatusRequest;
            friendRequestId: string
        }) => {
            const res = await patch<BaseResponse<FriendRequestResponse | null>>(`${FRIEND_REQUEST}/${friendRequestId}/status`, data);
            return res.data;
        },
        onMutate: async ({ data, friendRequestId }: { data: UpdateFriendRequestStatusRequest, friendRequestId: string }) => {
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.INCOMING_FRIEND_REQUESTS_SEE_ALL] });
            const previousData = queryClient.getQueryData([QUERY_KEYS.INCOMING_FRIEND_REQUESTS_SEE_ALL]);

            queryClient.setQueryData([QUERY_KEYS.INCOMING_FRIEND_REQUESTS_SEE_ALL], (old: any) => {
                if (!old || !old.pages) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map((req: FriendRequestResponse) =>
                            req.id === friendRequestId ? { ...req, status: data.status } : req
                        ).filter((req: FriendRequestResponse) => req.status !== "REJECTED")
                    }))
                };
            });

            return { previousData };
        },
        onError: (error: Error, _variables: { data: UpdateFriendRequestStatusRequest, friendRequestId: string }, context: any) => {
            showToast({
                message: error.message,
                type: "error",
            });
            if (context?.previousData) {
                queryClient.setQueryData([QUERY_KEYS.INCOMING_FRIEND_REQUESTS_SEE_ALL], context.previousData);
            }
        },
        onSuccess:(_, variables) => {
            let keys: string[] = [QUERY_KEYS.INCOMING_FRIEND_REQUESTS];
            if(variables.data.status === "ACCEPTED") {
                keys.push(QUERY_KEYS.FRIENDS_SEE_ALL);
            }
            queryClient.invalidateQueries({ queryKey: keys });
        }

    });

  return (
    <>
        {isLoading ? (
            <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
                {Array.from({ length: 4 }).map((_, index) => (
                    <View key={`skeleton-${index}`} className="bg-white dark:bg-background-dark p-5 rounded-2xl border border-grey-200 dark:border-grey-800">
                        <View className="flex-row items-center gap-4 mb-4">
                            <Skeleton width={56} height={56} borderRadius={28} />
                            <View className="flex-1 gap-2">
                                <Skeleton width="80%" height={18} />
                                <Skeleton width="50%" height={14} />
                            </View>
                        </View>
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Skeleton width="100%" height={48} borderRadius={24} />
                            </View>
                            <View className="flex-1">
                                <Skeleton width="100%" height={48} borderRadius={24} />
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        ) : (
            <FlatList
                contentContainerStyle={{ padding: 20, gap: 16 }}
                showsVerticalScrollIndicator={false}
                data={data?.pages.flatMap((page) => page?.data) || []}
                renderItem={({ item: request }) => (
                    <View key={request.id} style={styles.requestCard} className="bg-white dark:bg-background-dark p-5 rounded-2xl border border-grey-50 dark:border-grey-800 ">
                        <View className="flex-row items-center gap-4 mb-4">
                            <View className="w-14 h-14 rounded-full bg-grey-200 overflow-hidden"/>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-grey-900 dark:text-grey-100">{request.sender?.displayName}</Text>
                                <Text className="text-grey-500 dark:text-grey-400">{request.sender?.username ? `@${request.sender?.username}` : request.sender?.email}</Text>
                            </View>
                            <View className="self-start">
                                <Text className="text-xs text-grey-500 dark:text-grey-400">{formatRelativeTime(request.createdAt)}</Text>
                            </View>
                        </View>
                        <Text className="text-grey-500 dark:text-grey-400 mb-4">{request.message}</Text>

                        <View className="flex-row gap-3">
                            {request.status === "PENDING" && (
                                <>
                                    <View className="flex-1">
                                        <Button title={t('friends.accept')} onPress={() => updateStatus({ data: { status: "ACCEPTED" }, friendRequestId: request.id })} />
                                    </View>
                                    <View className="flex-1">
                                        <Button variant="outline" title={t('friends.reject')} onPress={() => updateStatus({ data: { status: "REJECTED" }, friendRequestId: request.id })} />
                                    </View>
                                </>
                            )}
                            {request.status === "ACCEPTED" && (
                                <Text className="text-primary-600 dark:text-primary-400 font-semibold w-full bg-primary-50 dark:bg-primary-900 p-3 rounded-full text-center">{t('friends.friendsNow')}</Text>
                            )}
                        </View>
                    </View>
                )}
                keyExtractor={(item) => item.id}
                onEndReached={() => fetchNextPage()}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View className="bg-white dark:bg-background-dark p-5 rounded-2xl border border-grey-200 dark:border-grey-800">
                            <View className="flex-row items-center gap-4 mb-4">
                                <Skeleton width={56} height={56} borderRadius={28} />
                                <View className="flex-1 gap-2">
                                    <Skeleton width="80%" height={18} />
                                    <Skeleton width="50%" height={14} />
                                </View>
                            </View>
                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <Skeleton width="100%" height={48} borderRadius={24} />
                                </View>
                                <View className="flex-1">
                                    <Skeleton width="100%" height={48} borderRadius={24} />
                                </View>
                            </View>
                        </View>
                    ) : null
                }
            />
        )}
    </>
  );
}

const styles = StyleSheet.create({
    requestCard: {
        shadowColor: '#1FBAC3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    }
  })