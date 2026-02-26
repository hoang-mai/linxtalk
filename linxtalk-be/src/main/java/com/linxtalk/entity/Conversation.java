package com.linxtalk.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
import java.util.List;

@Document(collection = "conversations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {

    @MongoId(FieldType.OBJECT_ID)
    private String id;

    @Builder.Default
    private ConversationType type = ConversationType.PRIVATE;

    // Chỉ dùng cho group chat
    private String name;

    private String avatarUrl;

    private String description;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private List<String> participantIds;

    @Field(targetType = FieldType.OBJECT_ID)
    private String creatorId;

    @Field(targetType = FieldType.OBJECT_ID)
    private List<String> adminIds;

    private LastMessage lastMessage;

    @Builder.Default
    private Boolean isActive = true;

    private Boolean isPinned;

    private Boolean isMuted;

    private ConversationSettings settings;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum ConversationType {
        PRIVATE, // Chat 1-1
        GROUP, // Nhóm chat
        CHANNEL // Kênh broadcast
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LastMessage {
        @Field(targetType = FieldType.OBJECT_ID)
        private String messageId;
        @Field(targetType = FieldType.OBJECT_ID)
        private String senderId;
        private String senderName;
        private String content;
        private Message.MessageType type;
        private Instant sentAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationSettings {
        @Builder.Default
        private Boolean onlyAdminsCanSend = false;
        @Builder.Default
        private Boolean onlyAdminsCanAddMembers = false;
        @Builder.Default
        private Boolean onlyAdminsCanEditInfo = true;
        @Builder.Default
        private Integer maxMembers = 500;
        @Builder.Default
        private Boolean disappearingMessages = false;
        private Long disappearingDuration; // in seconds
    }
}
