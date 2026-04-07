package com.linxtalk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private FriendRequestResponse friendRequestResponse;
}
