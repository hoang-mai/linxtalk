# Skill: Tạo Library Component (UI Primitive)

## Mô tả
Tạo một reusable UI component trong thư mục `library/` theo design system của dự án.

## Quy tắc
- **library/** chỉ chứa UI primitives — KHÔNG chứa business logic.
- Component phải hỗ trợ dark mode.
- Dùng NativeWind classes cho styling.
- Hỗ trợ `className` prop để allow override.
- Dùng `Colors` từ `@/constants/theme` khi cần dynamic color values.

## Template

```tsx
// library/[ComponentName].tsx
import { View, Text, Pressable, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface ComponentNameProps {
  // Required props
  title: string;
  
  // Optional props
  className?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onPress?: () => void;
  
  // Icon support
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
}

export default function ComponentName({
  title,
  className = '',
  variant = 'primary',
  disabled = false,
  onPress,
  icon,
  iconSize = 24,
}: ComponentNameProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      className={`flex-row items-center p-4 rounded-xl 
        bg-white dark:bg-background-dark 
        ${disabled ? 'opacity-50' : ''} 
        ${className}`}
      disabled={disabled}
      onPress={onPress}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={iconSize}
          color={isDark ? Colors.grey[100] : Colors.grey[800]}
        />
      )}
      <Text className="text-base text-grey-800 dark:text-grey-100 ml-3">
        {title}
      </Text>
    </Pressable>
  );
}
```

## Variant Pattern (tham khảo Button.tsx)

```tsx
type Variant = 'primary' | 'secondary' | 'outline' | 'soft';

const variantStyles: Record<
  Variant,
  {
    container: string;      // NativeWind classes bình thường
    text: string;
    pressed: string;        // NativeWind classes khi pressed
    disabled: { container: string; text: string };
  }
> = {
  primary: {
    container: 'bg-primary-500',
    text: 'text-white font-semibold',
    pressed: 'bg-primary-600',
    disabled: { container: 'bg-grey-300 dark:bg-grey-700', text: 'text-white font-semibold' },
  },
  // ...
};
```

## Animation Pattern (tham khảo Input.tsx)

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

const focused = useSharedValue(0);

const borderStyle = useAnimatedStyle(() => ({
  borderColor: interpolateColor(
    focused.value,
    [0, 1],
    [Colors.primary[400], Colors.primary[600]]
  ),
}));
```

## Checklist
- [ ] Đặt trong `library/`
- [ ] Hỗ trợ dark mode (`dark:` classes + `useColorScheme()`)
- [ ] Có `className` prop cho override
- [ ] Default export
- [ ] TypeScript interface cho props
- [ ] Không import business logic
