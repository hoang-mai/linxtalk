import { View, Text } from "react-native";
import { useLanguageStore } from "@/store/language-store";
import RadioButton from "@/library/RadioButton";
import { LANGUAGES } from "@/constants/constant";

export default function Main() {
    const { language, setLanguage } = useLanguageStore();

    return (
        <View className="flex-1 px-4 pt-6">
            <View className="rounded-3xl bg-white dark:bg-background-dark p-4 gap-2">
                {LANGUAGES.map((item) => {
                    const isSelected = language === item.code;
                    return (
                        <RadioButton
                            key={item.code}
                            selected={isSelected}
                            onPress={() => setLanguage(item.code)}
                        >
                            <View className="flex-row items-center gap-4">
                                <Text className="text-2xl">{item.flag}</Text>
                                <Text
                                    className={`text-lg font-medium ${isSelected ? "text-primary-500" : "text-grey-800 dark:text-grey-100"}`}
                                >
                                    {item.label}
                                </Text>
                            </View>
                        </RadioButton>
                    );
                })}
            </View>
        </View>
    );
}
