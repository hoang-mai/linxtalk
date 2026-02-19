package com.linxtalk.exception;

import lombok.Getter;

@Getter
public class AuthenticationException extends RuntimeException {

    private final String messageKey;
    private final Object[] args;

    public AuthenticationException(String messageKey, Object... args) {
        super(messageKey);
        this.messageKey = messageKey;
        this.args = args;
    }
}
