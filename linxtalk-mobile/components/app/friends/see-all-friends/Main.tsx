import {FlatList, Pressable, ScrollView, Text, View, StyleSheet} from "react-native";
import {useInfiniteQuery} from "@tanstack/react-query";
import {get} from "@/services/axios";
import {FRIEND} from "@/constants/api";
import {QUERY_KEYS} from "@/constants/constant";
import {FriendResponse} from "@/constants/type";
import {useToastStore} from "@/store/toast-store";
import Skeleton from "@/library/Skeleton";
import {formatRelativeTime} from "@/utils/fn-common";
import {useEffect, useState} from "react";
import {queryClient} from "@/components/providers/query-client";
import Icon from "@/library/Icon";
import {Colors} from "@/constants/theme";
import Button from "@/library/Button";
import {useBottomSheetStore} from "@/store/bottom-sheet-store";
import FriendOptionsSheet from "./FriendOptionsSheet";
import {useTranslation} from "react-i18next";
import SortOptionsSheet, { SortConfig } from "./SortOptionsSheet";

export default function Main() {
    const {showToast} = useToastStore();
    const {showBottomSheet} = useBottomSheetStore();
    const {t} = useTranslation();
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        id: "Default",
        sortBy: null,
        sortDir: null,
    });

    const {data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage} = useInfiniteQuery({
        queryKey: [QUERY_KEYS.FRIENDS_SEE_ALL, sortConfig.sortDir, sortConfig.sortBy],
        staleTime: 30 * 1000,
        initialPageParam: 0,
        queryFn: ({pageParam}) => {
            let url = `${FRIEND}?pageNo=${pageParam}`;
            if (sortConfig.sortBy) {
                url += `&sortBy=${sortConfig.sortBy}&sortDir=${sortConfig.sortDir}`;
            }
            return get<BaseResponse<PageResponse<FriendResponse>>>(url)
                .then((res) => res.data.data)
                .catch((error: Error) => {
                    showToast({message: error.message, type: "error"});
                    throw error;
                });
        },
        getNextPageParam: (lastPage) => {
            if (lastPage?.hasNext) {
                return lastPage.pageNumber + 1;
            }
            return undefined;
        },
    });

    useEffect(() => {
        return () => {
            queryClient.setQueriesData({ queryKey: [QUERY_KEYS.FRIENDS_SEE_ALL] }, (oldData: any) => {
                if (!oldData?.pages || !oldData?.pageParams) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.slice(0, 2),
                    pageParams: oldData.pageParams.slice(0, 2),
                };
            });
        };
    }, []);
    return (
        <>
            {isLoading ? (
                <ScrollView contentContainerStyle={{padding: 20, gap: 16}} showsVerticalScrollIndicator={false}>
                    {Array.from({length: 6}).map((_, index) => (
                        <View
                            key={`friend-skeleton-${index}`}
                            className="bg-white dark:bg-background-dark p-5 rounded-2xl border border-grey-200 dark:border-grey-800"
                        >
                            <View className="flex-row items-center gap-4">
                                <Skeleton width={56} height={56} borderRadius={28}/>
                                <View className="flex-1 gap-2">
                                    <Skeleton width="70%" height={18}/>
                                    <Skeleton width="40%" height={14}/>
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <FlatList
                    contentContainerStyle={{padding: 20, gap: 16}}
                    showsVerticalScrollIndicator={false}
                    data={data?.pages.flatMap((page) => page?.data) || []}
                    keyExtractor={(item) => item.id}
                    renderItem={({item: friend}) => (
                        <View
                            style={styles.friendCard}
                            className="bg-white dark:bg-background-dark p-4 rounded-2xl flex-row items-center gap-4"
                        >
                        <View className="relative">
                            <View className="w-14 h-14 rounded-full bg-grey-200 overflow-hidden"/>
                            {friend.isOnline && (
                                <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-background-dark" />
                            )}
                        </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-grey-900 dark:text-grey-100">
                                    {friend.displayName}
                                </Text>
                                <Text className="text-xs text-grey-500 dark:text-grey-400 mt-1">
                                    {friend.isOnline ? t('friends.online') : friend.lastSeenAt ? formatRelativeTime(friend.lastSeenAt) : t('friends.offline')}
                                </Text>
                            </View>
                            <View className="flex flex-row gap-2 item-center">
                                <Button
                                    leftIcon="chatbubble-ellipses-outline"
                                    variant="soft"

                                    className="!px-2 !py-2"
                                    onPress={() => {
                                    }}

                                />
                                <Pressable
                                    onPress={() =>
                                        showBottomSheet({
                                            children: <FriendOptionsSheet friendResponse={friend}/>,
                                        })
                                    }
                                    className="items-center justify-center">
                                    <Icon size={15} name="ellipsis-vertical" color={Colors.grey[500]}
                                          darkColor={Colors.grey[600]}/>
                                </Pressable>
                            </View>
                        </View>
                    )}
                    onEndReached={() => {
                        if (hasNextPage && !isFetchingNextPage) {
                            fetchNextPage();
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListHeaderComponent={
                        <View className={"flex-row items-center justify-between"}>
                            <View className={"flex-row items-center gap-4"}>
                                <Text
                                    className="text-2xl font-bold text-grey-900 dark:text-white">{t('friends.title')}</Text>
                                <View className="px-2 flex items-center justify-center bg-primary-400 rounded-full ">
                                    <Text className="text-lg text-white font-bold">{data?.pages[0].totalElements}</Text>
                                </View>
                            </View>
                            <Pressable
                                onPress={() =>
                                    showBottomSheet({
                                        children: <SortOptionsSheet currentSort={sortConfig} onSelect={setSortConfig}/>,
                                    })
                                }
                                className="items-center justify-center flex-row gap-2 bg-white dark:bg-background-dark border border-grey-200 dark:border-grey-800 rounded-full px-2.5 py-1">
                                <Icon size={15} name="funnel" color={Colors.primary[500]}
                                      />
                                <Text className="text-sm text-primary-500">{t('friends.sortBy')}</Text>
                            </Pressable>
                        </View>
                    }
                    ListEmptyComponent={<Text
                        className="text-center text-grey-500 dark:text-grey-400">{t('friends.noFriendsFound')}</Text>}
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <View
                                className="bg-white dark:bg-background-dark p-5 rounded-2xl border border-grey-200 dark:border-grey-800">
                                <View className="flex-row items-center gap-4">
                                    <Skeleton width={56} height={56} borderRadius={28}/>
                                    <View className="flex-1 gap-2">
                                        <Skeleton width="70%" height={18}/>
                                        <Skeleton width="40%" height={14}/>
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
    friendCard: {
        shadowColor: "#1FBAC3",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
});
