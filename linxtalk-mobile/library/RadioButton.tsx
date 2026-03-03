import { View, Pressable, StyleSheet, ViewStyle } from "react-native";
import { Colors } from "@/constants/theme";
import Animated, { useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import React from "react";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface RadioButtonProps {
    selected: boolean;
    onPress: () => void;
    children: React.ReactNode;
    style?: ViewStyle;
}

export default function RadioButton({ selected, onPress, children, style }: RadioButtonProps) {
    const bgStyle = useAnimatedStyle(() => ({
        backgroundColor: withTiming(
            selected ? Colors.primary["50"] : "rgba(255,255,255,0)",
            { duration: 300, easing: Easing.out(Easing.cubic) }
        ),
    }));

    const borderStyle = useAnimatedStyle(() => ({
        borderColor: withTiming(
            selected ? Colors.primary["500"] : Colors.grey["300"],
            { duration: 300, easing: Easing.out(Easing.cubic) }
        ),
    }));

    const dotStyle = useAnimatedStyle(() => ({
        opacity: withTiming(selected ? 1 : 0, { duration: 250, easing: Easing.out(Easing.cubic) }),
        transform: [{ scale: withTiming(selected ? 1 : 0, { duration: 250, easing: Easing.out(Easing.cubic) }) }],
    }));

    return (
        <AnimatedPressable
            onPress={onPress}
            style={[styles.container, bgStyle, style]}
        >
            <View style={styles.content}>
                {children}
            </View>
            <Animated.View style={[styles.outer, borderStyle]}>
                <Animated.View style={[styles.inner, dotStyle]} />
            </Animated.View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 16,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    outer: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    inner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary["500"],
    },
});
