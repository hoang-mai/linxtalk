import { Pressable, PressableProps, Text, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

type ButtonVariant = "primary" | "outline" | "soft";

type IconProp = React.ReactNode | keyof typeof Ionicons.glyphMap;

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  className?: string;
  loading?: boolean;
  leftIcon?: IconProp;
  rightIcon?: IconProp;
  onPress?: () => void;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string; pressed: string }> = {
  primary: {
    container: "bg-primary-500",
    text: "text-white font-semibold",
    pressed: "bg-primary-600",
  },
  outline: {
    container: "bg-white border border-primary-500",
    text: "text-primary-600 font-semibold",
    pressed: "bg-primary-50 border border-primary-500",
  },
  soft: {
    container: "bg-primary-50",
    text: "text-primary-600 font-semibold",
    pressed: "bg-primary-100",
  },
};

export default function Button({
  title,
  variant = "primary",
  className = "",
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const styles = variantStyles[variant];

  const containerClass = disabled
    ? `${styles.container} opacity-50`
    : pressed
      ? styles.pressed
      : styles.container;

  const renderIcon = (icon: IconProp) => {
    if (!icon) return null;
    if (typeof icon === "string") {
      return (
        <Ionicons
          name={icon as any}
          size={24}
          color={variant === "primary" ? "#FFFFFF" : Colors.primary["500"]}
        />
      );
    }
    return icon;
  };

  return (
    <Pressable
      className={`flex-row items-center justify-center rounded-xl py-3 px-6 gap-2 ${containerClass} ${className}`}
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      {...rest}
    >
      {renderIcon(leftIcon)}
      <Text className={`text-xl ${styles.text}`}>{title}</Text>
      {renderIcon(rightIcon)}
    </Pressable>
  );
}