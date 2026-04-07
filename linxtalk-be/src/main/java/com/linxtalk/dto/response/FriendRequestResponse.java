package com.linxtalk.dto.response;

import com.linxtalk.entity.FriendRequest;
import com.linxtalk.enumeration.FriendRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestResponse {
    private String id;
    private String senderId;
    private String senderName;
    private String senderAvatarUrl;
    private String receiverId;
    private String message;
    private FriendRequestStatus status;
    private Instant respondedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
