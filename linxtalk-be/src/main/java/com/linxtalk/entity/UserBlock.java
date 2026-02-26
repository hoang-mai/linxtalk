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

@Document(collection = "user_blocks")
@CompoundIndexes({
        @CompoundIndex(name = "blocker_blocked", def = "{'blockerId': 1, 'blockedUserId': 1}", unique = true),
        @CompoundIndex(name = "blocked_blocker", def = "{'blockedUserId': 1, 'blockerId': 1}")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBlock {

    @MongoId(FieldType.OBJECT_ID)
    private String id;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String blockerId;

    private String blockerName;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String blockedUserId;

    private String blockedUserName;

    private String blockedUserAvatarUrl;

    private BlockReason reason;

    private String customReason;

    // Nguồn block (từ chat, profile, report...)
    private BlockSource source;

    // ID conversation nếu block từ chat
    @Field(targetType = FieldType.OBJECT_ID)
    private String conversationId;

    // Các quyền bị chặn
    @Builder.Default
    private BlockSettings settings = new BlockSettings();

    @Builder.Default
    private Boolean isActive = true;

    // Thời gian block tạm thời (null = vĩnh viễn)
    private Instant expiresAt;

    private Instant unblockedAt;

    private String unblockedReason;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum BlockReason {
        SPAM,
        HARASSMENT,
        UNWANTED_CONTACT,
        OFFENSIVE_CONTENT,
        SCAM,
        FAKE_ACCOUNT,
        PERSONAL,
        OTHER
    }

    public enum BlockSource {
        PROFILE,
        CONVERSATION,
        FRIEND_REQUEST,
        REPORT,
        SYSTEM,
        ADMIN
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlockSettings {
        // Chặn nhắn tin
        @Builder.Default
        private Boolean blockMessages = true;

        // Chặn gọi điện
        @Builder.Default
        private Boolean blockCalls = true;

        // Chặn thêm vào group
        @Builder.Default
        private Boolean blockGroupInvites = true;

        // Ẩn trạng thái online
        @Builder.Default
        private Boolean hideOnlineStatus = true;

        // Ẩn story
        @Builder.Default
        private Boolean hideStory = true;

        // Ẩn last seen
        @Builder.Default
        private Boolean hideLastSeen = true;

        // Ẩn profile picture
        @Builder.Default
        private Boolean hideProfilePicture = true;

        // Ẩn bio/about
        @Builder.Default
        private Boolean hideAbout = true;
    }
}
