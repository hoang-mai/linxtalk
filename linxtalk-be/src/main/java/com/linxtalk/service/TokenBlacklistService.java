package com.linxtalk.service;

import com.linxtalk.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private static final String BLACKLIST_PREFIX = "blacklist:";

    private final StringRedisTemplate redisTemplate;
    private final JwtUtil jwtUtil;

    public void blacklist(String token) {
        long remainingMs = jwtUtil.getRemainingExpiration(token);
        if (remainingMs > 0) {
            redisTemplate.opsForValue().set(
                    BLACKLIST_PREFIX + token,
                    "revoked",
                    remainingMs,
                    TimeUnit.MILLISECONDS);
        }
    }

    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token));
    }
}
