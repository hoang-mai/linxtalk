package com.linxtalk.service;

import com.linxtalk.dto.request.CreateFriendRequestRequest;
import com.linxtalk.dto.request.UpdateFriendRequestStatusRequest;
import com.linxtalk.dto.response.FriendRequestResponse;
import com.linxtalk.entity.FriendRequest;
import com.linxtalk.entity.User;
import com.linxtalk.enumeration.FriendRequestStatus;
import com.linxtalk.exception.DuplicateException;
import com.linxtalk.exception.ResourceNotFoundException;
import com.linxtalk.mapper.FriendRequestMapper;
import com.linxtalk.repository.FriendRequestRepository;
import com.linxtalk.repository.UserRepository;
import com.linxtalk.repository.custom.FriendRequestRepositoryCustom;
import com.linxtalk.utils.FnCommon;
import com.linxtalk.utils.MessageError;
import com.linxtalk.utils.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class FriendRequestService {

    private final FriendRequestRepository friendRequestRepository;
    private final FriendRequestRepositoryCustom friendRequestRepositoryCustom;
    private final UserRepository userRepository;
    private final FriendRequestMapper friendRequestMapper;

    public FriendRequestResponse createFriendRequest(CreateFriendRequestRequest request) {
        String senderId = FnCommon.getUserId();
        String receiverId = request.getReceiverId();

        if (Objects.equals(senderId, receiverId)) {
            throw new IllegalArgumentException(MessageError.FRIEND_REQUEST_SELF_NOT_ALLOWED);
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND, senderId));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND, receiverId));

        boolean existingRequest = friendRequestRepository.findBySenderIdAndReceiverId(senderId, receiverId).isPresent()
                || friendRequestRepository.findBySenderIdAndReceiverId(receiverId, senderId).isPresent();
        if (existingRequest) {
            throw new DuplicateException(MessageError.FRIEND_REQUEST_ALREADY_EXISTS, receiverId);
        }

        FriendRequest friendRequest = FriendRequest.builder()
                .senderId(sender.getId())
                .receiverId(receiver.getId())
                .message(request.getMessage())
                .status(FriendRequestStatus.PENDING)
                .build();
        friendRequestRepository.save(friendRequest);
        return friendRequestMapper.toFriendRequestResponse(friendRequest, sender);
    }

    public PageResponse<FriendRequestResponse> getFriendRequests(FriendRequestStatus status, int pageNo, int pageSize) {
        String currentUserId = FnCommon.getUserId();
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("updatedAt").descending().and(Sort.by("id").descending()));

        Page<FriendRequest> friendRequests;
        List<String> senderIds;
        List<User> users;
        Map<String, User> userMap;
        List<FriendRequestResponse> data;
        switch (status) {
            case PENDING:
                friendRequests = friendRequestRepositoryCustom
                        .getFriendRequests(null, currentUserId, FriendRequestStatus.PENDING, pageable);

                senderIds = friendRequests.stream().map(FriendRequest::getSenderId).toList();
                users = userRepository.findAllById(senderIds);
                userMap = users.stream()
                        .collect(Collectors.toMap(User::getId, Function.identity(), (a, b) -> a));

                data = friendRequests.stream()
                        .map(request -> friendRequestMapper.toFriendRequestResponse(request, userMap.get(request.getSenderId())))
                        .toList();
                break;
            case ACCEPTED:
                friendRequests = friendRequestRepositoryCustom
                        .getFriends(currentUserId, pageable);

                senderIds = friendRequests.stream().map(FriendRequest::getSenderId).filter(senderId -> !Objects.equals(senderId, currentUserId)).toList();
                List<String> receiverIds = friendRequests.stream().map(FriendRequest::getReceiverId).filter(receiverId -> !Objects.equals(receiverId, currentUserId)).toList();

                List<String> friendIds = Stream.concat(senderIds.stream(), receiverIds.stream()).toList();
                users = userRepository.findAllById(friendIds);
                userMap = users.stream()
                        .collect(Collectors.toMap(User::getId, Function.identity(), (a, b) -> a));

                data = friendRequests.stream()
                        .map(request -> friendRequestMapper.toFriendRequestResponse(request, userMap.get(request.getSenderId())))
                        .toList();
                break;
            default:
                throw new IllegalArgumentException(MessageError.FRIEND_REQUEST_STATUS_INVALID);
        }


        return PageResponse.<FriendRequestResponse>builder()
                .pageSize(friendRequests.getSize())
                .pageNumber(friendRequests.getNumber())
                .totalElements(friendRequests.getTotalElements())
                .totalPages(friendRequests.getTotalPages())
                .hasNext(friendRequests.hasNext())
                .hasPrevious(friendRequests.hasPrevious())
                .data(data)
                .build();
    }

    /**
     * Update status of friend request
     * Both sender and receiver can update status if status = CANCELLED
     * Only receiver can update status if status = PENDING
     */
    public FriendRequestResponse updateStatus(String friendRequestId, UpdateFriendRequestStatusRequest request) {
        String currentUserId = FnCommon.getUserId();
        FriendRequest friendRequest = friendRequestRepository.findById(friendRequestId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageError.FRIEND_REQUEST_NOT_FOUND, friendRequestId));

        boolean isReceiver = Objects.equals(friendRequest.getReceiverId(), currentUserId);

        FriendRequestStatus newStatus = request.getStatus();
        FriendRequestStatus currentStatus = friendRequest.getStatus();

        if (newStatus == FriendRequestStatus.CANCELLED) {
            friendRequestRepository.deleteById(friendRequest.getId());
            return null;
        }

        if (!isReceiver || currentStatus != FriendRequestStatus.PENDING) {
            throw new IllegalArgumentException(MessageError.FRIEND_REQUEST_STATUS_INVALID);
        }

        switch (newStatus) {
            case ACCEPTED:
                friendRequest.setStatus(FriendRequestStatus.ACCEPTED);
                break;

            case REJECTED:
                friendRequestRepository.deleteById(friendRequest.getId());
                return null;

            default:
                throw new IllegalArgumentException(MessageError.FRIEND_REQUEST_STATUS_INVALID);
        }

        friendRequest.setRespondedAt(Instant.now());
        friendRequestRepository.save(friendRequest);
        return friendRequestMapper.toFriendRequestResponse(friendRequest);
    }
}
