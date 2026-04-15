package com.linxtalk.entity;

import com.linxtalk.enumeration.ConversationType;
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

    private ConversationType conversationType;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;

    @Builder.Default
    private MemberRole role = MemberRole.MEMBER;

    private String nickname;

    @Field(targetType= FieldType.OBJECT_ID)
    private String nicknameChangedById;

    private String nicknameChangedBy;

    private Instant nicknameChangedAt;

    private String displayName;

    private String avatarUrl;

    // Only for private chat
    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String otherUserId;

    private String otherNickname;

    private String otherDisplayName;

    private String otherAvatarUrl;

    @Field(targetType = FieldType.OBJECT_ID)
    private String lastReadMessageId;

    private Instant lastReadAt;

    @Builder.Default
    private Integer unreadCount = 0;

    @Builder.Default
    private Boolean isMuted = false;

    private Instant muteUntil;

    @Builder.Default
    private Boolean isPinned = false;

    private Instant lastMessageAt;

    @Builder.Default
    private Boolean isArchived = false;

    @Builder.Default
    private NotificationLevel notificationLevel = NotificationLevel.ALL;

    private Instant joinedAt;

    @Field(targetType= FieldType.OBJECT_ID)
    private String addedById;

    private String addedBy;

    private Instant leftAt;

    @Field(targetType = FieldType.OBJECT_ID)
    private String removedById;

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
