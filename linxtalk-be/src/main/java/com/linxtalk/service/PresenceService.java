package com.linxtalk.service;

import com.linxtalk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.TimeUnit;

import static com.linxtalk.utils.Constant.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PresenceService {

    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;


    /**
     * Updates the user's online status in Redis and refreshes lastSeenAt in MongoDB.
     * @param userId The ID of the user.
     * @param sessionId The ID of the current session.
     */
    public void updateUserPresence(String userId, String sessionId) {
        if (userId == null || sessionId == null) return;

        try {
            String userKey = PRESENCE_USER_KEY_PREFIX + userId;
            String sessionKey = PRESENCE_SESSION_KEY_PREFIX + sessionId + ":" + userId;
            String offlineKey = PRESENCE_OFFLINE_KEY + userId;
            String onlineKey = PRESENCE_ONLINE_KEY_PREFIX + userId;

            redisTemplate.opsForSet().add(userKey, sessionId);
            redisTemplate.opsForValue().set(sessionKey, "ONLINE", PRESENCE_TTL_SECONDS, TimeUnit.SECONDS);
            redisTemplate.opsForValue().set(onlineKey, "1",  PRESENCE_TTL_SECONDS, TimeUnit.SECONDS);
            redisTemplate.delete(offlineKey);

            log.debug("User {} session {} is now online", userId, sessionId);
        } catch (Exception e) {
            log.error("Failed to update presence for user: {}", userId, e);
        }
    }

    /**
     * Refreshes the session heartbeat TTL in Redis.
     * Called on every STOMP heartbeat to keep the session alive.
     * Only refreshes the session key TTL — no redundant writes.
     * @param userId The ID of the user.
     * @param sessionId The ID of the current session.
     */
    public void refreshSessionHeartbeat(String userId, String sessionId) {
        if (userId == null || sessionId == null) return;

        try {
            String sessionKey = PRESENCE_SESSION_KEY_PREFIX + sessionId + ":" + userId;
            String onlineKey = PRESENCE_ONLINE_KEY_PREFIX + userId;
            redisTemplate.expire(onlineKey, PRESENCE_TTL_SECONDS, TimeUnit.SECONDS);
            redisTemplate.expire(sessionKey, PRESENCE_TTL_SECONDS, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("Failed to refresh heartbeat for user: {}, session: {}", userId, sessionId, e);
        }
    }

    /**
     * Removes a specific session from the user's online status in Redis.
     * @param userId The ID of the user.
     * @param sessionId The ID of the session to remove.
     */
    public void removeUserPresence(String userId, String sessionId) {
        if (userId == null || sessionId == null) return;

        try {
            String userKey = PRESENCE_USER_KEY_PREFIX + userId;
            String sessionKey = PRESENCE_SESSION_KEY_PREFIX + sessionId + ":" + userId;
            
            redisTemplate.delete(sessionKey);
            redisTemplate.opsForSet().remove(userKey, sessionId);
            
            Long remainingSessions = redisTemplate.opsForSet().size(userKey);
            
            if (remainingSessions == null || remainingSessions == 0) {
                redisTemplate.delete(userKey);
                redisTemplate.delete(PRESENCE_ONLINE_KEY_PREFIX + userId);
                String offlineKey = PRESENCE_OFFLINE_KEY + userId;
                redisTemplate.opsForValue().set(offlineKey, "OFFLINE", 60, TimeUnit.SECONDS);
                
                log.info("User {} disconnected all sessions. Pending offline event scheduled.", userId);
            } else {
                log.debug("Session {} removed for user {}, {} sessions remaining", sessionId, userId, remainingSessions);
            }
        } catch (Exception e) {
            log.error("Failed to remove presence for user: {}, session: {}", userId, sessionId, e);
        }
    }

    /**
     * Removes a specific session from the user's online status in Redis.
     * This is called by the RedisKeyExpirationListener when a session heartbeat expires.
     * @param userId The ID of the user.
     * @param sessionId The ID of the session to remove.
     */
    public void removeUserPresenceBySessionExpire(String userId, String sessionId) {
        if (userId == null || sessionId == null) return;

        try {
            String userKey = PRESENCE_USER_KEY_PREFIX + userId;
            Long removed = redisTemplate.opsForSet().remove(userKey, sessionId);

            if (removed == null || removed == 0) {
                return;
            }

            Long remainingSessions = redisTemplate.opsForSet().size(userKey);

            if (remainingSessions == null || remainingSessions == 0) {
                redisTemplate.delete(userKey);
                
                redisTemplate.delete(PRESENCE_ONLINE_KEY_PREFIX + userId);

                String offlineKey = PRESENCE_OFFLINE_KEY + userId;
                redisTemplate.opsForValue().set(offlineKey, "OFFLINE", 60, TimeUnit.SECONDS);

                log.info("Session {} expired for user {}. Pending offline event scheduled.", sessionId, userId);
            } else {
                log.debug("Session {} expired for user {}, {} sessions remaining", sessionId, userId, remainingSessions);
            }
        } catch (Exception e) {
            log.error("Error removing session presence for user: {}, session: {}", userId, sessionId, e);
        }
    }

    /**
     * Finalizes the offline status in the database.
     * This is called by the RedisKeyExpirationListener when a pending key expires.
     * @param userId The ID of the user.
     */
    public void performOfflineDatabaseUpdate(String userId) {
        try {
            String onlineKey = PRESENCE_ONLINE_KEY_PREFIX + userId;
            Boolean isOnline = redisTemplate.hasKey(onlineKey);

            if (Boolean.FALSE.equals(isOnline)) {
                userRepository.updateLastSeenAt(userId, Instant.now().minusSeconds(60));
                log.info("User {} is now officially offline. Database updated.", userId);
            } else {
                log.info("User {} reconnected before event firing. Skipping database update.", userId);
            }
        } catch (Exception e) {
            log.error("Error performing offline database update for user: {}", userId, e);
        }
    }
}
