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

@Document(collection = "reports")
@CompoundIndexes({
        @CompoundIndex(name = "status_created", def = "{'status': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "type_status", def = "{'reportType': 1, 'status': 1}")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @MongoId(FieldType.OBJECT_ID)
    private String id;

    @Indexed
    private ObjectId reporterId;

    private String reporterName;

    private String reporterEmail;

    private ReportType reportType;

    private ReportReason reason;

    private String customReason;

    private String description;

    // ID của đối tượng bị report (userId, messageId, conversationId)
    @Indexed
    private ObjectId targetId;

    private TargetType targetType;

    // Thông tin bổ sung về target
    private TargetInfo targetInfo;

    // Bằng chứng đính kèm
    private List<Evidence> evidences;

    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    @Builder.Default
    private ReportPriority priority = ReportPriority.NORMAL;

    // Thông tin xử lý
    private Resolution resolution;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum ReportType {
        USER,
        MESSAGE,
        CONVERSATION,
        CALL,
        MEDIA
    }

    public enum TargetType {
        USER,
        MESSAGE,
        CONVERSATION,
        GROUP,
        CHANNEL,
        CALL,
        MEDIA_FILE
    }

    public enum ReportReason {
        SPAM,
        HARASSMENT,
        HATE_SPEECH,
        VIOLENCE,
        NUDITY,
        SCAM,
        FAKE_ACCOUNT,
        IMPERSONATION,
        INTELLECTUAL_PROPERTY,
        SELF_HARM,
        ILLEGAL_CONTENT,
        UNDERAGE,
        PRIVACY_VIOLATION,
        OTHER
    }

    public enum ReportStatus {
        PENDING,
        UNDER_REVIEW,
        RESOLVED,
        DISMISSED,
        ESCALATED
    }

    public enum ReportPriority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TargetInfo {
        // Thông tin user bị report
        private String userName;
        private String userEmail;
        private String userAvatarUrl;

        // Thông tin message bị report
        private String messageContent;
        private Instant messageSentAt;

        // Thông tin conversation bị report
        private String conversationName;
        private ObjectId conversationId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Evidence {
        private ObjectId id;
        private EvidenceType type;
        private String url;
        private String description;
        private Instant capturedAt;
    }

    public enum EvidenceType {
        SCREENSHOT,
        MESSAGE_LOG,
        MEDIA_FILE,
        LINK
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Resolution {
        private ObjectId reviewerId;
        private String reviewerName;

        private ResolutionAction action;

        private String notes;

        // Thời gian ban/restrict (nếu có)
        private Instant actionExpiresAt;

        private Instant resolvedAt;
    }

    public enum ResolutionAction {
        NO_ACTION,
        WARNING_ISSUED,
        CONTENT_REMOVED,
        USER_RESTRICTED,
        USER_SUSPENDED,
        USER_BANNED,
        ACCOUNT_DELETED,
        FORWARDED_TO_AUTHORITIES
    }
}
