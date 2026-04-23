# Skill: Tạo Event System (Event-Driven)

## Mô tả
Tạo event-driven flow để sync data bất đồng bộ giữa các domain.

## Các bước

### 1. Tạo Event class

```java
// event/SomeActionEvent.java
package com.linxtalk.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SomeActionEvent {
    private final String userId;
    private final String relatedId;
    private final String actionData;
}
```

### 2. Publish event từ Service

```java
// service/SomeService.java
@Service
@RequiredArgsConstructor
public class SomeService {
    private final ApplicationEventPublisher eventPublisher;

    public void doAction() {
        // ... business logic ...

        eventPublisher.publishEvent(SomeActionEvent.builder()
            .userId(userId)
            .relatedId(relatedId)
            .actionData(data)
            .build());
    }
}
```

### 3. Tạo Event Listener

```java
// listener/SomeActionListener.java
package com.linxtalk.listener;

import com.linxtalk.event.SomeActionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SomeActionListener {

    private final SomeRepository someRepository;

    @Async
    @EventListener
    public void handleSomeActionEvent(SomeActionEvent event) {
        log.info("Handling SomeActionEvent for userId: {}", event.getUserId());
        try {
            // Perform side-effect operations
            someRepository.updateRelatedData(event.getRelatedId(), event.getActionData());
            log.info("Successfully handled event for userId: {}", event.getUserId());
        } catch (Exception e) {
            log.error("Failed to handle event for userId: {}", event.getUserId(), e);
        }
    }
}
```

## Lưu ý
- Dùng `@Async` để xử lý bất đồng bộ (không block request thread)
- Luôn wrap trong try-catch để tránh silent failures
- Log đầy đủ: start, success, error
- Event là immutable (`final` fields)
- Ví dụ thực tế: `UserUpdateEvent` sync displayName/avatarUrl tới Friend + ConversationMember collections
