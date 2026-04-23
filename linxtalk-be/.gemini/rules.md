# LinxTalk Backend — Project Rules

## 1. Tổng quan dự án

LinxTalk Backend là REST API + WebSocket server cho ứng dụng chat real-time:

- **Framework**: Spring Boot 4.0.2
- **Language**: Java 21
- **Database**: MongoDB (Spring Data MongoDB)
- **Cache**: Redis (Spring Data Redis)
- **Auth**: JWT (jjwt 0.12.6) + Spring Security
- **Real-time**: STOMP over WebSocket
- **API Docs**: SpringDoc OpenAPI 3.0.1 (Swagger)
- **i18n**: Spring MessageSource (properties-based)
- **Logging**: AOP-based logging (LoggingAspect)
- **Build**: Maven
- **Code generation**: Lombok

---

## 2. Cấu trúc thư mục

```
src/main/java/com/linxtalk/
├── LinxtalkBeApplication.java      # Main entry point
├── component/                      # Cross-cutting concerns
│   ├── I18nResponseAdvice.java     # Auto-translate message keys in BaseResponse
│   └── LoggingAspect.java         # AOP logging cho controllers
├── config/                         # Configuration classes
│   ├── JacksonConfig.java         # JSON serialization
│   ├── LocaleConfig.java          # i18n locale resolver + MessageSource
│   ├── MongoConfig.java           # MongoDB auditing
│   ├── OpenAPIConfig.java         # Swagger/OpenAPI
│   ├── RedisConfig.java           # Redis connection
│   ├── SecurityConfig.java        # Password encoder
│   ├── WebSecurityConfig.java     # HTTP security + JWT filter
│   └── WebSocketConfig.java       # STOMP WebSocket broker
├── controller/                     # REST controllers
│   ├── AuthController.java
│   ├── ConversationController.java
│   ├── ConversationMemberController.java
│   ├── FriendController.java
│   ├── FriendRequestController.java
│   └── UserController.java
├── dto/                            # Data Transfer Objects
│   ├── request/                    # Request DTOs (with validation)
│   └── response/                   # Response DTOs
├── entity/                         # MongoDB documents
│   ├── User.java
│   ├── Friend.java
│   ├── FriendRequest.java
│   ├── Conversation.java
│   ├── ConversationMember.java
│   ├── Message.java
│   └── ... (DeviceToken, Call, Poll, etc.)
├── enumeration/                    # Enums
│   ├── ConversationType.java
│   ├── FriendRequestStatus.java
│   ├── TokenType.java
│   └── UserStatus.java
├── event/                          # Application events
│   └── UserUpdateEvent.java       # Profile update event
├── exception/                      # Custom exceptions + global handler
│   ├── AuthenticationException.java
│   ├── DuplicateException.java
│   ├── LimitExceededException.java
│   ├── ResourceNotFoundException.java
│   └── GlobalExceptionHandler.java
├── listener/                       # Event listeners
│   ├── UserEventListener.java     # Sync profile changes to Friend/ConversationMember
│   ├── WebSocketEventListener.java # Track online presence
│   └── RedisKeyExpirationListener.java # Handle Redis key expiration
├── mapper/                         # Entity ↔ DTO mappers
│   ├── AuthMapper.java
│   ├── ConversationMapper.java
│   ├── FriendMapper.java
│   ├── FriendRequestMapper.java
│   └── UserMapper.java
├── repository/                     # Data access layer
│   ├── UserRepository.java        # MongoRepository
│   ├── FriendRepository.java
│   ├── ... 
│   └── custom/                    # MongoTemplate-based custom queries
│       ├── FriendRepositoryCustom.java
│       ├── FriendRequestRepositoryCustom.java
│       └── ConversationMemberRepositoryCustom.java
├── security/                       # Security components
│   ├── JwtAuthenticationFilter.java
│   ├── JwtUtil.java
│   └── WebSocketAuthChannelInterceptor.java
├── service/                        # Business logic
│   ├── AuthService.java
│   ├── ConversationService.java
│   ├── ConversationMemberService.java
│   ├── FriendService.java
│   ├── FriendRequestService.java
│   ├── PresenceService.java       # Redis-based online status
│   ├── TokenBlacklistService.java
│   └── UserService.java
└── utils/                          # Utilities & constants
    ├── BaseResponse.java          # Generic API response wrapper
    ├── PageResponse.java          # Pagination response wrapper
    ├── Constant.java              # API paths, Redis keys
    ├── FnCommon.java              # Get current user ID
    ├── MessageError.java          # Error message keys (i18n)
    └── MessageSuccess.java        # Success message keys (i18n)

src/main/resources/
├── application.properties          # Base config
├── application-dev.properties      # Dev profile
├── application-prod.properties     # Prod profile
├── i18n.properties                 # Default messages
├── i18n_vi.properties              # Vietnamese messages
└── i18n_en.properties              # English messages
```

---

## 3. Quy tắc Code

### 3.1 Kiến trúc tầng (Layered Architecture)
```
Controller → Service → Repository
             ↕           ↕
           Mapper      MongoTemplate (custom)
```
- **Controller**: Nhận request, validate, gọi service, trả `BaseResponse`.
- **Service**: Business logic, gọi repository, publish events.
- **Repository**: Data access. `MongoRepository` cho CRUD đơn giản, `custom/` với `MongoTemplate` cho complex queries.
- **Mapper**: Convert Entity ↔ DTO. **KHÔNG** đặt logic trong mapper.

### 3.2 Response Pattern
Mọi API **PHẢI** trả về `BaseResponse<T>`:

```java
BaseResponse<DataType> response = BaseResponse.<DataType>builder()
    .status(HttpStatus.OK.value())
    .message(MessageSuccess.SOME_KEY)    // i18n key, auto-translated
    .data(data)                          // nullable
    .build();
return ResponseEntity.ok(response);
```

