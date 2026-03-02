package com.linxtalk.exception;

import lombok.Getter;

@Getter
public class LimitExceededException extends RuntimeException {

    private final String messageKey;
    private final Object[] args;

    public LimitExceededException(String messageKey, Object... args) {
        super(messageKey);
        this.messageKey = messageKey;
        this.args = args;
    }
}

