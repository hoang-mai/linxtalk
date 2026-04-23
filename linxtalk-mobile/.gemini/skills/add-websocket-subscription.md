# Skill: Thêm WebSocket Subscription

## Mô tả
Thêm một subscription channel mới để nhận real-time events từ backend.

## Cách thêm subscription mới

### 1. Trong WebSocketProvider (global subscription)

Cho các events cần lắng nghe ở mọi screen (notifications, friend requests, etc.):

```tsx
// components/providers/WebSocketProvider.tsx
webSocketService.subscribe('/user/queue/new-channel', (data) => {
  if (data.type === 'SOME_EVENT') {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RELATED_QUERY] });
  }
});
```

### 2. Trong component cụ thể (scoped subscription)

Cho các events chỉ cần ở screen cụ thể (chat messages, typing indicators, etc.):

```tsx
import webSocketService from '@/services/web-socket';
import { useEffect } from 'react';

export default function ChatScreen({ chatId }: { chatId: string }) {
  useEffect(() => {
    const sub = webSocketService.subscribe(
      `/user/queue/chat/${chatId}`,
      (data) => {
        // Handle incoming message
      }
    );

    return () => {
      webSocketService.unsubscribe(`/user/queue/chat/${chatId}`);
    };
  }, [chatId]);

  // ...
}
```

### 3. Gửi message qua WebSocket

```tsx
import webSocketService from '@/services/web-socket';
import { PrivateMessageRequest } from '@/constants/type';

const sendMessage = (message: PrivateMessageRequest) => {
  webSocketService.send('/app/chat.sendPrivateMessage', message);
};
```

## Lưu ý
- WebSocket chỉ active khi user authenticated (managed bởi `WebSocketProvider`)
- STOMP protocol — destinations bắt đầu bằng `/user/queue/` (user-specific) hoặc `/topic/` (broadcast)
- Gửi message qua `/app/` prefix
- Service tự động reconnect (5s delay) và resubscribe khi mất kết nối
- Kiểm tra connection: `webSocketService.isConnected()`
