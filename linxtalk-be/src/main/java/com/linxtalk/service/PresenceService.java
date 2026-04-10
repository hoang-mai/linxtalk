package com.linxtalk.service;

import com.linxtalk.entity.User;
import com.linxtalk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class PresenceService {

    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;

    private static final String PRESENCE_KEY_PREFIX = "presence:status:";
    private static final long PRESENCE_TTL_SECONDS = 60;

    /**
     * Updates the user's online status in Redis and refreshes lastSeenAt in MongoDB.
     * @param userId The ID of the user.
     */
    public void updateUserPresence(String userId) {
        if (userId == null) return;

        try {
            // Update Redis with a TTL
            String key = PRESENCE_KEY_PREFIX + userId;
            redisTemplate.opsForValue().set(key, "ONLINE", PRESENCE_TTL_SECONDS, TimeUnit.SECONDS);

            // Update lastSeenAt in MongoDB
            userRepository.findById(userId).ifPresent(user -> {
                user.setLastSeenAt(Instant.now());
                userRepository.save(user);
            });

            log.debug("Updated presence for user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to update presence for user: {}", userId, e);
        }
    }

    /**
     * Removes the user's online status from Redis.
     * @param userId The ID of the user.
     */
    public void removeUserPresence(String userId) {
        if (userId == null) return;

        try {
            String key = PRESENCE_KEY_PREFIX + userId;
            redisTemplate.delete(key);
            
            // Also update lastSeenAt one last time on disconnect
            userRepository.findById(userId).ifPresent(user -> {
                user.setLastSeenAt(Instant.now());
                userRepository.save(user);
            });
            
            log.debug("Removed presence for user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to remove presence for user: {}", userId, e);
        }
    }
}
