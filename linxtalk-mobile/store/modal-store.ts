import { create } from "zustand";
import { ReactNode } from "react";

interface ModalOptions {
    title?: string;
    children?: ReactNode;
    height?: number;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface ModalState {
    visible: boolean;
    title?: string;
    children?: ReactNode;
    height?: number;
    showModal: (options: ModalOptions) => void;
    hideModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    visible: false,
    title: undefined,
    children: undefined,
    height: undefined,
    showModal: (options: ModalOptions) => {
        set({
            visible: true,
            title: options.title,
            children: options.children,
            height: options.height,
        });
    },
    hideModal: () => {
        set({
            visible: false,
            title: undefined,
            children: undefined,
            height: undefined,
        });
    },
}));
