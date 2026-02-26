package com.linxtalk.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Document(collection = "message_reactions")
@CompoundIndexes({
        @CompoundIndex(name = "message_user", def = "{'messageId': 1, 'userId': 1}", unique = true),
        @CompoundIndex(name = "message_emoji", def = "{'messageId': 1, 'emoji': 1}"),
        @CompoundIndex(name = "conversation_created", def = "{'conversationId': 1, 'createdAt': -1}")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageReaction {

    @MongoId(FieldType.OBJECT_ID)
    private String id;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String messageId;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String conversationId;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;

    private String userName;

    private String userAvatarUrl;

    // Emoji reaction (unicode hoặc custom emoji code)
    private String emoji;

    // Tên emoji để hiển thị tooltip
    private String emojiName;

    // Loại emoji
    @Builder.Default
    private EmojiType emojiType = EmojiType.UNICODE;

    // URL cho custom emoji
    private String customEmojiUrl;

    // Pack ID nếu là custom emoji
    @Field(targetType = FieldType.OBJECT_ID)
    private String emojiPackId;

    // Skin tone variation (nếu có)
    private String skinTone;

    @CreatedDate
    private Instant createdAt;

    public enum EmojiType {
        UNICODE, // Emoji unicode chuẩn
        CUSTOM, // Custom emoji của server
        ANIMATED, // Emoji động
        STICKER_MINI // Mini sticker dùng như reaction
    }

    // Helper class để aggregate reactions
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReactionSummary {
        private String emoji;
        private String emojiName;
        private EmojiType emojiType;
        private String customEmojiUrl;
        private Integer count;
        private Boolean userReacted; // User hiện tại đã react chưa
    }

    // Helper class cho reaction count per message
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageReactionCount {
        @Field(targetType = FieldType.OBJECT_ID)
        private String messageId;
        private Integer totalReactions;
        private Integer uniqueEmojis;
        private java.util.List<ReactionSummary> topReactions;
    }
}
