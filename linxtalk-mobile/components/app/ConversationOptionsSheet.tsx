import { ConversationResponse, FriendResponse } from "@/constants/type";
import { useBottomSheetStore } from "@/store/bottom-sheet-store";
import { Pressable, Text, View, useColorScheme, Alert } from "react-native";
import { formatRelativeTime } from "@/utils/fn-common";
import Icon from "@/library/Icon";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import Divide from "@/library/Divide";
import { useTranslation } from "react-i18next";


type SheetItemType = "CONVERSATION" | "FRIEND";
type SheetItem = ConversationResponse | FriendResponse;

interface ConversationProps {
    type: SheetItemType;
    conversation: SheetItem | null;
}

interface ActionItem {
    icon: string | number;
    title: string;
    description: string;
    color: string;
    colorDark: string;
    onPress: () => void;
}

export default function ConversationOptionsSheet({ type, conversation }: ConversationProps) {
    const { hideBottomSheet } = useBottomSheetStore();
    const isDark = useColorScheme() === "dark";
    const { t } = useTranslation();

    const conversationData = type === "CONVERSATION" ? (conversation as ConversationResponse | null) : null;
    const friendData = type === "FRIEND" ? (conversation as FriendResponse | null) : null;

    const isPinned = conversationData?.isPinned ?? false;
    const isMuted = conversationData?.isMuted ?? false;
    const targetName = conversationData?.name ?? friendData?.displayName ?? "Bản nháp";

    const actionItems: ActionItem[] = [
        {
            icon: isPinned ? require("@/assets/icons/unpin.png") : require("@/assets/icons/pin.png"),
            title: isPinned ? t('conversations.unpin') : t('conversations.pin'),
            description: isPinned ? t('conversations.unpinDescription') : t('conversations.pinDescription'),
            color: Colors.grey[900],
            colorDark: Colors.grey[50],
            onPress: () => {
                // TODO: Gọi API Pin/Unpin
                hideBottomSheet();
            },
        },
        {
            icon: isMuted ? "volume-high" : "volume-mute",
            title: isMuted ? t('conversations.unmute') : t('conversations.mute'),
            description: isMuted ? t('conversations.unmuteDescription') : t('conversations.muteDescription'),
            color: Colors.grey[900],
            colorDark: Colors.grey[50],
            onPress: () => {
                // TODO: Gọi API Mute/Unmute
                hideBottomSheet();
            },
        },
        {
            icon: "archive-outline",
            title: t('conversations.archive'),
            description: t('conversations.archiveDescription'),
            color: Colors.grey[900],
            colorDark: Colors.grey[50],
            onPress: () => {
                // TODO: Gọi API Archive
                hideBottomSheet();
            },
        },
        {
            icon: "ban-outline",
            title: t('conversations.block'),
            description: t('conversations.blockDescription'),
            color: Colors.grey[900],
            colorDark: Colors.grey[50],
            onPress: () => {
                // TODO: Gọi API Block
                Alert.alert(t('conversations.block'), t('conversations.blockDescription'), [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('conversations.block'), style: 'destructive', onPress: hideBottomSheet }
                ]);
            },
        },
        {
            icon: "trash-outline",
            title: t('conversations.delete'),
            description: t('conversations.deleteDescription'),
            color: "#FF0000",
            colorDark: "#FF0000",
            onPress: () => {
                // TODO: Gọi API Delete
                Alert.alert(t('conversations.delete'), t('conversations.deleteDescription'), [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('conversations.delete'), style: 'destructive', onPress: hideBottomSheet }
                ]);
            },
        },
    ];

    return (
        <View >
            {/* Header info */}
            <View className="p-2">
                <View className="flex-row items-center gap-4">
                    <View className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden flex items-center justify-center bg-grey-200">
                        {conversation?.avatarUrl ? (
                            <Image
                                source={conversation.avatarUrl}
                                cachePolicy="memory-disk"
                                contentFit="cover"
                                style={{ width: '100%', height: '100%' }}
                            />
                        ) : (
                            <Text className="text-2xl font-bold text-white">
                                {targetName?.charAt(0)?.toUpperCase() || '?'}
                            </Text>
                        )}
                    </View>

                    <View className="flex-1">
                        <Text className="text-lg font-bold text-grey-900 dark:text-white mb-1" numberOfLines={1}>
                            {targetName}
                        </Text>
                        <Text className="text-sm text-grey-500 dark:text-grey-400" numberOfLines={1}>
                            {conversation ? formatRelativeTime(conversation.updatedAt) : ""}
                        </Text>
                    </View>
                </View>
            </View>
            <Divide />

            {/* Actions List */}
            <View className="p-4 gap-4">
                {actionItems.map((item, index) => (
                    <Pressable
                        key={index}
                        onPress={item.onPress}
                        className="active:opacity-70"
                    >
                        <View className="flex-row items-start gap-4 rounded-xl">
                            {typeof item.icon === "string" ? (
                                <Icon name={item.icon as any} size={24} color={item.color} darkColor={item.colorDark} />
                            ) : (
                                <Image
                                    source={item.icon}
                                    contentFit="contain"
                                    style={{ width: 24, height: 24, tintColor: isDark ? item.colorDark : item.color }}
                                />
                            )}

                            <View className="flex-1">
                                <Text style={{ color: isDark ? item.colorDark : item.color }} className="text-base font-semibold mb-1">
                                    {item.title}
                                </Text>
                                <Text className="text-sm text-grey-500 dark:text-grey-400 leading-5">
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
