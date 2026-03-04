import { useColorScheme } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ComponentProps } from "react";

interface IconProps extends Omit<ComponentProps<typeof Ionicons>, "color"> {
    color: string;
    darkColor?: string;
}

export default function Icon({ color, darkColor, ...rest }: IconProps) {
    const colorScheme = useColorScheme();
    const resolvedColor = colorScheme === "dark" && darkColor ? darkColor : color;

    return <Ionicons color={resolvedColor} {...rest} />;
}
