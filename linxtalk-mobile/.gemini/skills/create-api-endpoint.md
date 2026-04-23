# Skill: Thêm API Endpoint & React Query Hook

## Mô tả
Thêm một API endpoint mới với React Query integration theo pattern chuẩn của dự án.

## Các bước thực hiện

### 1. Thêm endpoint constant

```tsx
// constants/api.ts
export const NEW_RESOURCE = REQUEST_MAPPING + "/new-resource";
```

### 2. Thêm type definitions

```tsx
// constants/type.ts
export interface NewResourceRequest {
  field1: string;
  field2: number;
}

export interface NewResourceResponse {
  id: string;
  field1: string;
  field2: number;
  createdAt: string;
  updatedAt: string;
}
```

### 3. Thêm query key

```tsx
// constants/constant.ts
export const QUERY_KEYS = {
  // ... existing keys
  NEW_RESOURCE: "new-resource",
};
```

### 4. Sử dụng trong component

#### Query (GET)

```tsx
import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/axios';
import { QUERY_KEYS } from '@/constants/constant';
import { NEW_RESOURCE } from '@/constants/api';

// Trong component:
const { data, isLoading, error } = useQuery({
  queryKey: [QUERY_KEYS.NEW_RESOURCE],
  queryFn: async () => {
    const res = await get<BaseResponse<NewResourceResponse[]>>(NEW_RESOURCE);
    return res.data.data;
  },
});
```

#### Infinite Query (pagination)

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: [QUERY_KEYS.NEW_RESOURCE],
  queryFn: async ({ pageParam = 0 }) => {
    const res = await get<BaseResponse<PageResponse<NewResourceResponse>>>(
      `${NEW_RESOURCE}?page=${pageParam}&size=20`
    );
    return res.data.data;
  },
  initialPageParam: 0,
  getNextPageParam: (lastPage) =>
    lastPage.hasNext ? lastPage.pageNumber + 1 : undefined,
});
```

#### Mutation (POST/PUT/PATCH/DELETE)

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post, patch, del } from '@/services/axios';

const queryClient = useQueryClient();
const { showToast } = useToastStore();

const createMutation = useMutation({
  mutationFn: async (data: NewResourceRequest) => {
    const res = await post<BaseResponse<NewResourceResponse>>(
      NEW_RESOURCE,
      data
    );
    return res.data.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEW_RESOURCE] });
    showToast({ message: t('success.created'), type: 'success' });
  },
  onError: (error: any) => {
    showToast({ message: error.message, type: 'error' });
  },
});
```

## Response Format
- Single item: `BaseResponse<T>` → `{ stats, message, data: T }`
- Paginated: `BaseResponse<PageResponse<T>>` → `{ stats, message, data: { pageSize, totalElements, hasNext, data: T[] } }`

## Nếu cần persist query
Thêm key vào `PERSISTED_QUERY_KEYS` trong `components/providers/query-client.ts`.

## Network Strategy
```tsx
// Mặc định: fail-fast (throw error khi offline)
await get(URL);

// Offline queue (queue request khi offline, gửi khi có mạng)
await post(URL, data, { networkStrategy: 'offline-queue' });
```
