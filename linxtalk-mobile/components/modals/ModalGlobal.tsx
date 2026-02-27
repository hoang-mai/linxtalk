import { View, Text, Modal, Pressable, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useModalStore } from "@/store/modal-store";
import { BlurView } from "expo-blur";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

export default function ModalGlobal() {
    const { visible, title, children, height, hideModal } = useModalStore();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.8);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={hideModal}
        >
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center" }}
            >
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                <View className="bg-white mx-10 p-8 rounded-2xl" style={height ? { height } : undefined}>
                    <Animated.View style={[{ position: 'absolute', top: 12, right: 12, zIndex: 10 }, animatedStyle]}>
                        <Pressable
                            onPress={hideModal}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            className="p-1"
                        >
                            <Ionicons name="close" size={24} color="#9CA3AF" />
                        </Pressable>
                    </Animated.View>
                    {title && <Text className="text-xl font-medium mb-4 text-center">{title}</Text>}
                    {children}
                </View>
            </KeyboardAwareScrollView>
        </Modal>
    );
}