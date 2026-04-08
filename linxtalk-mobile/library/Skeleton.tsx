import React, { useEffect, useState } from 'react';
import { ViewProps, View, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export default function Skeleton({
  width,
  height,
  borderRadius = 8,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const progress = useSharedValue(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [layoutWidth, setLayoutWidth] = useState(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const w = layoutWidth || 300;
    return {
      transform: [
        {
          translateX: interpolate(progress.value, [0, 1], [-w, w]),
        },
      ],
    };
  });

  const backgroundColor = isDark ? Colors.grey['800'] : Colors.grey['200'];
  const highlightColor = isDark ? Colors.grey['600'] : Colors.grey['100'];

  return (
    <View
      onLayout={(e) => {
        setLayoutWidth(e.nativeEvent.layout.width);
      }}
      className={`overflow-hidden ${className || ''}`}
      style={[
        { width: width as any, height: height as any, borderRadius, backgroundColor },
        style,
      ]}
      {...rest}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={[backgroundColor, highlightColor, backgroundColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}
