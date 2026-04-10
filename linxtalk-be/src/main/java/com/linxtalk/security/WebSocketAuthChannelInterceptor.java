package com.linxtalk.security;

import com.linxtalk.service.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }

        String token = extractBearerToken(accessor);
        if (!isValidAccessToken(token)) {
            throw new BadCredentialsException("Invalid websocket access token");
        }

        String userId = jwtUtil.extractUserId(token);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
        accessor.setUser(authentication);

        return message;
    }

    private String extractBearerToken(StompHeaderAccessor accessor) {
        String bearerToken = accessor.getFirstNativeHeader(HttpHeaders.AUTHORIZATION);
        if (!StringUtils.hasText(bearerToken)) {
            bearerToken = accessor.getFirstNativeHeader("authorization");
        }

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }

    private boolean isValidAccessToken(String token) {
        if (!StringUtils.hasText(token)) {
            return false;
        }

        try {
            return !jwtUtil.isTokenExpired(token)
                    && jwtUtil.isAccessToken(token)
                    && !tokenBlacklistService.isBlacklisted(token);
        } catch (Exception ignored) {
            return false;
        }
    }
}


