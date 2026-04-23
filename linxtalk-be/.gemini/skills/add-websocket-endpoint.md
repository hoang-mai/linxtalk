# Skill: Thêm WebSocket Endpoint

## Mô tả
Thêm WebSocket messaging endpoint cho real-time features.

## Cách gửi message tới user cụ thể

```java
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;

    public void sendToUser(String userId, String destination, Object payload) {
        messagingTemplate.convertAndSendToUser(userId, destination, payload);
    }

    // Ví dụ: Gửi notification
    public void sendNotification(String userId, NotificationPayload payload) {
        messagingTemplate.convertAndSendToUser(
            userId,
            "/queue/notifications",
            payload
        );
    }
}
```

Client subscribe: `/user/queue/notifications` (Spring tự route tới user cụ thể).

## Tạo Message Controller (nhận message từ client)

```java
@Controller
@RequiredArgsConstructor
public class ChatMessageController {
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    @MessageMapping("/chat.sendPrivateMessage")
    public void sendPrivateMessage(
            @Payload PrivateMessageRequest request,
            Principal principal) {
        String senderId = principal.getName();
        // Process message
        MessageResponse response = messageService.processMessage(senderId, request);
        // Send to receiver
        messagingTemplate.convertAndSendToUser(
            request.getReceiverId(),
            "/queue/messages",
            response
        );
    }
}
```

## WebSocket Destinations
| Prefix | Mô tả | Ví dụ |
|--------|--------|-------|
| `/app` | Client → Server (MessageMapping) | `/app/chat.sendPrivateMessage` |
| `/user/queue/` | Server → specific User | `/user/queue/notifications` |
| `/topic/` | Server → all subscribers (broadcast) | `/topic/public` |

## Lưu ý
- Auth: `WebSocketAuthChannelInterceptor` validate JWT trên STOMP CONNECT
- User identity: `Principal.getName()` = userId (set bởi interceptor)
- Dùng `@MessageMapping` cho receiving, `SimpMessagingTemplate` cho sending
- Dùng `@Controller` (không phải `@RestController`) cho WebSocket controllers
