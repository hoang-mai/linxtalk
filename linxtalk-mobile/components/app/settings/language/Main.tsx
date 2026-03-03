import { View, Text } from "react-native";
import { Colors } from "@/constants/theme";
import { useLanguageStore } from "@/store/language-store";
import RadioButton from "@/library/RadioButton";
import { LANGUAGES } from "@/constants/constant";

export default function Main() {
    const { language, setLanguage } = useLanguageStore();

    return (
        <View className="flex-1 px-4 pt-6">
            <View className="rounded-3xl bg-white p-4 gap-2">
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
                                    className="text-lg font-medium"
                                    style={{ color: isSelected ? Colors.primary["500"] : Colors.grey["700"] }}
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
