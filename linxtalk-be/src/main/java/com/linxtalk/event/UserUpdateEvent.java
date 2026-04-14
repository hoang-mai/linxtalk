package com.linxtalk.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UserUpdateEvent {
    private final String userId;
    private final String displayName;
    private final String avatarUrl;
}
