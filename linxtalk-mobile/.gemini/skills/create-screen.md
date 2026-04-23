# Skill: Tạo Screen Mới

## Mô tả
Tạo một screen mới trong ứng dụng LinxTalk Mobile sử dụng Expo Router file-based routing.

## Các bước thực hiện

### 1. Xác định route group
- Screen thuộc nhóm authenticated → đặt trong `app/(app)/`
- Screen thuộc nhóm unauthenticated → đặt trong `app/(auth)/`

### 2. Tạo file screen
Screen chỉ là **layout + composition**, không chứa logic nặng.

```tsx
// app/(app)/[feature]/index.tsx
import FeatureMain from '@/components/app/[feature]/Main';

export default function FeatureScreen() {
  return <FeatureMain />;
}
```

### 3. Tạo component chính
Business logic nằm trong `components/app/[feature]/Main.tsx`.

```tsx
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';

export default function FeatureMain() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, dark } = useTheme();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-white dark:bg-background-dark"
    >
      <Text className="text-lg font-bold text-grey-900 dark:text-grey-50">
        {t('feature.title')}
      </Text>
    </View>
  );
}
```

### 4. Thêm translations
Cập nhật cả 2 file:
- `i18n/locales/vi.json`
- `i18n/locales/en.json`

### 5. Nếu screen cần tab mới
Cập nhật `app/(app)/_layout.tsx` để thêm tab.

### 6. Checklist
- [ ] Screen file tạo đúng route group
- [ ] Component chính trong `components/`
- [ ] Dark mode support (`dark:` classes)
- [ ] i18n cho tất cả text
- [ ] Safe area handling
- [ ] Navigation theme integration
