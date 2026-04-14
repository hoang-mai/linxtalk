package com.linxtalk.service;

import com.linxtalk.dto.request.UpdateAvatarRequest;
import com.linxtalk.dto.request.UpdateProfileRequest;
import com.linxtalk.dto.response.ProfileResponse;
import com.linxtalk.dto.response.UserSearchResponse;
import com.linxtalk.entity.Friend;
import com.linxtalk.entity.FriendRequest;
import com.linxtalk.entity.User;
import com.linxtalk.event.UserUpdateEvent;
import com.linxtalk.exception.ResourceNotFoundException;
import com.linxtalk.mapper.UserMapper;
import com.linxtalk.repository.FriendRepository;
import com.linxtalk.repository.FriendRequestRepository;
import com.linxtalk.repository.UserRepository;
import com.linxtalk.utils.FnCommon;
import com.linxtalk.utils.MessageError;
import com.linxtalk.utils.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final FriendRepository friendRepository;
    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final UserMapper userMapper;
    private final PresenceService presenceService;
    private final ApplicationEventPublisher eventPublisher;

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

        String oldDisplayName = user.getDisplayName();
        String newDisplayName = request.getDisplayName();

        user.setDisplayName(newDisplayName);
        user.setBio(request.getBio());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setBirthday(request.getBirthday());

        userRepository.save(user);

        if (!Objects.equals(oldDisplayName, newDisplayName)) {
            eventPublisher.publishEvent(UserUpdateEvent.builder()
                    .userId(user.getId())
                    .displayName(newDisplayName)
                    .build());
        }
    }

    public ProfileResponse getProfile() {
        String userId = FnCommon.getUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND));

        return userMapper.toProfileResponse(user);
    }

    public PageResponse<UserSearchResponse> getFriends(String sortBy, String sortDir, int pageNo, int pageSize) {
        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);

        String currentUserId = FnCommon.getUserId();
        Page<Friend> friends = friendRepository.findByUserId(currentUserId, pageable);

        List<String> friendIds = friends.map(Friend::getFriendId).getContent();
        Map<String, Boolean> onlineStatuses = presenceService.getOnlineStatuses(friendIds);

        List<User> users = userRepository.findAllById(friendIds);
        Map<String, User> userMap = users.stream().collect(Collectors.toMap(User::getId, Function.identity(),(a, b) -> a));

        List<UserSearchResponse> content = friends.getContent().stream()
                .map(friend -> {
                    User user = userMap.get(friend.getFriendId());
                    Boolean isOnline = onlineStatuses.getOrDefault(friend.getFriendId(), false);
                    return userMapper.toUserSearchResponse(user, isOnline);
                })
                .toList();

        return PageResponse.<UserSearchResponse>builder()
                .pageSize(friends.getSize())
                .totalElements(friends.getTotalElements())
                .pageNumber(friends.getNumber())
                .totalPages(friends.getTotalPages())
                .data(content)
                .build();
    public void updateAvatar(UpdateAvatarRequest request) {
        String userId = FnCommon.getUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND));

        user.setAvatarUrl(request.getAvatarUrl());
        userRepository.save(user);

        eventPublisher.publishEvent(UserUpdateEvent.builder()
                .userId(userId)
                .avatarUrl(request.getAvatarUrl())
                .build());
    }
}
