package com.linxtalk.mapper;

import com.linxtalk.dto.response.FriendResponse;
import com.linxtalk.dto.response.UserSearchResponse;
import com.linxtalk.entity.Friend;
import com.linxtalk.entity.User;
import org.springframework.stereotype.Component;

@Component
public class FriendMapper {
    public FriendResponse toFriendResponse(Friend friend, User user, Boolean isOnline){
        if (user == null) {
            return null;
        }
        return FriendResponse.builder()
                .id(user.getId())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .isOnline(isOnline)
                .lastSeenAt(user.getLastSeenAt())
                .createdAt(friend.getCreatedAt())
                .updatedAt(friend.getUpdatedAt())
                .build();
    }
}
