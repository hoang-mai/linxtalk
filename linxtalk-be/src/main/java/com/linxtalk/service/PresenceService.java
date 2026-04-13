package com.linxtalk.service;

import com.linxtalk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.TimeUnit;

import static com.linxtalk.utils.Constant.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PresenceService {

    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;

    /**
     * Gets the online status for a collection of user IDs efficiently using Redis pipelining.
     * @param userIds The collection of user IDs to check.
     * @return A map where the key is the userId and the value is true if online, false otherwise.
     */
    public Map<String, Boolean> getOnlineStatuses(List<String> userIds) {
        if (userIds == null || userIds.isEmpty()) return Collections.emptyMap();

        try {
            List<Object> results = redisTemplate.executePipelined((RedisCallback<Object>) connection -> {

                for (String userId : userIds) {
                    byte[] onlineKey = (PRESENCE_ONLINE_KEY_PREFIX + userId).getBytes(StandardCharsets.UTF_8);
                    connection.keyCommands().exists(onlineKey);
                }
                return null;
            });

            Map<String, Boolean> statusMap = new HashMap<>();
            for (int i = 0; i < userIds.size(); i++) {
                Object result = results.get(i);
                boolean isOnline = false;
                if(result instanceof Boolean resultBoolean) {
                    isOnline = resultBoolean;
                }
                if(result instanceof Long resultLong) {
                    isOnline = resultLong > 0;
                }
                statusMap.put(userIds.get(i), isOnline);
            }
            return statusMap;
        } catch (Exception e) {
            log.error("Failed to fetch online statuses for batch", e);
            return Collections.emptyMap();
        }
    }

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
