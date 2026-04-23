# Skill: Tạo Bottom Sheet

## Mô tả
Sử dụng global BottomSheet component thông qua Zustand store.

## Cách sử dụng

### 1. Show Bottom Sheet

```tsx
import { useBottomSheetStore } from '@/store/bottom-sheet-store';

export default function SomeComponent() {
  const { showBottomSheet, hideBottomSheet } = useBottomSheetStore();

  const handleOpenSheet = () => {
    showBottomSheet({
      title: 'Tùy chọn',
      closeOnBackdropPress: true,
      children: (
        <View className="gap-2">
          <Pressable
            className="flex-row items-center gap-3 py-3 px-2 rounded-xl active:bg-grey-50 dark:active:bg-grey-800"
            onPress={() => {
              // Handle action
              hideBottomSheet();
            }}
          >
            <Ionicons name="pencil-outline" size={22} color={Colors.grey[700]} />
            <Text className="text-base text-grey-800 dark:text-grey-100">
              {t('action.edit')}
            </Text>
          </Pressable>

          <Pressable
            className="flex-row items-center gap-3 py-3 px-2 rounded-xl active:bg-grey-50 dark:active:bg-grey-800"
            onPress={() => {
              // Handle another action
              hideBottomSheet();
            }}
          >
            <Ionicons name="trash-outline" size={22} color={Colors.red[600]} />
            <Text className="text-base text-red-600">
              {t('action.delete')}
            </Text>
          </Pressable>
        </View>
      ),
    });
  };

  return (
    <Pressable onLongPress={handleOpenSheet}>
      {/* Content */}
    </Pressable>
  );
}
```

### 2. Bottom Sheet features
- **Swipe-to-close**: Pan gesture tự động handle (threshold 120px)
- **Backdrop press**: Set `closeOnBackdropPress: true` để đóng khi tap ngoài
- **Animated**: Slide up/down animation + backdrop fade
- **Safe area**: Auto padding cho bottom safe area

## Lưu ý
- BottomSheet được render globally trong `app/_layout.tsx`
- Chỉ có **1 BottomSheet** active tại một thời điểm
- `children` có thể là bất kỳ React element nào
- Dùng `hideBottomSheet()` sau khi xử lý action
