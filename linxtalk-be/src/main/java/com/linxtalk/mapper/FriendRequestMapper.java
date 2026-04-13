package com.linxtalk.mapper;

import com.linxtalk.dto.response.FriendRequestResponse;
import com.linxtalk.dto.response.UserSearchResponse;
import com.linxtalk.entity.FriendRequest;
import com.linxtalk.entity.User;
import org.springframework.stereotype.Component;

@Component
public class FriendRequestMapper {

    public FriendRequestResponse toFriendRequestResponse(FriendRequest friendRequest) {
        return toFriendRequestResponse(friendRequest, null);
    }

    public FriendRequestResponse toFriendRequestResponse(FriendRequest friendRequest, User sender) {
        return toFriendRequestResponse(friendRequest, sender, null);
    }

    public FriendRequestResponse toFriendRequestResponse(FriendRequest friendRequest, User sender, Boolean isOnline) {
        if (friendRequest == null) {
            return null;
        }

        return FriendRequestResponse.builder()
                .id(friendRequest.getId())
                .senderId(friendRequest.getSenderId())
                .receiverId(friendRequest.getReceiverId())
                .message(friendRequest.getMessage())
                .status(friendRequest.getStatus())
                .respondedAt(friendRequest.getRespondedAt())
                .createdAt(friendRequest.getCreatedAt())
                .updatedAt(friendRequest.getUpdatedAt())
                .sender(toUserSearchResponse(sender, isOnline))
                .build();
    }

    private UserSearchResponse toUserSearchResponse(User user, Boolean isOnline) {
        if (user == null) {
            return null;
        }

        return UserSearchResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .lastSeenAt(user.getLastSeenAt())
                .isOnline(isOnline)
                .build();
    }
}

