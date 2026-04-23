# Skill: Thêm i18n Translations

## Mô tả
Thêm text mới với hỗ trợ đa ngôn ngữ (Tiếng Việt + English).

## Các bước

### 1. Thêm translation keys

Cập nhật **cả 2 file** cùng lúc:

**`i18n/locales/vi.json`:**
```json
{
  "feature": {
    "title": "Tiêu đề",
    "description": "Mô tả tính năng",
    "button": {
      "save": "Lưu",
      "cancel": "Hủy"
    }
  }
}
```

**`i18n/locales/en.json`:**
```json
{
  "feature": {
    "title": "Title",
    "description": "Feature description",
    "button": {
      "save": "Save",
      "cancel": "Cancel"
    }
  }
}
```

### 2. Sử dụng trong component (với hook)

```tsx
import { useTranslation } from 'react-i18next';

export default function FeatureComponent() {
  const { t } = useTranslation();

  return (
    <Text>{t('feature.title')}</Text>
  );
}
```

### 3. Sử dụng ngoài component (trực tiếp)

```tsx
import i18n from '@/i18n';

const message = i18n.t('feature.title');
```

### 4. Interpolation (biến trong text)

```json
{
  "greeting": "Xin chào, {{name}}!"
}
```

```tsx
t('greeting', { name: 'Hoàng' }) // → "Xin chào, Hoàng!"
```

### 5. Pluralization

```json
{
  "time": {
    "minuteAgo": "{{count}} phút trước",
    "minutesAgo": "{{count}} phút trước"
  }
}
```

## Quy tắc
- **LUÔN** thêm cả vi và en cùng lúc
- Dùng dot notation cho nested keys: `feature.section.label`
- Nhóm theo feature/screen: `login.`, `settings.`, `friends.`, etc.
- Fallback language: English (`fallbackLng: 'en'`)
