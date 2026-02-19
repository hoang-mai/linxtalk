package com.linxtalk.entity;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Document(collection = "friend_requests")
@CompoundIndexes({
        @CompoundIndex(name = "sender_receiver", def = "{'senderId': 1, 'receiverId': 1}", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequest {

    @MongoId(FieldType.OBJECT_ID)
    private String id;

    @Indexed
    private ObjectId senderId;

    private String senderName;

    private String senderAvatarUrl;

    @Indexed
    private ObjectId receiverId;

    private String message;

    @Builder.Default
    private FriendRequestStatus status = FriendRequestStatus.PENDING;

    private Instant respondedAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum FriendRequestStatus {
        PENDING,
        ACCEPTED,
        DECLINED,
        CANCELLED
    }
}
