import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, ScrollView, Text, View,StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import Button from "@/library/Button";
import Icon from "@/library/Icon";
import {useRouter} from "expo-router";
import {useMutation, useQuery} from "@tanstack/react-query";
import {get, patch} from "@/services/axios";
import {FriendRequestResponse, FriendResponse, UpdateFriendRequestStatusRequest} from "@/constants/type";
import {FRIEND, FRIEND_REQUEST} from "@/constants/api";
import {QUERY_KEYS} from "@/constants/constant";
import Skeleton from "@/library/Skeleton";
import {useToastStore} from "@/store/toast-store";
import {queryClient} from "@/components/providers/query-client";
import { formatRelativeTime } from "@/utils/fn-common";
import { useTranslation } from "react-i18next";


export default function Main() {
    const router = useRouter();
    const { showToast } = useToastStore();
    const { t } = useTranslation();


    const { data: friends, isLoading: isLoadingFriends } = useQuery({
        queryKey: [QUERY_KEYS.FRIENDS],
        staleTime: 30 * 1000,
        queryFn: () => {
            return get<BaseResponse<PageResponse<FriendResponse>>>(FRIEND)
                .then((res) => {
                    return res.data.data;
                }).catch((error: Error) => {
                    showToast({ message: error.message, type: "error" });
                })
        },
    });

    const { data, isLoading } = useQuery({
        queryKey: [QUERY_KEYS.INCOMING_FRIEND_REQUESTS],
        staleTime: 30 * 1000,
        queryFn: () => {
            return get<BaseResponse<PageResponse<FriendRequestResponse>>>(`${FRIEND_REQUEST}?pageSize=3`)
                .then((res) => {
                    return res.data.data;
                }).catch((error: Error) => {
                    showToast({ message: error.message, type: "error" });
                })
        },
    });

    const { mutate: updateStatus } = useMutation({
        mutationFn: async ({ data, friendRequestId }: {
            data: UpdateFriendRequestStatusRequest;
            friendRequestId: string
        }) => {
            const res = await patch<BaseResponse<FriendRequestResponse | null>>(`${FRIEND_REQUEST}/${friendRequestId}/status`, data);
            return res.data;
        },
        onMutate: async ({ data, friendRequestId }: { data: UpdateFriendRequestStatusRequest, friendRequestId: string }) => {
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.INCOMING_FRIEND_REQUESTS] });
            const previousData = queryClient.getQueryData([QUERY_KEYS.INCOMING_FRIEND_REQUESTS]);

            queryClient.setQueryData([QUERY_KEYS.INCOMING_FRIEND_REQUESTS], (old: any) => {
                if (!old || !old.data) return old;
                return {
                    ...old,
                    data: old.data.map((req: FriendRequestResponse) =>
                        req.id === friendRequestId ? { ...req, status: data.status } : req
                    ).filter((req: FriendRequestResponse) => req.status !== "REJECTED")
                };
            });

            return { previousData };
        },
        onError: (error: Error, variables: { data: UpdateFriendRequestStatusRequest, friendRequestId: string }, context: any) => {
            showToast({
                message: error.message,
                type: "error",
            });
            if (context?.previousData) {
                queryClient.setQueryData([QUERY_KEYS.INCOMING_FRIEND_REQUESTS], context.previousData);
            }
        }, 
        onSuccess:(_, variables) => {
            let keys: string[] = [QUERY_KEYS.INCOMING_FRIEND_REQUESTS_SEE_ALL];
            if(variables.data.status === "ACCEPTED") {
                keys.push(QUERY_KEYS.FRIENDS_SEE_ALL);
            }
            queryClient.invalidateQueries({ queryKey: keys });
        }
    });

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, marginHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-center text-grey-900 dark:text-grey-100">{t('friends.title')}</Text>
        <Pressable onPress={()=> router.push("/friends/search-friends")} className="flex-row items-center justify-start gap-2 p-4 bg-white dark:bg-background-dark rounded-full border border-grey-200 dark:border-grey-800 my-4">
          <Icon name="search-outline" size={24} color={Colors.grey["400"]} darkColor={Colors.grey["200"]} />
          <Text className="text-grey-500 dark:text-grey-400">{t('friends.searchFriends')}</Text>
        </Pressable>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <Text className="text-xl font-bold dark:text-white">{t('friends.requests')}</Text>
            {data?.totalElements !== undefined && data.totalElements > 0 && (
                <View className="px-2 flex items-center justify-center bg-primary-400 rounded-full ">
                  <Text className="text-lg text-white font-bold">{data.totalElements}</Text>
                </View>
            )}
          </View>
          <Button title={t('friends.seeAll')}
            variant="secondary"
            textClassName="text-sm"
            className="px-3.5"
            onPress={() => router.push("/friends/see-all")} />
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -20 }}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
          className="mt-4"
        >
          {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                  <View key={index} className="bg-white dark:bg-background-dark p-5 rounded-2xl border border-grey-200 dark:border-grey-800 w-[300px]">
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
              ))
          ) : data?.data && data.data.length > 0 ? (
              data.data.map((request) => (
                  <View key={request.id} style={styles.requestCard} className="bg-white dark:bg-background-dark p-5 rounded-2xl border border-grey-50 dark:border-grey-800 w-[300px]">
                      <View className="flex-row items-center gap-4 mb-4">
                          <View className="w-14 h-14 rounded-full bg-grey-200 overflow-hidden"/>
                        <View>
                          <Text className="text-lg font-bold text-grey-900 dark:text-grey-100">{request.sender?.displayName}</Text>
                          <Text className="text-grey-500 dark:text-grey-400">{request.sender?.username ? `@${request.sender?.username}` : request.sender?.email}</Text>
                        </View>
                      </View>

                      <View className="flex-col gap-2">
                          {request.status === "PENDING" && (
                            <>
                              <Text className="text-grey-500 dark:text-grey-400 text-sm">{request.message}</Text>
                              <View className="flex-row gap-3">
                                  
                                  <View className="flex-1">
                                      <Button title={t('friends.accept')} onPress={() => updateStatus({ data: { status: "ACCEPTED" }, friendRequestId: request.id })} />
                                  </View>
                                  <View className="flex-1">
                                      <Button variant="outline" title={t('friends.reject')} onPress={() => updateStatus({ data: { status: "REJECTED" }, friendRequestId: request.id })} />
                                  </View>
                                  </View>
                              </>
                          )}
                          {request.status === "ACCEPTED" && (
                              <Text className="mt-7 text-primary-600 dark:text-primary-400 font-semibold w-full bg-primary-50 dark:bg-primary-900 p-3 rounded-full text-center">{t('friends.friendsNow')}</Text>
                          )}
                      </View>
                  </View>
              ))
          ) : (
                <Text className="text-grey-500 dark:text-grey-400 pb-4">{t('friends.noRequestsFound')}</Text>
          )}
        </ScrollView>
        <View className="mt-4">
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex flex-row gap-4">
                <View className="flex-row items-center gap-4">
                    <Text className="text-xl font-bold dark:text-white">{t('friends.title')}</Text>
                </View>
                {friends?.totalElements !== undefined && friends.totalElements > 0 && (
                    <View className="px-2 flex items-center justify-center bg-primary-400 rounded-full ">
                    <Text className="text-lg text-white font-bold">{friends.totalElements}</Text>
                    </View>
                )}
                </View>
                <Button title={t('friends.seeAll')}
                    variant="secondary"
                    textClassName="text-sm"
                    className="px-3.5"
                    onPress={() => router.push("/friends/see-all-friends" as any)} />
            </View>
        {isLoadingFriends ? (
            <ScrollView contentContainerStyle={{ gap: 16 }} showsVerticalScrollIndicator={false}>
                {Array.from({ length: 3 }).map((_, index) => (
                    <View key={index} className="bg-white dark:bg-background-dark p-5 rounded-2xl border border-grey-200 dark:border-grey-800">
                        <Skeleton width={56} height={56} borderRadius={28} />
                    </View>
                ))}
            </ScrollView>
        ) : friends?.data && friends.data.length > 0 ? (
            <ScrollView contentContainerStyle={{ gap: 16 }} showsVerticalScrollIndicator={false}>
                {friends.data.map((friend) => (
                    <View key={friend.id} className="bg-white dark:bg-background-dark p-4 rounded-2xl flex-row items-center gap-4">
                        <View className="relative">
                            <View className="w-14 h-14 rounded-full bg-grey-200 overflow-hidden"/>
                            {friend.isOnline && (
                                <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-background-dark" />
                            )}
                        </View>
                        <View className="flex-1 flex ">
                            <Text className="text-lg font-bold text-grey-900 dark:text-grey-100">{friend.displayName}</Text>
                            <Text className="text-xs text-grey-500 dark:text-grey-400">{friend.isOnline ? t('friends.online') : friend.lastSeenAt ? formatRelativeTime(friend.lastSeenAt) : t('friends.offline')}</Text>
                        </View>
                        <Button 
                            leftIcon="chatbubble-ellipses-outline"
                            variant="soft"
                            textClassName="text-sm"
                            className="!px-2 !py-2"
                            onPress={() => {}}
                        />
                    </View>
                ))}
            </ScrollView>
        ) : (
            <Text className="text-grey-500 dark:text-grey-400 pb-4">{t('friends.noFriendsFound')}</Text>
        )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    