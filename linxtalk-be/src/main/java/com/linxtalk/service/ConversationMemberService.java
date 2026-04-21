package com.linxtalk.service;

import com.linxtalk.dto.request.UpdateConversationMemberRequest;
import com.linxtalk.entity.ConversationMember;
import com.linxtalk.exception.ResourceNotFoundException;
import com.linxtalk.repository.ConversationMemberRepository;
import com.linxtalk.utils.FnCommon;
import com.linxtalk.utils.MessageError;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ConversationMemberService {

    private final ConversationMemberRepository conversationMemberRepository;

    public void updateConversationMember(String conversationId, UpdateConversationMemberRequest request) {
        String currentUserId = FnCommon.getUserId();
        ConversationMember conversationMember = conversationMemberRepository
                .findByConversationIdAndUserIdAndIsActiveTrue(conversationId, currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageError.CONVERSATION_MEMBER_NOT_FOUND, conversationId));

        if (request.getIsPinned() != null) {
            conversationMember.setIsPinned(request.getIsPinned());
        }

        if (request.getIsMuted() != null) {
            conversationMember.setIsMuted(request.getIsMuted());
            if (!request.getIsMuted()) {
                conversationMember.setMuteUntil(null);
            }
        }

        if (request.getMuteUntil() != null) {
            conversationMember.setMuteUntil(request.getMuteUntil());
            conversationMember.setIsMuted(true);
        }

        if (request.getIsArchived() != null) {
            conversationMember.setIsArchived(request.getIsArchived());
        }

        conversationMemberRepository.save(conversationMember);
    }

    public void deleteConversationMember(String conversationId) {
        String currentUserId = FnCommon.getUserId();
        ConversationMember conversationMember = conversationMemberRepository
                .findByConversationIdAndUserIdAndIsActiveTrue(conversationId, currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageError.CONVERSATION_MEMBER_NOT_FOUND, conversationId));

        conversationMember.setIsActive(false);
        conversationMemberRepository.save(conversationMember);
    }
}

