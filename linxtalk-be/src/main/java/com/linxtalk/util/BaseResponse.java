package com.linxtalk.util;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BaseResponse<T> {
    private int status;
    @JsonIgnore
    private Object[] messageArgs;
    private String message;
    private T data;
}
