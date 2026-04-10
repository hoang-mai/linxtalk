import { create } from "zustand";
import { ReactNode } from "react";

interface BottomSheetOptions {
    title?: string;
    children?: ReactNode;
    closeOnBackdropPress?: boolean;
}

interface BottomSheetState {
    visible: boolean;
    title?: string;
    children?: ReactNode;
    closeOnBackdropPress: boolean;
    showBottomSheet: (options: BottomSheetOptions) => void;
    hideBottomSheet: () => void;
}

export const useBottomSheetStore = create<BottomSheetState>((set) => ({
    visible: false,
    title: undefined,
    children: undefined,
    closeOnBackdropPress: true,
    showBottomSheet: (options) => {
        set({
            visible: true,
            title: options.title,
            children: options.children,
            closeOnBackdropPress: options.closeOnBackdropPress ?? true,
        });
    },
    hideBottomSheet: () => {
        set({
            visible: false,
            title: undefined,
            children: undefined,
            closeOnBackdropPress: true,
        });
    },
}));
