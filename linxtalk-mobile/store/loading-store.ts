import { create } from "zustand";
import { DELAY_MS } from "@/constants/constant";

interface LoadingState {
    visible: boolean;
    _count: number;
    _timeoutId: ReturnType<typeof setTimeout> | null;
    showLoading: () => void;
    hideLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
    visible: false,
    _count: 0,
    _timeoutId: null,
    showLoading: () => {
        const count = get()._count + 1;
        const prev = get()._timeoutId;
        if (prev) clearTimeout(prev);

        const id = setTimeout(() => {
            if (get()._count > 0) {
                set({ visible: true, _timeoutId: null });
            }
        }, DELAY_MS);

        set({ _count: count, _timeoutId: id });
    },
    hideLoading: () => {
        const count = Math.max(get()._count - 1, 0);
        if (count === 0) {
            const prev = get()._timeoutId;
            if (prev) clearTimeout(prev);
            set({ visible: false, _count: 0, _timeoutId: null });
        } else {
            set({ _count: count });
        }
    },
}));