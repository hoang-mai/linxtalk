package com.linxtalk.listener;

import com.linxtalk.event.UserUpdateEvent;
import com.linxtalk.repository.FriendRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventListener {

    private final FriendRepository friendRepository;

    @Async
    @EventListener
    public void handleUserUpdateEvent(UserUpdateEvent event) {
        log.info("Handling UserUpdateEvent for userId: {}. Updates - displayName: {}, avatarUrl: {}", 
                event.getUserId(), event.getDisplayName(), event.getAvatarUrl());
        try {
            if (event.getDisplayName() != null) {
                friendRepository.updateDisplayNameByFriendId(event.getUserId(), event.getDisplayName());
            }
            if (event.getAvatarUrl() != null) {
                friendRepository.updateAvatarByFriendId(event.getUserId(), event.getAvatarUrl());
            }
            log.info("Successfully pushed updates for friend records of user: {}", event.getUserId());
        } catch (Exception e) {
            log.error("Failed to update friend records via repository for userId: {}", event.getUserId(), e);
        }
    }
}
