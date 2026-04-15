package com.linxtalk.enumeration;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ConversationType {
    PRIVATE("PRIVATE"), // Chat 1-1
    GROUP("GROUP"), // Nhóm chat
    CHANNEL("CHANNEL"); // Kênh broadcast
    private final String type;
}