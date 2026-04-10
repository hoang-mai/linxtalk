import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useBottomSheetStore } from "@/store/bottom-sheet-store";

const CLOSE_THRESHOLD = 120;

export default function BottomSheet() {
    const { visible, title, children, closeOnBackdropPress, hideBottomSheet } = useBottomSheetStore();
    const insets = useSafeAreaInsets();
    const [mounted, setMounted] = useState(visible);
    const translateY = useSharedValue(500);
    const backdropOpacity = useSharedValue(0);

    useEffect(() => {
        const show = () => {
            setMounted(true);
            translateY.value = withTiming(0);
            backdropOpacity.value = withTiming(1, { duration: 220 });
        };
        const hide = () => {
            translateY.value = withTiming(500, { duration: 220 });
            backdropOpacity.value = withTiming(0, { duration: 220 }, (finished) => {
                if (finished) {
                    runOnJS(setMounted)(false);
                }
            });
        };

        if (visible) {
            show();
        } else if (mounted) {
            hide();
        }
    }, [visible, mounted, backdropOpacity, translateY]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 0) {
                translateY.value = event.translationY;
                backdropOpacity.value = Math.max(0, 1 - event.translationY / 220);
            }
        })
        .onEnd((event) => {
            if (event.translationY > CLOSE_THRESHOLD || event.velocityY > 900) {
                runOnJS(hideBottomSheet)();
            } else {
                translateY.value = withTiming(0);
                backdropOpacity.value = withTiming(1, { duration: 180 });
            }
        });

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    if (!mounted) return null;

    return (
        <Modal transparent visible={mounted} animationType="none" onRequestClose={hideBottomSheet}>
            <View style={styles.container}>
                <Animated.View style={[styles.overlay, overlayStyle]}>
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={closeOnBackdropPress ? hideBottomSheet : undefined}
                    />
                </Animated.View>

                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }, sheetStyle]}>
                        <View style={styles.handle} />
                        {title ? (
                            <Text className="text-lg font-bold text-grey-900 dark:text-grey-100 mb-3">{title}</Text>
                        ) : null}
                        {children}
                    </Animated.View>
                </GestureDetector>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-end",
    },
    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    sheet: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    handle: {
        width: 44,
        height: 5,
        borderRadius: 999,
        backgroundColor: "#D1D5DB",
        alignSelf: "center",
        marginBottom: 12,
    },
});
