# Skill: Tạo Zustand Store

## Mô tả
Tạo một Zustand store mới theo pattern chuẩn của dự án, có hỗ trợ persistence và hydration.

## Template

### Store thường (persist với AsyncStorage)

```tsx
// store/[name]-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FeatureState {
  // State
  data: SomeType | null;
  isHydrated: boolean;

  // Actions
  setData: (data: SomeType) => void;
  clearData: () => void;
  setIsHydrated: (isHydrated: boolean) => void;
}

export const useFeatureStore = create<FeatureState>()(
  persist(
    (set) => ({
      data: null,
      isHydrated: false,

      setData: (data: SomeType) => {
        set({ data });
      },

      clearData: () => {
        set({ data: null });
      },

      setIsHydrated: (isHydrated: boolean) => {
        set({ isHydrated });
      },
    }),
    {
      name: 'feature-storage', // Key trong AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (!error && state) {
            state.setIsHydrated(true);
          }
        };
      },
      partialize: (state) => ({
        data: state.data, // Chỉ persist những field cần thiết
      }),
    }
  )
);
```

### Store cho sensitive data (persist với SecureStore)

```tsx
import * as SecureStore from 'expo-secure-store';

const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// Sử dụng:
storage: createJSONStorage(() => secureStoreAdapter),
```

### Store đơn giản (không persist)

```tsx
import { create } from 'zustand';

interface UIState {
  visible: boolean;
  show: () => void;
  hide: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  visible: false,
  show: () => set({ visible: true }),
  hide: () => set({ visible: false }),
}));
```

## Lưu ý
- Nếu store cần persist → thêm `isHydrated` flag
- Nếu `isHydrated` được thêm → cập nhật check trong `app/_layout.tsx`
- Dùng `partialize` để chỉ persist data cần thiết (không persist UI state)
- Truy cập store ngoài component: `useFeatureStore.getState()`
