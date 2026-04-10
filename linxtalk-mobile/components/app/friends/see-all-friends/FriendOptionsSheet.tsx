import { FriendRequestResponse } from "@/constants/type";
import { useBottomSheetStore } from "@/store/bottom-sheet-store";
import { Pressable, Text, View } from "react-native";

interface FriendProps{
    friendRequestResponse:FriendRequestResponse;
}

export default function FriendOptionsSheet({friendRequestResponse}:FriendProps) {
    const { hideBottomSheet } = useBottomSheetStore();
    return (
        <View className="gap-2 pb-2">
            <Pressable className="py-3" onPress={hideBottomSheet}>
                <Text className="text-base text-grey-900 dark:text-grey-100">View profile</Text>
            </Pressable>
            <Pressable className="py-3" onPress={hideBottomSheet}>
                <Text className="text-base text-grey-900 dark:text-grey-100">Send message</Text>
            </Pressable>
            <Pressable className="py-3" onPress={hideBottomSheet}>
                <Text className="text-base text-red-500">Remove friend</Text>
            </Pressable>
        </View>
    );
}
