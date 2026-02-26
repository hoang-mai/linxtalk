import { View, Text, TextInput, TextInputProps, TouchableOpacity } from "react-native";
import React, { useState, forwardRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { Colors } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  loading?: boolean;
  disable?: boolean;
  required?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  isBlurAndSubmit?: boolean;
}

const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  loading,
  disable,
  required,
  icon,
  placeholder,
  secureTextEntry,
  onFocus,
  onBlur,
  isBlurAndSubmit,
  ...rest
}, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const focused = useSharedValue(0);

  const handleFocus = (e: any) => {
    focused.value = withTiming(1, { duration: 200 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    focused.value = withTiming(0, { duration: 200 });
    onBlur?.(e);
  };

  const labelStyle = useAnimatedStyle(() => ({
    color: error ? interpolateColor(focused.value, [0, 1], [Colors.red["400"], Colors.red["600"]])
      : disable
        ? Colors.grey["600"]
        : interpolateColor(focused.value, [0, 1], [Colors.primary["400"], Colors.primary["600"]]),
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error ? interpolateColor(focused.value, [0, 1], [Colors.red["400"], Colors.red["600"]])
      : disable
        ? Colors.grey["600"]
        : interpolateColor(focused.value, [0, 1], [Colors.primary["400"], Colors.primary["600"]]),
    borderWidth: 1.5,
    borderRadius: 12,
    width: '100%',
  }));

  return (
    <View className={"flex flex-col w-full gap-1 relative"}>
      {label && (
        <View
          className={"flex flex-row gap-1 absolute -top-2.5 left-4 z-10 bg-white px-1 rounded-md"}>
          <Animated.Text
            style={labelStyle}
          >
            <Text className={"text-sm font-medium"}>{label}</Text>
          </Animated.Text>
          {required && <Text className={disable ? "text-grey-600" : "text-red-500"}> *</Text>}
        </View>
      )}
      <View className={"relative flex flex-row items-center bg-white"}>
        <Animated.View style={borderStyle}>
          <TextInput
            ref={ref}
            className={`w-full rounded-xl py-4 text-base text-black ${icon ? "pl-10" : "pl-4"} ${secureTextEntry ? "pr-12" : "pr-4"} ${disable ? "bg-gray-50" : error ? "bg-red-50" : "bg-white"}`}
            placeholder={placeholder}
            placeholderTextColor={Colors.grey["600"]}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            onFocus={disable ? undefined : handleFocus}
            onBlur={disable ? undefined : handleBlur}
            editable={!disable && !loading}
            submitBehavior={isBlurAndSubmit ? "blurAndSubmit" : "submit"}
            {...rest}
          />
        </Animated.View>
        {icon && (
          <View className="absolute left-3 top-0 bottom-0 justify-center">
            <Ionicons
              color={disable ? Colors.grey["600"] : Colors.grey["500"]}
              name={icon}
              size={20} />
          </View>
        )}
        {secureTextEntry && (
          <TouchableOpacity
            className={"absolute right-3 top-0 bottom-0 justify-center"}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={disable ? Colors.grey["600"] : Colors.grey["500"]}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className={"text-xs text-red-600"}>{error}</Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

export default Input;
