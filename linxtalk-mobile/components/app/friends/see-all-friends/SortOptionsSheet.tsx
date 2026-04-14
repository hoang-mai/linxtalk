import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useBottomSheetStore } from "@/store/bottom-sheet-store";
import RadioButton from "@/library/RadioButton";
import Icon from "@/library/Icon";
import { Colors } from "@/constants/theme";

export type SortValue = "Default" | "Name(A-Z)" | "Name(Z-A)" | "Newest" | "Oldest";

export interface SortConfig {
    id: SortValue;
    sortBy: string | null;
    sortDir: "asc" | "desc" | null;
}

interface SortOptionsSheetProps {
    currentSort: SortConfig;
    onSelect: (option: SortConfig) => void;
}

const SORT_OPTIONS: { id: SortValue; label: string; icon: string; sortBy: string | null; sortDir: "asc" | "desc" | null }[] = [
    { id: "Default", label: "friends.sortByDefault", icon: "list-outline", sortBy: null, sortDir: null },
    { id: "Name(A-Z)", label: "friends.sortByNameAZ", icon: "arrow-up-outline", sortBy: "displayName", sortDir: "asc" },
    { id: "Name(Z-A)", label: "friends.sortByNameZA", icon: "arrow-down-outline", sortBy: "displayName", sortDir: "desc" },
    { id: "Newest", label: "friends.sortByNewest", icon: "calendar-outline", sortBy: "createdAt", sortDir: "desc" },
    { id: "Oldest", label: "friends.sortByOldest", icon: "hourglass-outline", sortBy: "createdAt", sortDir: "asc" },
];

export default function SortOptionsSheet({ currentSort, onSelect }: SortOptionsSheetProps) {
    const { t } = useTranslation();
    const { hideBottomSheet } = useBottomSheetStore();

    const handleSelect = (option: typeof SORT_OPTIONS[0]) => {
        onSelect({
            id: option.id,
            sortBy: option.sortBy,
            sortDir: option.sortDir,
        });
        hideBottomSheet();
    };

    return (
        <View className="px-4">
            <View className="gap-3">
                {SORT_OPTIONS.map((option) => {
                    const isSelected = currentSort.id === option.id;
                    return (
                        <RadioButton
                            key={option.id}
                            selected={isSelected}
                            onPress={() => handleSelect(option)}
                        >
                            <View className="flex-row items-center gap-4">
                                <Icon 
                                    name={option.icon as any} 
                                    size={22} 
                                    color={isSelected ? Colors.primary[500] : Colors.grey[500]} 
                                />
                                <Text className={`text-lg font-medium ${isSelected ? "text-primary-500" : "text-grey-800 dark:text-grey-100"}`}>
                                    {t(option.label)}
                                </Text>
                            </View>
                        </RadioButton>
                    );
                })}
            </View>
        </View>
    );
}
