package com.linxtalk.mapper;

import com.linxtalk.dto.response.ConversationResponse;
import com.linxtalk.entity.Conversation;
import com.linxtalk.entity.ConversationMember;
import org.springframework.stereotype.Component;

@Component
public class ConversationMapper {

    public ConversationResponse toResponse(Conversation conversation, ConversationMember member,
                                           String name, String avatarUrl) {
        if (conversation == null) return null;
        return ConversationResponse.builder()
                .id(conversation.getId())
                .type(conversation.getType())
                .name(name)
                .avatarUrl(avatarUrl)
                .lastMessage(mapLastMessage(conversation.getLastMessage()))
                .unreadCount(member != null ? member.getUnreadCount() : 0)
                .isPinned(member != null ? member.getIsPinned() : false)
                .isMuted(member != null ? member.getIsMuted() : false)
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }

    private ConversationResponse.LastMessageResponse mapLastMessage(Conversation.LastMessage lastMessage) {
        if (lastMessage == null) return null;

        return ConversationResponse.LastMessageResponse.builder()
                .messageId(lastMessage.getMessageId())
                .senderId(lastMessage.getSenderId())
                .senderName(lastMessage.getSenderName())
                .content(lastMessage.getContent())
                .type(lastMessage.getType())
                .sentAt(lastMessage.getSentAt())
                .build();
    }
}
