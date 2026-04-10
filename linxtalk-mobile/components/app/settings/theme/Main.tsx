import { View, Text } from "react-native";
import { Colors } from "@/constants/theme";
import { useThemeStore, ThemeMode } from "@/store/theme-store";
import RadioButton from "@/library/RadioButton";
import { THEMES } from "@/constants/constant";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";

export default function Main() {
    const { theme, setTheme } = useThemeStore();
    const { t } = useTranslation();

    return (
        <View className="flex-1 px-4 pt-6">
            <View className="rounded-3xl bg-white dark:bg-background-dark p-4 gap-2">
                {THEMES.map((item) => {
                    const isSelected = theme === item.code;
                    return (
                        <RadioButton
                            key={item.code}
                            selected={isSelected}
                            onPress={() => setTheme(item.code as ThemeMode)}
                        >
                            <View className="flex-row items-center gap-4">
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center"
                                    style={{ backgroundColor: item.iconBg }}
                                >
                                    <Ionicons
                                        name={item.icon as keyof typeof Ionicons.glyphMap}
                                        size={22}
                                        color={item.iconColor}
                                    />
                                </View>
                                <Text
                                    className={`text-lg font-medium ${isSelected ? "text-primary-500" : "text-grey-800 dark:text-grey-100"}`}
                                >
                                    {t(item.labelKey)}
                                </Text>
                            </View>
                        </RadioButton>
                    );
                })}
            </View>
        </View>
    );
}
