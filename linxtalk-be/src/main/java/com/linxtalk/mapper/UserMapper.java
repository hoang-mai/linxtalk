package com.linxtalk.mapper;

import com.linxtalk.dto.response.FriendRequestResponse;
import com.linxtalk.dto.response.ProfileResponse;
import com.linxtalk.dto.response.UserSearchResponse;
import com.linxtalk.entity.FriendRequest;
import com.linxtalk.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserSearchResponse toUserSearchResponse(User user, FriendRequest friendRequest) {
        if (user == null) {
            return null;
        }

        return UserSearchResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .friendRequestResponse(toFriendRequestResponse(friendRequest))
                .build();
    }

    public ProfileResponse toProfileResponse(User user) {
        if (user == null) {
            return null;
        }

        return ProfileResponse.builder()
                .phoneNumber(user.getPhoneNumber())
                .birthday(user.getBirthday())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .bio(user.getBio())
                .build();
    }

    public FriendRequestResponse toFriendRequestResponse(FriendRequest friendRequest) {
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
                .build();
    }
}
