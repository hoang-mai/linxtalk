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
public class UserSearchResponse {
    private String id;
    private String username;
    private String email;
    private String displayName;
    private String avatarUrl;
    private Boolean isOnline;
    private Instant lastSeenAt;
    private FriendRequestResponse friendRequestResponse;
}
