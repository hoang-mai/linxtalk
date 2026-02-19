---
name: Format response
description: Format response data
---
## When to use this skill

Use this skill when you need to format the response data.

## Format response
```java
BaseResponse<T> {
    private int code;
    private String message;
    private T data;
    private Instant timestamp; // this field for response error
}

return ResponseEntity.ok(BaseResponse.<T>builder()
                .code(HttpStatus.OK.value())
                .message(messageSource.getMessage(MessageSuccess.SUCCESS_TEXT, null, LocaleContextHolder.getLocale()))
                .data(data)
                .build());

```


