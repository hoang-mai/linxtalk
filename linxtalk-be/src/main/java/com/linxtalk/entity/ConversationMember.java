package com.linxtalk.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Document(collection = "conversation_members")
@CompoundIndexes({
        @CompoundIndex(name = "conversation_user", def = "{'conversationId': 1, 'userId': 1}", unique = true),
        @CompoundIndex(name = "user_conversation", def = "{'userId': 1, 'conversationId': 1}")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationMember {

    @MongoId(FieldType.OBJECT_ID)
    private String id;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String conversationId;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;

    @Builder.Default
    private MemberRole role = MemberRole.MEMBER;

    private String nickname;

    // Tin nhắn cuối cùng user đã đọc trong cuộc hội thoại này
    @Field(targetType = FieldType.OBJECT_ID)
    private String lastReadMessageId;

    private Instant lastReadAt;

    // Số tin nhắn chưa đọc
    @Builder.Default
    private Integer unreadCount = 0;

    @Builder.Default
    private Boolean isMuted = false;

    private Instant muteUntil;

    @Builder.Default
    private Boolean isPinned = false;

    @Builder.Default
    private Boolean isArchived = false;

    @Builder.Default
    private NotificationLevel notificationLevel = NotificationLevel.ALL;

    private Instant joinedAt;

    @Field(targetType = FieldType.OBJECT_ID)
    private String addedBy;

    private Instant leftAt;

    @Field(targetType = FieldType.OBJECT_ID)
    private String removedBy;

    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum MemberRole {
        OWNER,
        ADMIN,
        MODERATOR,
        MEMBER
    }

    public enum NotificationLevel {
        ALL,
        MENTIONS_ONLY,
        NONE
    }
}
