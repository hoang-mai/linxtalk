package com.linxtalk.listener;

import com.linxtalk.service.PresenceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.listener.KeyExpirationEventMessageListener;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Component;

import static com.linxtalk.utils.Constant.PRESENCE_OFFLINE_KEY;
import static com.linxtalk.utils.Constant.PRESENCE_SESSION_KEY_PREFIX;

@Component
@Slf4j
public class RedisKeyExpirationListener extends KeyExpirationEventMessageListener {

    private final PresenceService presenceService;

    public RedisKeyExpirationListener(RedisMessageListenerContainer listenerContainer, PresenceService presenceService) {
        super(listenerContainer);
        this.presenceService = presenceService;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String expiredKey = message.toString();
        if (expiredKey == null) return;

        // Case 1: Pending Offline Update Expired
        if (expiredKey.startsWith(PRESENCE_OFFLINE_KEY)) {
            String userId = expiredKey.replace(PRESENCE_OFFLINE_KEY, "");
            log.info("Received offline expiration event for user: {}. Finalizing DB update.", userId);
            presenceService.performOfflineDatabaseUpdate(userId);
        } 
        // Case 2: Session Heartbeat Expired
        else if (expiredKey.startsWith(PRESENCE_SESSION_KEY_PREFIX)) {
            String[] parts = expiredKey.split(":");
            if (parts.length >= 4) {
                String sessionId = parts[2];
                String userId = parts[3];
                log.info("Session heartbeat expired for user: {}, session: {}. Triggering cleanup.", userId, sessionId);
                presenceService.removeUserPresenceBySessionExpire(userId, sessionId);
            }
        }
    }
}
