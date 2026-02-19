package com.linxtalk.enumeration;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum TokenType {

    ACCESS_TOKEN("access"),
    REFRESH_TOKEN("refresh");

    private final String value;
}
