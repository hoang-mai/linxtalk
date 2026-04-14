import { Pressable, PressableProps, Text } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "outline" | "soft";

type IconProp = React.ReactNode | keyof typeof Ionicons.glyphMap;

interface ButtonProps extends PressableProps {
    title?: string;
    variant?: ButtonVariant;
    className?: string;
    textClassName?: string;
    loading?: boolean;
    leftIcon?: IconProp;
    rightIcon?: IconProp;
    leftIconColor?: string;
    rightIconColor?: string;
    leftIconSize?: number;
    rightIconSize?: number;
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
        disabled: { container: "bg-grey-300 dark:bg-grey-700", text: "text-white font-semibold" },
    },
    secondary: {
        container: "bg-white dark:bg-background-dark",
        text: "text-primary-500 font-semibold",
        pressed: "bg-grey-50 dark:bg-grey-800",
        disabled: { container: "bg-grey-200 dark:bg-grey-800", text: "text-grey-400 font-semibold" },
    },
    outline: {
        container: "bg-white dark:bg-background-dark border border-primary-500",
        text: "text-primary-600 dark:text-primary-400 font-semibold",
        pressed: "bg-primary-50 dark:bg-primary-900 border border-primary-500",
        disabled: {
            container: "bg-white dark:bg-background-dark border border-grey-200 dark:border-grey-700",
            text: "text-grey-300 dark:text-grey-600 font-semibold",
        },
    },
    soft: {
        container: "bg-primary-50 dark:bg-primary-900",
        text: "text-primary-600 dark:text-primary-400 font-semibold",
        pressed: "bg-primary-100 dark:bg-primary-800",
        disabled: { container: "bg-grey-200 dark:bg-grey-800", text: "text-grey-400 font-semibold" },
    },
};

export default function Button({
    title,
    variant = "primary",
    className = "",
    textClassName = "",
    loading = false,
    leftIcon,
    rightIcon,
    leftIconColor,
    rightIconColor,
    leftIconSize,
    rightIconSize,
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

    const renderIcon = (icon: IconProp, customColor?: string, customSize?: number) => {
        if (!icon) return null;
        if (typeof icon === "string") {
            const baseColor = variant === "primary" ? "#FFFFFF" : Colors.primary["500"];
            const disabledColor = variant === "primary" ? "#FFFFFF" : Colors.grey["400"];
            const iconColor = disabled ? disabledColor : (customColor || baseColor);

            return (
                <Ionicons
                    name={icon as any}
                    size={customSize || 24}
                    color={iconColor}
                />
            );
        }
        return icon;
    };

    return (
        <Pressable
            className={`flex-row items-center justify-center rounded-full py-3 px-6 gap-2 ${containerClass} ${className}`}
            disabled={disabled || loading}
            onPress={onPress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            {...rest}
        >
            {renderIcon(leftIcon, leftIconColor, leftIconSize)}
            {title ? <Text numberOfLines={1} className={`${textClassName} 'text-xl' ${textClass}`}>{title}</Text> : null}
            {renderIcon(rightIcon, rightIconColor, rightIconSize)}
        </Pressable>
    );
}