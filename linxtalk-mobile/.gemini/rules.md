# LinxTalk Mobile — Project Rules

## 1. Tổng quan dự án

LinxTalk Mobile là ứng dụng chat real-time được xây dựng trên nền:

- **Framework**: Expo SDK 55 + Expo Router (file-based routing)
- **Language**: TypeScript (strict mode)
- **UI**: React Native 0.83 + NativeWind v4 (TailwindCSS v3)
- **State Management**: Zustand v5 (persist via AsyncStorage / SecureStore)
- **Data Fetching**: TanStack React Query v5 (với persistence)
- **Networking**: Axios (REST) + STOMP/WebSocket (real-time)
- **i18n**: i18next + react-i18next (vi, en)
- **Animation**: React Native Reanimated v4 + Gesture Handler
- **Backend**: Spring Boot (Java) — REST API + WebSocket

---

## 2. Cấu trúc thư mục

```
linxtalk-mobile/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx         # Root layout (providers, guards)
│   ├── global.css          # CSS variables + Tailwind directives
│   ├── (app)/              # Authenticated screens
│   │   ├── _layout.tsx     # Bottom tabs layout
│   │   ├── index.tsx       # Conversation list (main tab)
│   │   ├── friends/        # Friends tab screens
│   │   └── settings/       # Settings tab screens
│   └── (auth)/             # Unauthenticated screens
│       ├── _layout.tsx     # Auth stack layout
│       ├── login/
│       ├── register/
│       └── save-account/
├── components/             # Feature-level components
│   ├── app/                # Components cho (app) screens
│   │   ├── friends/        # Friends feature components
│   │   ├── settings/       # Settings feature components
│   │   └── layouts/        # Shared layout components (TabButton)
│   ├── auth/               # Components cho (auth) screens
│   ├── modals/             # Global modals (Loading, Toast, ModalGlobal)
│   └── providers/          # Context providers (WebSocket, QueryClient)
├── library/                # Reusable UI primitives (design system)
│   ├── BottomSheet.tsx
│   ├── Button.tsx
│   ├── Divide.tsx
│   ├── Icon.tsx
│   ├── Input.tsx
│   ├── RadioButton.tsx
│   └── Skeleton.tsx
├── constants/              # Shared constants & types
│   ├── api.ts              # API endpoint constants
│   ├── constant.ts         # App constants (QUERY_KEYS, THEMES, LANGUAGES)
│   ├── enum.ts             # Enums (MessageType, ConversationType)
│   ├── error.ts            # Custom error classes
│   ├── regex.ts            # Regex patterns
│   ├── theme.ts            # Color palette + Navigation themes
│   └── type.ts             # TypeScript interfaces (request/response DTOs)
├── hooks/                  # Custom hooks
├── i18n/                   # Internationalization
│   ├── index.ts            # i18next config
│   └── locales/            # Translation JSON files
├── services/               # Network/service layer
│   ├── axios.ts            # Axios instance + interceptors
│   ├── web-socket.ts       # STOMP WebSocket service (singleton)
│   └── offline-queue.ts    # Offline request queue
├── store/                  # Zustand stores
│   ├── auth-store.ts       # Auth tokens (SecureStore)
│   ├── account-store.ts    # Current account info
│   ├── saved-account-store.ts  # Multi-account management
│   ├── theme-store.ts      # Theme preference (light/dark/system)
│   ├── language-store.ts   # Language preference
│   ├── loading-store.ts    # Global loading overlay
│   ├── modal-store.ts      # Global modal state
│   ├── bottom-sheet-store.ts # Bottom sheet state
│   └── toast-store.ts      # Toast notifications
└── utils/                  # Utility functions
    └── fn-common.ts        # Token check, device ID, time formatting
```

---

## 3. Quy tắc Code

### 3.1 TypeScript
- **Strict mode** (`"strict": true`) — không dùng `any` trừ khi bắt buộc.
- Dùng `interface` cho DTOs/props, `type` cho union/utility types.
- Import alias: `@/` maps to project root (e.g. `@/store/auth-store`).

