# Skill: Tạo Custom Exception

## Mô tả
Tạo custom exception mới theo pattern chuẩn với i18n message key.

## Template

### 1. Tạo Exception class

```java
// exception/NewBusinessException.java
package com.linxtalk.exception;

import lombok.Getter;

@Getter
public class NewBusinessException extends RuntimeException {
    private final String messageKey;
    private final Object[] args;

    public NewBusinessException(String messageKey, Object... args) {
        super(messageKey);
        this.messageKey = messageKey;
        this.args = args;
    }
}
```

### 2. Thêm handler trong GlobalExceptionHandler

```java
// exception/GlobalExceptionHandler.java
@ExceptionHandler(NewBusinessException.class)
public ResponseEntity<BaseResponse<Void>> handleNewBusiness(NewBusinessException ex) {
    BaseResponse<Void> response = BaseResponse.<Void>builder()
        .status(HttpStatus.BAD_REQUEST.value())  // Chọn HTTP status phù hợp
        .message(ex.getMessageKey())
        .messageArgs(ex.getArgs())
        .build();
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
}
```

### 3. Thêm message key

```java
// utils/MessageError.java
public static final String NEW_BUSINESS_ERROR = "new.business.error";
```

### 4. Thêm translations

```properties
# i18n_vi.properties
new.business.error=Lỗi nghiệp vụ: {0}

# i18n_en.properties
new.business.error=Business error: {0}
```

### 5. Sử dụng trong Service

```java
throw new NewBusinessException(MessageError.NEW_BUSINESS_ERROR, someArg);
```

## Các exception types có sẵn
| Exception | HTTP Status | Dùng khi |
|-----------|-------------|----------|
| `AuthenticationException` | 401 | Lỗi xác thực |
| `DuplicateException` | 409 | Dữ liệu trùng lặp |
| `ResourceNotFoundException` | 404 | Không tìm thấy resource |
| `LimitExceededException` | 429 | Vượt quá giới hạn |
