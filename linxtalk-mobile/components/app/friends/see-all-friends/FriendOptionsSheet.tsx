import { FriendRequestResponse } from "@/constants/type";
import { useBottomSheetStore } from "@/store/bottom-sheet-store";
import { Pressable, Text, View, useColorScheme } from "react-native";
import { formatFriendDuration } from "@/utils/fn-common";
import Icon from "@/library/Icon";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import Divide from "@/library/Divide";
import { useTranslation } from "react-i18next";

interface FriendProps{
    friendRequestResponse:FriendRequestResponse;
}

export default function FriendOptionsSheet({friendRequestResponse}:FriendProps) {
    const { hideBottomSheet } = useBottomSheetStore();
    const isDark = useColorScheme() === "dark";
    const { t } = useTranslation();

    const displayName = friendRequestResponse.sender?.displayName || '';

    const actionItems = [
        {
            icon: require("@/assets/icons/block-user.png"),
            title: t('friends.block', { name: displayName }),
            description: t('friends.blockDescription'),
            onPress: hideBottomSheet,
        },
        {
            icon: require("@/assets/icons/remove-friend-user.png"),
            title: t('friends.remove', { name: displayName }),
            description: t('friends.removeDescription'),
            onPress: hideBottomSheet,
        },
    ];

    return (
        <View className=" rounded-t-3xl">
            {/* Profile Header */}
            <View className="p-4">
                <View className="flex-row items-center gap-4">
                    <View className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden flex items-center justify-center">
                        {friendRequestResponse.sender?.avatarUrl ? (
                            <Image
                                source={{ uri: friendRequestResponse.sender.avatarUrl }}
                                cachePolicy="memory-disk"
                                contentFit="cover"
                                style={{ width: '100%', height: '100%' }}
                            />
                        ) : (
                            <Text className="text-2xl font-bold text-white">
                                {friendRequestResponse.sender?.displayName?.charAt(0)?.toUpperCase() || '?'}
                            </Text>
                        )}
                    </View>

                    <View className="flex-1">
                        <Text className="text-lg font-bold text-grey-900 dark:text-white mb-1">
                            {friendRequestResponse.sender?.displayName}
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <Icon
                                name="checkmark-circle"
                                size={14}
                                color={Colors.primary[500]}
                            />
                            <Text className="text-xs text-grey-600 dark:text-grey-300 font-medium">
                                {friendRequestResponse.respondedAt
                                    ? t('friends.friendsFor', { duration: formatFriendDuration(friendRequestResponse.respondedAt) })
                                    : t('friends.friendsLabel')}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <Divide/>
            <Pressable className={"p-4 flex-row items-center gap-2"} onPress={hideBottomSheet}>
                <Icon name="chatbubble-ellipses-outline" size={20} color={Colors.grey[900]} darkColor={Colors.grey[50]}/>
                <Text className="text-base font-semibold text-grey-900 dark:text-white">{t('friends.chatFor', { name: displayName })}</Text>
                </Pressable>
            <Divide/>

            {/* Actions */}
            <View className="p-4 gap-2">
                {actionItems.map((item, index) => (
                    <Pressable
                        key={index}
                        onPress={item.onPress}
                        className="active:opacity-70"
                    >
                        <View className={`flex-row items-start gap-4  rounded-xl`}>
                                <Image
                                    source={item.icon}
                                    contentFit="contain"
                                    style={{ width: 20, height: 20, tintColor: isDark ? Colors.grey[50] : Colors.grey[900] }}
                                />

                            <View className="flex-1">
                                <Text className="text-base font-semibold text-grey-900 dark:text-grey-100 mb-1">
                                    {item.title}
                                </Text>
                                <Text className="text-sm text-grey-600 dark:text-grey-400 leading-5">
                                    {item.description}
                                </Text>
                            </View>

                        </View>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}