### 3.2 Component
- Mỗi screen **chỉ là layout + composition** — business logic nằm trong `components/`.
- **library/** chứa UI primitives có thể tái sử dụng (Button, Input, Icon...) — KHÔNG chứa business logic.
- **components/app/**, **components/auth/** chứa feature components tương ứng với route groups.
- Component phải hỗ trợ **dark mode** bằng NativeWind class `dark:`.

### 3.3 Styling
- Dùng **NativeWind (TailwindCSS)** classes cho styling. Dùng `className` prop.
- Color tokens được define trong `global.css` bằng CSS variables, map qua `tailwind.config.js`.
- Khi cần style động (animated), dùng `StyleSheet.create()` kết hợp Reanimated.
- **Palette chính**: primary (teal), red, grey, toast colors.
- Dark mode background: `bg-background-dark` hoặc `dark:bg-background-dark`.

### 3.4 State Management (Zustand)
- Mỗi store là **1 file riêng** trong `store/`.
- Dùng `persist` middleware cho data cần giữ qua sessions.
- **Sensitive data** (tokens) dùng `expo-secure-store`, còn lại dùng `AsyncStorage`.
- Store phải có `isHydrated` flag để tránh render trước khi data sẵn sàng.
- Pattern: `create<State>()(persist((set) => ({...}), { name, storage, onRehydrateStorage, partialize }))`.

### 3.5 API & Networking
- Dùng **axios instance** từ `services/axios.ts` — KHÔNG tạo instance mới.
- Interceptor tự động handle:
  - `Accept-Language` header
  - Token refresh khi access token expired
  - Network strategy (`fail-fast`, `offline-queue`, `optimistic-timeout`)
- **API endpoints** define trong `constants/api.ts` với prefix `/api/v1`.
- Response format: `BaseResponse<T>` hoặc `PageResponse<T>` (xem `global.d.ts`).

### 3.6 React Query
- **Query keys** phải define trong `QUERY_KEYS` constant.
- Persisted queries được config trong `PERSISTED_QUERY_KEYS`.
- Dùng `gcTime: Infinity` cho offline-first approach.

### 3.7 WebSocket
- `WebSocketService` là singleton class (`services/web-socket.ts`).
- Kết nối qua `WebSocketProvider` component — tự động connect/disconnect theo auth state.
- Protocol: STOMP over WebSocket.
- Subscribe pattern: `/user/queue/{channel}`.

### 3.8 Navigation
- Dùng **Expo Router** (file-based routing).
- Route groups: `(app)` cho authenticated, `(auth)` cho unauthenticated.
- Auth guard dùng `Stack.Protected` component trong root layout.
- **Navigation theme** (LightTheme/DarkTheme) từ `constants/theme.ts`.

### 3.9 i18n
- Mọi text hiển thị **PHẢI** dùng `useTranslation()` hook hoặc `i18n.t()`.
- Translation files: `i18n/locales/vi.json`, `i18n/locales/en.json`.
- Supported languages: Vietnamese (vi), English (en).

### 3.10 Dark Mode
- Detect bằng `useColorScheme()` từ `react-native`.
- User preference lưu trong `theme-store.ts` (light/dark/system).
- Áp dụng qua `Appearance.setColorScheme()` + NativeWind `dark:` variant.
- **ThemeProvider** wrap toàn app với `@react-navigation/native` theme.

### 3.11 Animation
- Dùng `react-native-reanimated` cho performance animations.
- Dùng `react-native-gesture-handler` cho gesture interactions.
- Pattern: `useSharedValue` + `useAnimatedStyle` + `withTiming/withSpring`.

---

## 4. Conventions

### Naming
- **Files**: kebab-case cho stores (`auth-store.ts`), PascalCase cho components (`Button.tsx`).
- **Exports**: Default export cho components, named exports cho stores/hooks/utils.
- **Hooks**: prefix `use` (e.g. `useDebounce`, `useAuthStore`).
- **Constants**: UPPER_SNAKE_CASE cho constant objects (`QUERY_KEYS`, `MAX_RETRIES`).

### Error Handling
- Custom error classes trong `constants/error.ts`.
- Network errors: `OfflineError`, `QueuedError`.
- Toast notifications qua `useToastStore` cho user-facing errors.

### Form Handling
- Dùng `react-hook-form` + `zod` validation.
- Pattern: `useForm` + `zodResolver`.

---

## 5. Lưu ý quan trọng

- **KHÔNG** import trực tiếp từ `react-native` cho icons — dùng `@expo/vector-icons` (Ionicons).
- **KHÔNG** dùng `TouchableOpacity` cho buttons — dùng `Pressable` hoặc component `Button` từ `library/`.
- **KHÔNG** hardcode strings — dùng i18n.
- **KHÔNG** hardcode colors — dùng theme tokens từ `Colors` hoặc TailwindCSS classes.
- **KHÔNG** sử dụng withSpring cho animations — chỉ dùng withTiming để tránh performance issues trên Android.
- Backend API base URL từ env var `EXPO_PUBLIC_API_URL`.
- Google Sign-In cần `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
