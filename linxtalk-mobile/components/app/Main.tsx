import { SectionList, Pressable, ScrollView, Text, View, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/constant";
import { CONVERSATION, FRIEND } from "@/constants/api";
import { get } from "@/services/axios";
import { ConversationResponse, FriendResponse } from "@/constants/type";
import { useToastStore } from "@/store/toast-store";
import Skeleton from "@/library/Skeleton";
import { formatRelativeTime } from "@/utils/fn-common";
import { useEffect, useMemo } from "react";
import { queryClient } from "@/components/providers/query-client";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import Icon from "@/library/Icon";
import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";

export default function Main() {
  const { showToast } = useToastStore();
  const { t } = useTranslation();
  const isDark = useColorScheme() === "dark";
  const router = useRouter();

  // Query 1: Conversations
  const {
    data: conversationData,
    isLoading: isConversationLoading,
    fetchNextPage: fetchNextConversationPage,
    isFetchingNextPage: isFetchingNextConversationPage,
    hasNextPage: hasNextConversationPage
  } = useInfiniteQuery({
    queryKey: [QUERY_KEYS.CONVERSATIONS],
    staleTime: Infinity,
    initialPageParam: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: ({ pageParam }) => {
      let url = `${CONVERSATION}?pageNo=${pageParam}`;
      return get<BaseResponse<PageResponse<ConversationResponse>>>(url)
        .then((res) => res.data.data)
        .catch((error: Error) => {
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
  });

  // Query 2: Suggested Friends (hasChatted = false)
  const {
    data: friendData,
    isLoading: isFriendLoading,
    fetchNextPage: fetchNextFriendPage,
    isFetchingNextPage: isFetchingNextFriendPage,
    hasNextPage: hasNextFriendPage
  } = useInfiniteQuery({
    queryKey: [QUERY_KEYS.FRIENDS_NO_CHAT],
    staleTime: Infinity,
    initialPageParam: 0,
    enabled: !hasNextConversationPage,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: ({ pageParam }) => {
      let url = `${FRIEND}?hasChatted=false&pageNo=${pageParam}`;
      return get<BaseResponse<PageResponse<FriendResponse>>>(url)
        .then((res) => res.data.data)
        .catch((error: Error) => {
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
  });

  // Query 3: Online Friends
  const { data: onlineFriends, isLoading: isOnlineFriendsLoading } = useQuery({
    queryKey: [QUERY_KEYS.FRIENDS_ONLINE],
    staleTime: 60 * 1000,
    queryFn: () => {
      return get<BaseResponse<PageResponse<FriendResponse>>>(`${FRIEND}/online`)
        .then((res) => res.data.data)
        .catch((error: Error) => {
          showToast({ message: error.message, type: "error" });
          throw error;
        });
    },
  });

  useEffect(() => {
    return () => {
      queryClient.setQueriesData({ queryKey: [QUERY_KEYS.CONVERSATIONS] }, (oldData: any) => {
        if (!oldData?.pages || !oldData?.pageParams) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.slice(0, 2),
          pageParams: oldData.pageParams.slice(0, 2),
        };
      });
      queryClient.setQueriesData({ queryKey: [QUERY_KEYS.FRIENDS, "suggested"] }, (oldData: any) => {
        if (!oldData?.pages || !oldData?.pageParams) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.slice(0, 2),
          pageParams: oldData.pageParams.slice(0, 2),
        };
      });
    };
  }, []);

  const sections = useMemo(() => {
    const result: any[] = [];

    const conversations = conversationData?.pages.flatMap(page => page?.data).filter(Boolean) || [];
    if (conversations.length > 0) {
      result.push({
        data: conversations,
        type: 'CONVERSATION'
      });
    }

    const friends = friendData?.pages.flatMap(page => page?.data).filter(Boolean) || [];
    if (friends.length > 0) {
      result.push({
        data: friends,
        type: 'FRIEND'
      });
    }

    return result;
  }, [conversationData, friendData]);

  const handleEndReached = () => {
    if (hasNextConversationPage && !isFetchingNextConversationPage) {
      fetchNextConversationPage();
    } else if (!hasNextConversationPage && hasNextFriendPage && !isFetchingNextFriendPage) {
      fetchNextFriendPage();
    }
  };

  const isGlobalLoading = isConversationLoading || (isFriendLoading && !conversationData);

  return (
    <SafeAreaView className="flex-1 px-5  bg-white dark:bg-background-dark">
      <SectionList
        sections={isGlobalLoading ? [] : sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100, gap: 16 }}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View className="flex-row items-center justify-between mb-4">
              <Image
                source={require("@/assets/images/linxtalk-logo.svg")}
                style={{ width: 120, height: 40 }}
                contentFit="contain"
              />
              <Pressable className="p-2">
                <Image
                  source={require("@/assets/icons/create-conversation.png")}
                  contentFit="contain"
                  style={{ width: 20, height: 20, tintColor: isDark ? "white" : "black" }}
                />
              </Pressable>
            </View>
            <Pressable
              onPress={() => router.push("/friends/search-friends")}
              className="flex-row items-center justify-start gap-2 px-4 py-2 bg-white dark:bg-background-dark rounded-full border border-grey-200 dark:border-grey-800"
            >
              <Icon name="search-outline" size={24} color={Colors.grey["400"]} darkColor={Colors.grey["200"]} />
              <Text className="text-grey-500 dark:text-grey-400">{t('friends.searchFriends')}</Text>
            </Pressable>

            {/* Online Friends Horizontal List */}
            <View className="mt-6">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 16 }}
              >
                {isOnlineFriendsLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <View key={`online-skeleton-${index}`} className="items-center gap-2">
                      <Skeleton width={60} height={60} borderRadius={30} />
                      <Skeleton width={50} height={12} />
                    </View>
                  ))
                ) : (
                  onlineFriends?.data.map((friend) => (
                    <Pressable key={friend.id} className="items-center gap-2 w-16">
                      <View className="relative">
                        <View className="w-14 h-14 rounded-full bg-grey-200 overflow-hidden">
                          <Image
                            source={friend.avatarUrl}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                            transition={200}
                          />
                        </View>
                        <View className="absolute bottom-1 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-background-dark" />
                      </View>
                      <Text className="text-xs text-grey-900 dark:text-grey-100 font-medium" numberOfLines={1}>
                        {friend.displayName.split(' ')[0]}
                      </Text>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          </>
        }
        ListEmptyComponent={
          isGlobalLoading ? (
            <View className="gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <View key={`loading-skeleton-${index}`} className="flex-row items-center gap-4 py-2">
                  <Skeleton width={64} height={64} borderRadius={32} />
                  <View className="flex-1 gap-2">
                    <View className="flex-row justify-between items-center">
                      <Skeleton width="50%" height={20} />
                      <Skeleton width="15%" height={14} />
                    </View>
                    <Skeleton width="80%" height={16} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center pt-20 px-5">
              <Text className="text-grey-500 dark:text-grey-400 text-center">{t('conversations.noConversationsFound')}</Text>
            </View>
          )
        }
        renderItem={({ item, section }) => {
          if (section.type === 'CONVERSATION') {
            const conversation = item as ConversationResponse;
            return (
              <Pressable className="flex-row items-center gap-4 py-2">
                <View className="relative">
                  <View className="w-16 h-16 rounded-full bg-grey-200 overflow-hidden">
                    <Image
                      source={conversation.avatarUrl}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>
                </View>
                <View className="flex-1 border-b border-grey-100 dark:border-grey-800 pb-3">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-lg font-bold text-grey-900 dark:text-grey-100" numberOfLines={1}>
                      {conversation.name}
                    </Text>
                    <Text className="text-xs text-grey-500 dark:text-grey-400">
                      {formatRelativeTime(conversation.updatedAt)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-grey-500 dark:text-grey-400 flex-1" numberOfLines={1}>
                      {conversation.lastMessage?.content || t('conversations.noMessage')}
                    </Text>
                    {conversation.unreadCount > 0 && (
                      <View className="bg-primary-500 min-w-[20] h-5 rounded-full items-center justify-center px-1.5 ml-2">
                        <Text className="text-[10px] text-white font-bold">{conversation.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          } else {
            const friend = item as FriendResponse;
            return (
              <Pressable className="flex-row items-center gap-4 mb-2">
                <View className="relative">
                  <View className="w-16 h-16 rounded-full bg-grey-200 overflow-hidden">
                    <Image
                      source={friend.avatarUrl}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>
                  {friend.isOnline && (
                    <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-background-dark" />
                  )}
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-lg font-bold text-grey-900 dark:text-grey-100" numberOfLines={1}>
                      {friend.displayName}
                    </Text>
                  </View>
                  <Text className="text-sm text-grey-500 dark:text-grey-400" numberOfLines={1}>
                    {t('conversations.startChatting', { name: friend.displayName })}
                  </Text>
                </View>
              </Pressable>
            );
          }
        }}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          (isFetchingNextConversationPage || isFetchingNextFriendPage) ? (
            <View className="gap-4 py-4">
              <View className="flex-row items-center gap-4">
                <Skeleton width={64} height={64} borderRadius={32} />
                <View className="flex-1 gap-2">
                  <Skeleton width="50%" height={20} />
                  <Skeleton width="80%" height={16} />
                </View>
              </View>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});