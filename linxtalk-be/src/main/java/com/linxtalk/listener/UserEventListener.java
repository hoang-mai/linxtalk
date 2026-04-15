package com.linxtalk.listener;

import com.linxtalk.enumeration.ConversationType;
import com.linxtalk.event.UserUpdateEvent;
import com.linxtalk.repository.ConversationMemberRepository;
import com.linxtalk.repository.FriendRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventListener {

    private final FriendRepository friendRepository;
    private final ConversationMemberRepository conversationMemberRepository;

    @Async
    @EventListener
    public void handleUserUpdateEvent(UserUpdateEvent event) {
        log.info("Handling UserUpdateEvent for userId: {}. Updates - displayName: {}, avatarUrl: {}",
                event.getUserId(), event.getDisplayName(), event.getAvatarUrl());
        try {
            boolean hasDisplayName = event.getDisplayName() != null;
            boolean hasAvatarUrl = event.getAvatarUrl() != null;

            if (hasDisplayName && hasAvatarUrl) {
                friendRepository.updateProfileByFriendId(event.getUserId(), event.getDisplayName(), event.getAvatarUrl());
                conversationMemberRepository.updateProfileByUserId(event.getUserId(), event.getDisplayName(), event.getAvatarUrl());
                conversationMemberRepository.updateOtherProfileByUserId(ConversationType.PRIVATE,  event.getUserId(), event.getDisplayName(), event.getAvatarUrl());
            } else {
                if (hasDisplayName) {
                    friendRepository.updateDisplayNameByFriendId(event.getUserId(), event.getDisplayName());
                    conversationMemberRepository.updateDisplayNameByUserId(event.getUserId(), event.getDisplayName());
                    conversationMemberRepository.updateOtherDisplayNameByUserId(ConversationType.PRIVATE,  event.getUserId(), event.getDisplayName());
                }
                if (hasAvatarUrl) {
                    friendRepository.updateAvatarByFriendId(event.getUserId(), event.getAvatarUrl());
                    conversationMemberRepository.updateAvatarByUserId(event.getUserId(), event.getAvatarUrl());
                    conversationMemberRepository.updateOtherAvatarByUserId(ConversationType.PRIVATE,  event.getUserId(), event.getAvatarUrl());
                }
            }

            log.info("Successfully synced profile updates for userId: {}", event.getUserId());
        } catch (Exception e) {
            log.error("Failed to update records via repository for userId: {}", event.getUserId(), e);
        }
    }
}
