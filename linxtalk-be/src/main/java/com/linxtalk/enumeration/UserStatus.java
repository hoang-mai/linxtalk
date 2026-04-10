package com.linxtalk.enumeration;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserStatus {
    ONLINE("ONLINE"),
    OFFLINE("OFFLINE");
    private final String value;
}