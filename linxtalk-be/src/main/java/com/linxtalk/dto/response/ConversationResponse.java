package com.linxtalk.dto.response;

import com.linxtalk.entity.Conversation;
import com.linxtalk.entity.Message;
import com.linxtalk.enumeration.ConversationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {
    private String id;
    private ConversationType type;
    private String name;
    private String avatarUrl;
    private LastMessageResponse lastMessage;
    private Integer unreadCount;
    private Boolean isPinned;
    private Boolean isMuted;
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LastMessageResponse {
        private String messageId;
        private String senderId;
        private String senderName;
        private String content;
        private Message.MessageType type;
        private Instant sentAt;
    }
}
