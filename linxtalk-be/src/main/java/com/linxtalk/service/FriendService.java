package com.linxtalk.service;

import com.linxtalk.dto.response.FriendResponse;
import com.linxtalk.entity.ConversationMember;
import com.linxtalk.entity.Friend;
import com.linxtalk.entity.User;
import com.linxtalk.enumeration.ConversationType;
import com.linxtalk.mapper.FriendMapper;
import com.linxtalk.mapper.UserMapper;
import com.linxtalk.repository.ConversationMemberRepository;
import com.linxtalk.repository.FriendRepository;
import com.linxtalk.repository.UserRepository;
import com.linxtalk.repository.custom.FriendRepositoryCustom;
import com.linxtalk.utils.FnCommon;
import com.linxtalk.utils.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRepositoryCustom friendRepositoryCustom;
    private final FriendRepository friendRepository;
    private final UserRepository userRepository;
    private final PresenceService presenceService;
    private final FriendMapper friendMapper;

    public PageResponse<FriendResponse> getFriends(Boolean hasChatted, String sortBy, String sortDir, int pageNo, int pageSize) {
        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);

        String currentUserId = FnCommon.getUserId();
        Page<Friend> friends = friendRepositoryCustom.getFriends(currentUserId, hasChatted, pageable);

        List<String> friendIds = friends.map(Friend::getFriendId).getContent();
        Map<String, Boolean> onlineStatuses = presenceService.getOnlineStatuses(friendIds);

        List<User> users = userRepository.findAllById(friendIds);
        Map<String, User> userMap = users.stream().collect(Collectors.toMap(User::getId, Function.identity(), (a, b) -> a));

        List<FriendResponse> content = friends.getContent().stream()
                .map(friend -> {
                    User user = userMap.get(friend.getFriendId());
                    Boolean isOnline = onlineStatuses.getOrDefault(friend.getFriendId(), false);
                    return friendMapper.toFriendResponse(friend, user, isOnline);
                })
                .toList();

        return PageResponse.<FriendResponse>builder()
                .pageSize(friends.getSize())
                .totalElements(friends.getTotalElements())
                .pageNumber(friends.getNumber())
                .totalPages(friends.getTotalPages())
                .data(content)
                .build();
    }

}

