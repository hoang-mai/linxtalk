import { TabTriggerSlotProps } from 'expo-router/ui';
import { Ref, useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolateColor,
    withTiming,
} from 'react-native-reanimated';
import { Colors } from "@/constants/theme";


export type TabButtonProps = TabTriggerSlotProps & {
    icon?: keyof typeof Ionicons.glyphMap;
    ref?: Ref<View>;
};

export function TabButton({ icon, children, isFocused, style, ...props }: TabButtonProps) {
    const active = useSharedValue(isFocused ? 1 : 0);

    useEffect(() => {
        active.value = withTiming(isFocused ? 1 : 0, {
            duration: 120,
        });
    }, [active, isFocused]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        width: '100%',
        height: '100%',
        transform: [{ scale: active.value }],
        opacity: active.value,
    }));

    const labelStyle = useAnimatedStyle(() => ({
        color: interpolateColor(active.value, [0, 1], [Colors.grey["500"], Colors.primary["500"]]),
    }));

    return (
        <View
            className={"h-14 flex-1 m-1 rounded-full relative"}
        >
            <Animated.View className={"absolute -z-10 rounded-full bg-primary-100"}
                style={animatedContainerStyle}>
            </Animated.View>
            <Pressable
                {...props}
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 16
                }}
            >
                <Ionicons
                    name={(isFocused ? icon?.replace("outline", "sharp") : icon) as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={isFocused ? Colors.primary["500"] : Colors.grey["500"]}
                />

                <Animated.Text style={labelStyle} className={"text-xs font-semibold"}>
                    {children}
                </Animated.Text>
            </Pressable>
        </View>
    );
}
