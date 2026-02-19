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
import java.util.List;

@Document(collection = "calls")
@CompoundIndexes({
        @CompoundIndex(name = "conversation_created", def = "{'conversationId': 1, 'createdAt': -1}")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Call {

    @MongoId(FieldType.OBJECT_ID)
    private String id;

    @Indexed
    private ObjectId conversationId;

    private ObjectId callerId;

    private String callerName;

    private CallType type;

    @Builder.Default
    private CallStatus status = CallStatus.INITIATING;

    private List<CallParticipant> participants;

    private Instant startedAt;

    private Instant endedAt;

    private Long duration; // in seconds

    private EndReason endReason;

    // Chất lượng cuộc gọi
    private CallQuality quality;

    @CreatedDate
    private Instant createdAt;

    public enum CallType {
        VOICE,
        VIDEO,
        GROUP_VOICE,
        GROUP_VIDEO
    }

    public enum CallStatus {
        INITIATING,
        RINGING,
        ONGOING,
        ENDED
    }

    public enum EndReason {
        COMPLETED,
        DECLINED,
        MISSED,
        BUSY,
        FAILED,
        CANCELLED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CallParticipant {
        private ObjectId userId;
        private String userName;
        private ParticipantStatus status;
        private Instant joinedAt;
        private Instant leftAt;
        private Boolean isMuted;
        private Boolean isCameraOff;
        private Boolean isScreenSharing;
    }

    public enum ParticipantStatus {
        INVITED,
        RINGING,
        JOINED,
        LEFT,
        DECLINED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CallQuality {
        private Integer packetLoss; // percentage
        private Integer latency; // in ms
        private Integer bitrate; // in kbps
        private String networkType;
    }
}
