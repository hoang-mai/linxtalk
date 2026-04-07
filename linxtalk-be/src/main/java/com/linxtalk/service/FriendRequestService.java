package com.linxtalk.service;

import com.linxtalk.dto.request.CreateFriendRequestRequest;
import com.linxtalk.dto.request.UpdateFriendRequestStatusRequest;
import com.linxtalk.dto.response.FriendRequestResponse;
import com.linxtalk.entity.FriendRequest;
import com.linxtalk.entity.User;
import com.linxtalk.enumeration.FriendRequestStatus;
import com.linxtalk.exception.DuplicateException;
import com.linxtalk.exception.ResourceNotFoundException;
import com.linxtalk.mapper.UserMapper;
import com.linxtalk.repository.FriendRequestRepository;
import com.linxtalk.repository.UserRepository;
import com.linxtalk.utils.FnCommon;
import com.linxtalk.utils.MessageError;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class FriendRequestService {

    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;

    public void createFriendRequest(CreateFriendRequestRequest request) {
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

        String senderName = sender.getDisplayName();

        FriendRequest friendRequest = FriendRequest.builder()
                .senderId(sender.getId())
                .senderName(senderName)
                .senderAvatarUrl(sender.getAvatarUrl())
                .receiverId(receiver.getId())
                .message(request.getMessage())
                .status(FriendRequestStatus.PENDING)
                .build();
        friendRequestRepository.save(friendRequest);

    }

    /**
     * Update status of friend request
     * Both sender and receiver can update status if status = CANCELLED
     * Only receiver can update status if status = PENDING
     */
    public void updateStatus(String friendRequestId, UpdateFriendRequestStatusRequest request) {
        String currentUserId = FnCommon.getUserId();
        FriendRequest friendRequest = friendRequestRepository.findById(friendRequestId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageError.FRIEND_REQUEST_NOT_FOUND, friendRequestId));

        boolean isReceiver = Objects.equals(friendRequest.getReceiverId(), currentUserId);

        FriendRequestStatus newStatus = request.getStatus();
        FriendRequestStatus currentStatus = friendRequest.getStatus();

        if (newStatus == FriendRequestStatus.CANCELLED) {
            friendRequestRepository.deleteById(friendRequest.getId());
            return;
        }

        if (!isReceiver || currentStatus != FriendRequestStatus.PENDING) {
            throw new IllegalArgumentException(MessageError.FRIEND_REQUEST_STATUS_INVALID);
        }

        switch (newStatus) {
            case ACCEPTED:
                friendRequest.setStatus(FriendRequestStatus.ACCEPTED);
                break;

            case DECLINED:
                friendRequestRepository.deleteById(friendRequest.getId());
                break;

            default:
                throw new IllegalArgumentException(MessageError.FRIEND_REQUEST_STATUS_INVALID);
        }

        friendRequest.setRespondedAt(Instant.now());
        friendRequestRepository.save(friendRequest);
    }
}
