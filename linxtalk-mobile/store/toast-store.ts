import { create } from "zustand";

interface ToastState {
    toast: Toast | null;
    showToast: (toast: Toast) => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastState>()(
    (set) => ({
        toast: null,
        showToast: (toast: Toast) => {
            set({ toast });
        },
        hideToast: () => {
            set({ toast: null });
        },
    })
);
