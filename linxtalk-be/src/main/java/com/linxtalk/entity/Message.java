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
import java.util.List;

@Document(collection = "messages")
@CompoundIndexes({
        @CompoundIndex(name = "conversation_timestamp", def = "{'conversationId': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "sender_timestamp", def = "{'senderId': 1, 'createdAt': -1}")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @MongoId(FieldType.OBJECT_ID)
    private String id;

    @Indexed
    private ObjectId conversationId;

    @Indexed
    private ObjectId senderId;

    private String senderName;

    private String senderAvatarUrl;

    @Builder.Default
    private MessageType type = MessageType.TEXT;

    private String content;

    private List<Attachment> attachments;

    private ReplyTo replyTo;

    private List<Reaction> reactions;

    private List<ObjectId> mentionedUserIds;

    private List<ReadReceipt> readReceipts;

    @Builder.Default
    private MessageStatus status = MessageStatus.SENT;

    @Builder.Default
    private Boolean isEdited = false;

    private Instant editedAt;

    @Builder.Default
    private Boolean isDeleted = false;

    private Instant deletedAt;

    @Builder.Default
    private Boolean isPinned = false;

    private Instant pinnedAt;

    private ObjectId pinnedBy;

    private ForwardInfo forwardInfo;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum MessageType {
        TEXT,
        IMAGE,
        VIDEO,
        AUDIO,
        FILE,
        STICKER,
        GIF,
        LOCATION,
        CONTACT,
        VOICE_NOTE,
        SYSTEM, // Thông báo hệ thống (vào/ra nhóm, đổi tên, etc.)
        POLL,
        CALL // Thông báo cuộc gọi
    }

    public enum MessageStatus {
        SENDING,
        SENT,
        DELIVERED,
        READ,
        FAILED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Attachment {
        private ObjectId id;
        private AttachmentType type;
        private String url;
        private String thumbnailUrl;
        private String fileName;
        private String mimeType;
        private Long fileSize;
        private Integer width;
        private Integer height;
        private Long duration; // For audio/video in milliseconds
    }

    public enum AttachmentType {
        IMAGE,
        VIDEO,
        AUDIO,
        FILE,
        STICKER,
        GIF
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReplyTo {
        private ObjectId messageId;
        private ObjectId senderId;
        private String senderName;
        private String content;
        private MessageType type;
        private String attachmentPreview;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Reaction {
        private ObjectId userId;
        private String userName;
        private String emoji;
        private Instant reactedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReadReceipt {
        private ObjectId userId;
        private Instant readAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForwardInfo {
        private ObjectId originalMessageId;
        private ObjectId originalConversationId;
        private ObjectId originalSenderId;
        private Instant originalSentAt;
    }
}
