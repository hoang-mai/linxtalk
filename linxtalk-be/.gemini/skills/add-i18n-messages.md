# Skill: Thêm i18n Messages (Backend)

## Mô tả
Thêm message keys cho success/error responses với đa ngôn ngữ.

## Các bước

### 1. Thêm message key constant

**Success messages:**
```java
// utils/MessageSuccess.java
public static final String NEW_ACTION_SUCCESS = "new.action.success";
```

**Error messages:**
```java
// utils/MessageError.java
public static final String NEW_ACTION_ERROR = "new.action.error";
```

### 2. Thêm translations (cả 3 files)

**`resources/i18n.properties`** (default/fallback):
```properties
new.action.success=Thao tác thành công
new.action.error=Thao tác thất bại: {0}
```

**`resources/i18n_vi.properties`**:
```properties
new.action.success=Thao tác thành công
new.action.error=Thao tác thất bại: {0}
```

**`resources/i18n_en.properties`**:
```properties
new.action.success=Action completed successfully
new.action.error=Action failed: {0}
```

### 3. Sử dụng

**Trong Controller (success):**
```java
BaseResponse.<T>builder()
    .status(HttpStatus.OK.value())
    .message(MessageSuccess.NEW_ACTION_SUCCESS)
    .data(data)
    .build();
```

**Trong Service (error):**
```java
throw new ResourceNotFoundException(MessageError.NEW_ACTION_ERROR, someArg);
```

### 4. Validation messages

**Trong Request DTO:**
```java
@NotBlank(message = "{new.resource.name.notblank}")
private String name;
```

**Trong i18n files:**
```properties
# i18n_vi.properties
new.resource.name.notblank=Tên không được để trống

# i18n_en.properties
new.resource.name.notblank=Name must not be blank
```

## Cách hoạt động
1. Controller/Service set message = i18n key (ví dụ: `"new.action.success"`)
2. `I18nResponseAdvice` tự động interceptor response
3. Dùng `MessageSource.getMessage()` resolve key → translated string
4. Locale từ `Accept-Language` header (default: `vi`)

## Quy tắc
- Cập nhật **cả 3 file** cùng lúc: `i18n.properties`, `i18n_vi.properties`, `i18n_en.properties`
- `{0}`, `{1}` cho message arguments
- Validation keys dùng format `{key}` trong annotation
