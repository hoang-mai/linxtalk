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

@Document(collection = "media_files")
@CompoundIndexes({
        @CompoundIndex(name = "uploader_created", def = "{'uploaderId': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "conversation_created", def = "{'conversationId': 1, 'createdAt': -1}")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaFile {

    @MongoId(FieldType.OBJECT_ID)
    private String id;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String uploaderId;

    @Field(targetType = FieldType.OBJECT_ID)
    private String conversationId;

    @Field(targetType = FieldType.OBJECT_ID)
    private String messageId;

    private String fileName;

    private String originalFileName;

    private String mimeType;

    private MediaType type;

    private Long fileSize;

    private String url;

    private String thumbnailUrl;

    // Image/Video dimensions
    private Integer width;

    private Integer height;

    // Audio/Video duration in milliseconds
    private Long duration;

    // Checksum for deduplication
    private String checksum;

    @Builder.Default
    private Boolean isProcessed = false;

    @Builder.Default
    private Boolean isPublic = false;

    private Instant expiresAt;

    @CreatedDate
    private Instant createdAt;

    public enum MediaType {
        IMAGE,
        VIDEO,
        AUDIO,
        DOCUMENT,
        VOICE_NOTE,
        STICKER,
        GIF
    }
}
