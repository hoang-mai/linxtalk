import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { get } from "@/services/axios";
import { FRIEND_REQUEST } from "@/constants/api";
import { QUERY_KEYS } from "@/constants/constant";
import { FriendRequestResponse } from "@/constants/type";
import { useToastStore } from "@/store/toast-store";
import Skeleton from "@/library/Skeleton";
import { StyleSheet } from "react-native";
import { formatRelativeTime } from "@/utils/fn-common";
import { useEffect } from "react";
import { queryClient } from "@/components/providers/query-client";
import Icon from "@/library/Icon";
import { Colors } from "@/constants/theme";
import Button from "@/library/Button";
import { useBottomSheetStore } from "@/store/bottom-sheet-store";
import FriendOptionsSheet from "./FriendOptionsSheet";
import { useTranslation } from "react-i18next";

export default function Main() {
    const { showToast } = useToastStore();
    const { showBottomSheet } = useBottomSheetStore();
    const { t } = useTranslation();

    const { data, isLoading, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: [QUERY_KEYS.FRIENDS_SEE_ALL],
        staleTime: 30 * 1000,
        initialPageParam: 0,
        queryFn: ({ pageParam }) => {
            return get<BaseResponse<PageResponse<FriendRequestResponse>>>(
                `${FRIEND_REQUEST}?pageSize=10&pageNo=${pageParam}&status=ACCEPTED`
            )
                .then((res) => res.data.data)
                .catch((error: Error) => {
                    showToast({ message: error.message, type: "error" });
                    throw error;
                });
        },
        getNextPageParam: (lastPage) => (lastPage?.hasNext ? lastPage.pageNumber + 1 : undefined),
    });

    useEffect(() => {
        return () => {
            queryClient.setQueryData([QUERY_KEYS.FRIENDS_SEE_ALL], (oldData: any) => {
                if (!oldData?.pages || !oldData?.pageParams) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.slice(0, 1),
                    pageParams: oldData.pageParams.slice(0, 1),
                };
            });
        };
    }, []);

    return (
        <>
            {isLoading ? (
                <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <View
                            key={`friend-skeleton-${index}`}
                            className="bg-white dark:bg-background-dark p-5 rounded-2xl border border-grey-200 dark:border-grey-800"
                        >
                            <View className="flex-row items-center gap-4">
                                <Skeleton width={56} height={56} borderRadius={28} />
                                <View className="flex-1 gap-2">
                                    <Skeleton width="70%" height={18} />
                                    <Skeleton width="40%" height={14} />
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
                    keyExtractor={(item) => item.id}
                    renderItem={({ item: friend }) => (
                        <View
                            style={styles.friendCard}
                            className="bg-white dark:bg-background-dark p-4 rounded-2xl flex-row items-center gap-4"
                        >
                            <View className="w-14 h-14 rounded-full bg-grey-200 overflow-hidden" />
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-grey-900 dark:text-grey-100">
                                    {friend.sender?.displayName}
                                </Text>
                                <Text className="text-xs text-grey-500 dark:text-grey-400 mt-1">
                                    {formatRelativeTime(friend.createdAt)}
                                </Text>
                            </View>
                            <View className="flex flex-row gap-2 item-center">
                                <Button 
                            leftIcon="chatbubble-ellipses-outline"
                            variant="soft"
                        
                            className="!px-2 !py-2"
                            onPress={() => {}}
                            
                        />
                        <Pressable
                        onPress={() =>
                            showBottomSheet({
                                children: <FriendOptionsSheet friendRequestResponse={friend}/>,
                            })
                        }
                        className="items-center justify-center" >
                            <Icon size={15} name="ellipsis-vertical" color={Colors.grey[500]} darkColor={Colors.grey[600]}/>
                        </Pressable>
                        </View>
                        </View>
                    )}
                    onEndReached={() => fetchNextPage()}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={<Text className="text-center text-grey-500 dark:text-grey-400">{t('friends.noFriendsFound')}</Text>}
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <View className="bg-white dark:bg-background-dark p-5 rounded-2xl border border-grey-200 dark:border-grey-800">
                                <View className="flex-row items-center gap-4">
                                    <Skeleton width={56} height={56} borderRadius={28} />
                                    <View className="flex-1 gap-2">
                                        <Skeleton width="70%" height={18} />
                                        <Skeleton width="40%" height={14} />
                                    </View>
                                </View>
                            </View>
                        )  : null
                    }
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    friendCard: {
        shadowColor: "#1FBAC3",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
});