Pagination dùng `BaseResponse<PageResponse<T>>`:

```java
PageResponse<T> pageResponse = PageResponse.<T>builder()
    .pageSize(page.getSize())
    .totalElements(page.getTotalElements())
    .pageNumber(page.getNumber())
    .totalPages(page.getTotalPages())
    .hasNext(page.hasNext())
    .hasPrevious(page.hasPrevious())
    .data(content)
    .build();
```

### 3.3 Entity (MongoDB Document)
- Annotate với `@Document(collection = "collection_name")`.
- Dùng `@MongoId(FieldType.OBJECT_ID)` cho ID field.
- Dùng `@Field(targetType = FieldType.OBJECT_ID)` cho reference fields.
- Dùng `@Indexed` cho fields cần index, `@CompoundIndex` cho composite.
- Dùng `@CreatedDate` + `@LastModifiedDate` cho audit fields (kiểu `Instant`).
- Dùng `@Builder.Default` cho default values.
- Lombok annotations: `@Data @Builder @NoArgsConstructor @AllArgsConstructor`.

### 3.4 DTO
- **Request DTOs** (`dto/request/`): Dùng Jakarta Validation annotations (`@NotBlank`, `@Size`, etc.) với i18n message keys.
- **Response DTOs** (`dto/response/`): Lombok `@Data @Builder @NoArgsConstructor @AllArgsConstructor`.
- **KHÔNG** dùng entity trực tiếp trong controller response.

### 3.5 Exception Handling
- Custom exceptions kế thừa `RuntimeException`, chứa `messageKey` + `args`.
- Throw exception từ service layer, **KHÔNG** catch trong controller.
- `GlobalExceptionHandler` (`@RestControllerAdvice`) tự động handle và trả `BaseResponse`.
- Exception types:
  - `AuthenticationException` → 401
  - `DuplicateException` → 409
  - `ResourceNotFoundException` → 404
  - `LimitExceededException` → 429
  - `MethodArgumentNotValidException` → 400 (validation)

### 3.6 i18n
- Message keys define trong `MessageError` và `MessageSuccess` classes.
- Translations trong `resources/i18n.properties`, `i18n_vi.properties`, `i18n_en.properties`.
- `I18nResponseAdvice` tự động translate message key trong `BaseResponse` dựa trên `Accept-Language` header.
- Validation messages: `{key}` format trong `@NotBlank(message = "{key}")`.

### 3.7 Security
- JWT-based stateless authentication.
- `JwtAuthenticationFilter` validate token cho mỗi request.
- Current user ID: `FnCommon.getUserId()` (lấy từ `SecurityContextHolder`).
- Public endpoints define trong `WebSecurityConfig.PUBLIC_ENDPOINTS`.
- WebSocket auth: `WebSocketAuthChannelInterceptor` validate JWT trên STOMP CONNECT frame.

### 3.8 WebSocket
- STOMP protocol qua endpoint `/ws`.
- Message broker: `/topic` (broadcast), `/queue` (user-specific).
- Application destination prefix: `/app`.
- User destination prefix: `/user` (Spring auto-route `/user/queue/...` tới user cụ thể).
- Gửi message tới user: `SimpMessagingTemplate.convertAndSendToUser(userId, "/queue/...", payload)`.

### 3.9 Event System
- Dùng Spring Application Events cho cross-domain sync.
- Publish: `ApplicationEventPublisher.publishEvent(new SomeEvent(...))`.
- Listen: `@EventListener` + `@Async` trên listener methods.
- Ví dụ: `UserUpdateEvent` → `UserEventListener` sync profile changes tới Friend + ConversationMember collections.

### 3.10 Redis
- Online presence tracking: `presence:user:`, `presence:session:`, `presence:offline:`.
- Token blacklist: `TokenBlacklistService`.
- Key expiration handling: `RedisKeyExpirationListener`.

### 3.11 Logging
- `LoggingAspect` tự động log tất cả controller methods (args, result, duration).
- Dùng `@Slf4j` (Lombok) cho service/component logging.
- Pattern: `log.info()`, `log.error()`, `log.warn()`.

---

## 4. Conventions

### Naming
- **Package**: lowercase singular (`controller`, `service`, `entity`).
- **Class**: PascalCase. Controller: `XxxController`, Service: `XxxService`, Repository: `XxxRepository`.
- **DTO**: `XxxRequest` (request), `XxxResponse` (response).
- **Message keys**: dot.separated.lowercase (`login.success`, `user.not.found`).
- **Constant fields**: API paths trong `Constant.java`.

### Dependencies
- Constructor injection via `@RequiredArgsConstructor` (Lombok) — **KHÔNG** dùng `@Autowired`.
- All classes dùng Lombok: `@Data`, `@Builder`, `@RequiredArgsConstructor`.

### API Design
- Base path: `/api/v1`.
- RESTful conventions: GET (list/detail), POST (create), PATCH (partial update), DELETE.
- Pagination params: `pageNo`, `pageSize`, `sortBy`, `sortDir`.
- Validation: `@Valid @RequestBody` trên controller methods.

---

## 5. Lưu ý quan trọng

- **KHÔNG** trả entity trực tiếp — luôn map sang Response DTO.
- **KHÔNG** dùng `@Autowired` — dùng constructor injection.
- **KHÔNG** hardcode messages — dùng `MessageError`/`MessageSuccess` keys.
- **KHÔNG** handle exception trong controller — để `GlobalExceptionHandler` xử lý.
- Profiles: `dev` (default), `prod`. Config trong `application-{profile}.properties`.
- Current user ID luôn lấy qua `FnCommon.getUserId()`.
