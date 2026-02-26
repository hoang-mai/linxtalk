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
import java.util.List;

@Document(collection = "polls")
@CompoundIndexes({
        @CompoundIndex(name = "conversation_created", def = "{'conversationId': 1, 'createdAt': -1}")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Poll {

    @MongoId(FieldType.OBJECT_ID)
    private String id;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String conversationId;

    @Field(targetType = FieldType.OBJECT_ID)
    private String messageId;

    @Field(targetType = FieldType.OBJECT_ID)
    private String creatorId;

    private String creatorName;

    private String question;

    private List<PollOption> options;

    @Builder.Default
    private PollSettings settings = new PollSettings();

    @Builder.Default
    private PollStatus status = PollStatus.ACTIVE;

    private Integer totalVotes;

    private Instant expiresAt;

    private Instant closedAt;

    @Field(targetType = FieldType.OBJECT_ID)
    private String closedBy;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum PollStatus {
        ACTIVE,
        CLOSED,
        EXPIRED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PollOption {
        @Field(targetType = FieldType.OBJECT_ID)
        private String id;
        private String text;
        private String emoji;
        @Builder.Default
        private Integer voteCount = 0;
        private List<Vote> votes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Vote {
        @Field(targetType = FieldType.OBJECT_ID)
        private String voterId;
        private String voterName;
        private Instant votedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PollSettings {
        @Builder.Default
        private Boolean allowMultipleChoices = false;

        @Builder.Default
        private Integer maxChoicesPerUser = 1;

        @Builder.Default
        private Boolean isAnonymous = false;

        @Builder.Default
        private Boolean showResultsBeforeVoting = false;

        @Builder.Default
        private Boolean allowAddOptions = false;

        @Builder.Default
        private Boolean allowChangeVote = true;

        // Chỉ người tạo mới xem được kết quả
        @Builder.Default
        private Boolean quizMode = false;

        // Đáp án đúng cho quiz mode
        @Field(targetType = FieldType.OBJECT_ID)
        private String correctOptionId;

        // Giải thích cho đáp án đúng
        private String explanation;
    }
}
