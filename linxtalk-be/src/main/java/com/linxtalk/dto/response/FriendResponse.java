package com.linxtalk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendResponse {
    private String id;
    private String avatarUrl;
    private String displayName;
    private Boolean isOnline;
    private Instant lastSeenAt;
    private Instant createdAt;
    private Instant updatedAt;
}

