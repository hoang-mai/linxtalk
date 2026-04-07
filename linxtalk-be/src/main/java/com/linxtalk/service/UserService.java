package com.linxtalk.service;

import com.linxtalk.dto.request.UpdateProfileRequest;
import com.linxtalk.dto.response.ProfileResponse;
import com.linxtalk.dto.response.UserSearchResponse;
import com.linxtalk.entity.FriendRequest;
import com.linxtalk.entity.User;
import com.linxtalk.exception.ResourceNotFoundException;
import com.linxtalk.mapper.UserMapper;
import com.linxtalk.repository.FriendRequestRepository;
import com.linxtalk.repository.UserRepository;
import com.linxtalk.utils.FnCommon;
import com.linxtalk.utils.MessageError;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final UserMapper userMapper;

    public UserSearchResponse searchUser(String query) {
        String currentUserId = FnCommon.getUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND, currentUserId));
        User user;

        if (query.startsWith("@")) {
            String username = query.substring(1);
            user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND, query));
        } else if (query.contains("@gmail.com")) {
            user = userRepository.findByEmail(query)
                    .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND, query));
        } else {
            user = userRepository.findByUsername(query)
                    .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND, query));
        }

        if (Objects.equals(currentUserId, user.getId())
                || isBlocked(currentUser.getBlockedUserIds(), user.getId())
                || isBlocked(user.getBlockedUserIds(), currentUserId)) {
            throw new ResourceNotFoundException(MessageError.USER_NOT_FOUND, query);
        }

        FriendRequest friendRequest = friendRequestRepository.findBySenderIdAndReceiverId(currentUserId, user.getId())
                .orElse(friendRequestRepository.findBySenderIdAndReceiverId(user.getId(), currentUserId)
                        .orElse(null));
        return userMapper.toUserSearchResponse(user, friendRequest);
    }

    private boolean isBlocked(List<String> blockedUserIds, String userId) {
        if (blockedUserIds == null || userId == null) {
            return false;
        }

        return blockedUserIds.stream().anyMatch(id -> Objects.equals(id, userId));
    }

    public void updateProfile(UpdateProfileRequest request) {
        String userId = FnCommon.getUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND));
        user.setDisplayName(request.getDisplayName());
        user.setBio(request.getBio());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setBirthday(request.getBirthday());

        userRepository.save(user);
    }

    public ProfileResponse getProfile() {
        String userId = FnCommon.getUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND));

        return userMapper.toProfileResponse(user);
    }

}
