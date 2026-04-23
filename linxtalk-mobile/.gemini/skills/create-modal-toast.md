# Skill: Sử dụng Modal & Toast

## Toast Notifications

```tsx
import { useToastStore } from '@/store/toast-store';

// Trong component
const { showToast } = useToastStore();
showToast({ message: t('success.saved'), type: 'success' });
showToast({ message: t('errors.somethingWrong'), type: 'error' });

// Ngoài component
useToastStore.getState().showToast({ message: 'msg', type: 'error' });
```

Types: `success` (#4E8C7C), `error` (#E04063), `warning` (#FD871F), `info` (#006FE0)

## Modal (Confirm Dialog)

```tsx
import { useModalStore } from '@/store/modal-store';

const { showModal, hideModal } = useModalStore();
showModal({
  title: t('modal.confirmDelete'),
  message: t('modal.deleteMessage'),
  onConfirm: () => { deleteItem(); hideModal(); },
  onCancel: () => { hideModal(); },
});
```

## Loading Overlay

```tsx
import { useLoadingStore } from '@/store/loading-store';

const { showLoading, hideLoading } = useLoadingStore();
showLoading();
try { await apiCall(); } finally { hideLoading(); }
```

## Lưu ý
- Cả 3 đều render globally trong `app/_layout.tsx`
- Truy cập được cả trong và ngoài React component
