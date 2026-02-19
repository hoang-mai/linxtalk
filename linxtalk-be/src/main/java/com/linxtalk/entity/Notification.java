package com.linxtalk.entity;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
import java.util.Map;

@Document(collection = "notifications")
@CompoundIndexes({
        @CompoundIndex(name = "user_created", def = "{'userId': 1, 'createdAt': -1}")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @MongoId(FieldType.OBJECT_ID)
    private String id;

    @Indexed
    private ObjectId userId;

    private NotificationType type;

    private String title;

    private String body;

    private String imageUrl;

    // ID liên quan (conversationId, messageId, userId, etc.)
    private ObjectId referenceId;

    private String referenceType;

    // Dữ liệu bổ sung dạng key-value
    private Map<String, String> data;

    @Builder.Default
    private Boolean isRead = false;

    private Instant readAt;

    @Builder.Default
    private Boolean isSent = false;

    private Instant sentAt;

    @CreatedDate
    private Instant createdAt;

    public enum NotificationType {
        NEW_MESSAGE,
        FRIEND_REQUEST,
        FRIEND_ACCEPTED,
        GROUP_INVITATION,
        GROUP_JOINED,
        MENTION,
        REACTION,
        CALL_INCOMING,
        CALL_MISSED,
        SYSTEM
    }
}
