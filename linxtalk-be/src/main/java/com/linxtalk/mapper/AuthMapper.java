package com.linxtalk.mapper;

import com.linxtalk.dto.response.AuthResponse;
import com.linxtalk.entity.User;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {

    public AuthResponse toAuthResponse(User user, String accessToken, String refreshToken) {
        if (user == null) {
            return null;
        }

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    public AuthResponse toAuthResponse(User user) {
        if (user == null) {
            return null;
        }

        return AuthResponse.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

}
