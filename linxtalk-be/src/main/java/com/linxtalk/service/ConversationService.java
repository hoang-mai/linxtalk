package com.linxtalk.service;

import com.linxtalk.dto.response.ConversationResponse;
import com.linxtalk.entity.Conversation;
import com.linxtalk.entity.ConversationMember;
import com.linxtalk.enumeration.ConversationType;
import com.linxtalk.mapper.ConversationMapper;
import com.linxtalk.repository.ConversationMemberRepository;
import com.linxtalk.repository.ConversationRepository;
import com.linxtalk.utils.FnCommon;
import com.linxtalk.utils.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final ConversationMapper conversationMapper;

    /**
     * Get list conversation
     * - Sort by pinned first, then sort by last message time
     * - If content is empty, get list friend which don't have conversation yet, and sort by friend created time.
     * - Call other API to get list friend which don't have conversation yet
     * @param pageNo
     * @param pageSize
     * @return {@code PageResponse<ConversationResponse>}
     */
    public PageResponse<ConversationResponse> getConversations(int pageNo, int pageSize) {
        String currentUserId = FnCommon.getUserId();
        Pageable pageable = PageRequest.of(pageNo, pageSize,
                Sort.by("isPinned").descending().and(Sort.by("lastMessageAt").descending()));

        Page<ConversationMember> membersPage = conversationMemberRepository
                .findByUserIdAndIsActiveTrue(currentUserId, pageable);

        List<String> conversationIds = membersPage.getContent().stream()
                .map(ConversationMember::getConversationId)
                .toList();

        List<Conversation> conversations = conversationRepository.findAllById(conversationIds);
        Map<String, Conversation> conversationMap = conversations.stream()
                .collect(Collectors.toMap(Conversation::getId, Function.identity()));

        List<ConversationResponse> data = membersPage.getContent().stream()
                .map(member -> {
                    Conversation conversation = conversationMap.get(member.getConversationId());
                    if (conversation == null) return null;

                    String name = conversation.getName();
                    String avatarUrl = conversation.getAvatarUrl();

                    if (conversation.getType() == ConversationType.PRIVATE) {
                        name = StringUtils.hasText(member.getOtherNickname()) ? member.getOtherNickname() : member.getOtherDisplayName();
                        avatarUrl = member.getOtherAvatarUrl();
                    }

                    return conversationMapper.toResponse(conversation, member, name, avatarUrl);
                })
                .filter(Objects::nonNull)
                .toList();

        return PageResponse.<ConversationResponse>builder()
                .pageNumber(membersPage.getNumber())
                .pageSize(membersPage.getSize())
                .totalElements(membersPage.getTotalElements())
                .totalPages(membersPage.getTotalPages())
                .hasNext(membersPage.hasNext())
                .hasPrevious(membersPage.hasPrevious())
                .data(data)
                .build();
    }

}
