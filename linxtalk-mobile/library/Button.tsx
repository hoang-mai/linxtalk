import { Pressable, PressableProps, Text } from "react-native";
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

const variantStyles: Record<
  ButtonVariant,
  {
    container: string;
    text: string;
    pressed: string;
    disabled: { container: string; text: string };
  }
> = {
  primary: {
    container: "bg-primary-500",
    text: "text-white font-semibold",
    pressed: "bg-primary-600",
    disabled: { container: "bg-grey-300", text: "text-white font-semibold" },
  },
  outline: {
    container: "bg-white border border-primary-500",
    text: "text-primary-600 font-semibold",
    pressed: "bg-primary-50 border border-primary-500",
    disabled: {
      container: "bg-white border border-grey-200",
      text: "text-grey-300 font-semibold",
    },
  },
  soft: {
    container: "bg-primary-50",
    text: "text-primary-600 font-semibold",
    pressed: "bg-primary-100",
    disabled: { container: "bg-grey-200", text: "text-grey-400 font-semibold" },
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
    ? styles.disabled.container
    : pressed
    ? styles.pressed
    : styles.container;

  const textClass = disabled ? styles.disabled.text : styles.text;

  const renderIcon = (icon: IconProp) => {
    if (!icon) return null;
    if (typeof icon === "string") {
      const baseColor = variant === "primary" ? "#FFFFFF" : Colors.primary["500"];
      const disabledColor = variant === "primary" ? "#FFFFFF" : Colors.grey["400"];
      const iconColor = disabled ? disabledColor : baseColor;

      return (
        <Ionicons
          name={icon as any}
          size={24}
          color={iconColor}
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
      <Text className={`text-xl ${textClass}`}>{title}</Text>
      {renderIcon(rightIcon)}
    </Pressable>
  );
}