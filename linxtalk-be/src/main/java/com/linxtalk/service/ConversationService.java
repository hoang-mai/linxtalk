package com.linxtalk.service;

import com.linxtalk.dto.request.CreateConversationRequest;
import com.linxtalk.dto.response.ConversationResponse;
import com.linxtalk.entity.Conversation;
import com.linxtalk.entity.ConversationMember;
import com.linxtalk.entity.User;
import com.linxtalk.enumeration.ConversationType;
import com.linxtalk.exception.ResourceNotFoundException;
import com.linxtalk.mapper.ConversationMapper;
import com.linxtalk.repository.ConversationMemberRepository;
import com.linxtalk.repository.ConversationRepository;
import com.linxtalk.repository.UserRepository;
import com.linxtalk.utils.FnCommon;
import com.linxtalk.utils.MessageError;
import com.linxtalk.utils.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final UserRepository userRepository;
    private final ConversationMapper conversationMapper;

    @Transactional
    public ConversationResponse createConversation(CreateConversationRequest request) {
        String currentUserId = FnCommon.getUserId();
        List<String> participantIds = new ArrayList<>(new HashSet<>(request.getParticipantIds()));
        if (participantIds.size() < 2) {
            throw new IllegalArgumentException(MessageError.CONVERSATION_PARTICIPANTS_INVALID);
        }

        List<User> participants = userRepository.findAllById(request.getParticipantIds());
        if (participants.size() != participantIds.size()) {
            throw new ResourceNotFoundException(MessageError.USER_NOT_FOUND);
        }
        Map<String, User> userMap = participants.stream()
                .collect(Collectors.toMap(User::getId, Function.identity(), (a, b) -> a));

        if (request.getType() == ConversationType.PRIVATE) {
            return createPrivateConversation(participantIds, currentUserId, userMap);
        }

        if (request.getType() != ConversationType.GROUP) {
            throw new IllegalArgumentException(MessageError.CONVERSATION_TYPE_INVALID);
        }

        if (!StringUtils.hasText(request.getName())) {
            throw new IllegalArgumentException(MessageError.CONVERSATION_NAME_REQUIRED);
        }

        Conversation conversation = Conversation.builder()
                .type(ConversationType.GROUP)
                .name(request.getName().trim())
                .avatarUrl(request.getAvatarUrl())
                .description(request.getDescription())
                .participantIds(participantIds)
                .creatorId(currentUserId)
                .adminIds(List.of(currentUserId))
                .settings(Conversation.ConversationSettings.builder().build())
                .build();
        Conversation savedConversation = conversationRepository.save(conversation);

        Instant joinedAt = Instant.now();
        String creatorDisplayName = userMap.get(currentUserId).getDisplayName();
        List<ConversationMember> members = participantIds.stream()
                .map(participantId -> {
                    User participant = userMap.get(participantId);
                    return ConversationMember.builder()
                            .conversationId(savedConversation.getId())
                            .conversationType(ConversationType.GROUP)
                            .userId(participantId)
                            .displayName(participant.getDisplayName())
                            .avatarUrl(participant.getAvatarUrl())
                            .role(Objects.equals(participantId, currentUserId)
                                    ? ConversationMember.MemberRole.OWNER
                                    : ConversationMember.MemberRole.MEMBER)
                            .joinedAt(joinedAt)
                            .addedById(currentUserId)
                            .addedBy(creatorDisplayName)
                            .isActive(true)
                            .build();
                })
                .toList();
        conversationMemberRepository.saveAll(members);

        ConversationMember currentMember = members.stream()
                .filter(member -> Objects.equals(member.getUserId(), currentUserId))
                .findFirst()
                .orElseThrow();

        return conversationMapper.toResponse(savedConversation, currentMember, savedConversation.getName(), savedConversation.getAvatarUrl());
    }

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

    private ConversationResponse createPrivateConversation(List<String> participantIds,
                                                           String currentUserId,
                                                           Map<String, User> userMap) {
        if (participantIds.size() != 2) {
            throw new IllegalArgumentException(MessageError.CONVERSATION_PARTICIPANTS_INVALID);
        }

        Conversation existingConversation = conversationRepository
                .findByConversationTypeAndParticipantIds(ConversationType.PRIVATE, participantIds)
                .orElse(null);
        if (existingConversation != null) {
            ConversationMember member = conversationMemberRepository
                    .findByConversationIdAndUserIdAndIsActiveTrue(existingConversation.getId(), currentUserId)
                    .orElse(null);
            String otherUserId = participantIds.stream()
                    .filter(id -> !Objects.equals(id, currentUserId))
                    .findFirst()
                    .orElseThrow();
            User otherUser = userMap.get(otherUserId);
            String conversationName = otherUser.getDisplayName();
            String conversationAvatarUrl = otherUser.getAvatarUrl();
            return conversationMapper.toResponse(existingConversation, member, conversationName, conversationAvatarUrl);
        }

        Conversation conversation = Conversation.builder()
                .type(ConversationType.PRIVATE)
                .participantIds(participantIds)
                .creatorId(currentUserId)
                .settings(Conversation.ConversationSettings.builder().build())
                .build();
        conversation = conversationRepository.save(conversation);

        String firstUserId = participantIds.get(0);
        String secondUserId = participantIds.get(1);
        User firstUser = userMap.get(firstUserId);
        User secondUser = userMap.get(secondUserId);
        Instant joinedAt = Instant.now();

        ConversationMember firstMember = ConversationMember.builder()
                .conversationId(conversation.getId())
                .conversationType(ConversationType.PRIVATE)
                .userId(firstUserId)
                .displayName(firstUser.getDisplayName())
                .avatarUrl(firstUser.getAvatarUrl())
                .otherUserId(secondUserId)
                .otherDisplayName(secondUser.getDisplayName())
                .otherAvatarUrl(secondUser.getAvatarUrl())
                .joinedAt(joinedAt)
                .isActive(true)
                .build();

        ConversationMember secondMember = ConversationMember.builder()
                .conversationId(conversation.getId())
                .conversationType(ConversationType.PRIVATE)
                .userId(secondUserId)
                .displayName(secondUser.getDisplayName())
                .avatarUrl(secondUser.getAvatarUrl())
                .otherUserId(firstUserId)
                .otherDisplayName(firstUser.getDisplayName())
                .otherAvatarUrl(firstUser.getAvatarUrl())
                .joinedAt(joinedAt)
                .isActive(true)
                .build();

        conversationMemberRepository.saveAll(List.of(firstMember, secondMember));

        ConversationMember currentMember = Objects.equals(firstUserId, currentUserId) ? firstMember : secondMember;
        User otherUser = Objects.equals(firstUserId, currentUserId) ? secondUser : firstUser;
        return conversationMapper.toResponse(conversation, currentMember, otherUser.getDisplayName(), otherUser.getAvatarUrl());
    }

}
