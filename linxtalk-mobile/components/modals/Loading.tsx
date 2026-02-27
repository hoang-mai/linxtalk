import React, { useEffect } from "react";
import { View, Modal, StyleSheet } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withDelay,
    interpolateColor,
    Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Colors } from "@/constants/theme";
import { useLoadingStore } from "@/store/loading-store";
import { DOT_COUNT, DOT_SIZE, DOT_SPACING } from "@/constants/constant";


const PulsingDot = ({ index }: { index: number }) => {
    const scale = useSharedValue(0.6);
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        const delay = index * 200;

        scale.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 400, easing: Easing.out(Easing.cubic) }),
                    withTiming(0.6, { duration: 400, easing: Easing.inOut(Easing.cubic) }),
                    withTiming(0.6, { duration: 400 })
                ),
                -1
            )
        );

        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
                    withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.cubic) }),
                    withTiming(0.3, { duration: 400 })
                ),
                -1
            )
        );
    }, [index, scale, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    borderRadius: DOT_SIZE / 2,
                    backgroundColor: Colors.primary[400],
                    marginHorizontal: DOT_SPACING / 2,
                },
                animatedStyle,
            ]}
        />
    );
};

const AnimatedLetter = ({ letter, index }: { letter: string; index: number }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(8);
    const colorProgress = useSharedValue(0);

    useEffect(() => {
        const delay = index * 100;

        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
                    withTiming(1, { duration: 1400 }),
                    withTiming(0.5, { duration: 400, easing: Easing.inOut(Easing.cubic) }),
                    withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
                ),
                -1
            )
        );

        translateY.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(0, { duration: 600, easing: Easing.out(Easing.back(1.5)) }),
                    withTiming(0, { duration: 1400 }),
                    withTiming(2, { duration: 400, easing: Easing.inOut(Easing.cubic) }),
                    withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
                ),
                -1
            )
        );

        colorProgress.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 600 }),
                    withTiming(1, { duration: 1000 }),
                    withTiming(0, { duration: 800 }),
                    withTiming(1, { duration: 400 })
                ),
                -1
            )
        );
    }, [index, opacity, translateY, colorProgress]);

    const animatedStyle = useAnimatedStyle(() => {
        const color = interpolateColor(
            colorProgress.value,
            [0, 1],
            [Colors.primary[300], "#FFFFFF"]
        );
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
            color,
        };
    });

    return (
        <Animated.Text
            style={[
                {
                    fontSize: 28,
                    fontWeight: "700",
                    letterSpacing: 2,
                    textShadowColor: Colors.primary[500],
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 12,
                },
                animatedStyle,
            ]}
        >
            {letter}
        </Animated.Text>
    );
};

const RingPulse = ({ delay, size }: { delay: number; size: number }) => {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1.3, { duration: 2200, easing: Easing.out(Easing.cubic) }),
                    withTiming(0.8, { duration: 0 })
                ),
                -1
            )
        );

        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(0.5, { duration: 600, easing: Easing.out(Easing.cubic) }),
                    withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.cubic) }),
                    withTiming(0, { duration: 0 })
                ),
                -1
            )
        );
    }, [delay, scale, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: 1.5,
                    borderColor: Colors.primary[400],
                },
                animatedStyle,
            ]}
        />
    );
};

export default function Loading() {
    const { visible } = useLoadingStore();
    const letters = "Linx".split("");

    return (
        <Modal transparent={true} visible={visible} animationType="fade">
            <View style={styles.container}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.content}>
                    {/* Pulsing rings */}
                    <RingPulse delay={0} size={120} />
                    <RingPulse delay={1000} size={120} />

                    {/* Brand text */}
                    <View style={styles.textRow}>
                        {letters.map((letter, index) => (
                            <AnimatedLetter key={index} letter={letter} index={index} />
                        ))}
                    </View>

                    {/* Dots */}
                    <View style={styles.dotsRow}>
                        {Array.from({ length: DOT_COUNT }).map((_, i) => (
                            <PulsingDot key={i} index={i} />
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        alignItems: "center",
        justifyContent: "center",
        width: 140,
        height: 140,
    },
    textRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    dotsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 14,
    },
});

