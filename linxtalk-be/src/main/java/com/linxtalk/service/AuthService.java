package com.linxtalk.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.linxtalk.dto.request.*;
import com.linxtalk.dto.response.AddAccountResponse;
import com.linxtalk.dto.response.AuthResponse;
import com.linxtalk.entity.DeviceToken;
import com.linxtalk.entity.User;
import com.linxtalk.exception.AuthenticationException;
import com.linxtalk.exception.DuplicateException;
import com.linxtalk.repository.DeviceTokenRepository;
import com.linxtalk.repository.UserRepository;
import com.linxtalk.security.JwtUtil;
import com.linxtalk.utils.FnCommon;
import com.linxtalk.utils.MessageError;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;

    @Value("${google.client-id}")
    private String googleClientId;

    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateException(MessageError.DUPLICATE_USERNAME, request.getUsername());
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .build();

        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AuthenticationException(MessageError.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthenticationException(MessageError.INVALID_CREDENTIALS);
        }

        String accessToken = jwtUtil.generateAccessToken(user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        saveDeviceToken(user, request, refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    public AddAccountResponse addAccount(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AuthenticationException(MessageError.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthenticationException(MessageError.INVALID_CREDENTIALS);
        }

        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        saveDeviceToken(user, request, refreshToken);

        return AddAccountResponse.builder()
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    public AuthResponse switchAccount(SwitchAccountRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AuthenticationException(MessageError.USERNAME_NOT_FOUND));

        DeviceToken deviceToken = deviceTokenRepository
                .findByUserIdAndDeviceId(user.getId(), request.getDeviceId())
                .orElseThrow(() -> new AuthenticationException(MessageError.INVALID_REFRESH_TOKEN));

        String oldRefreshToken = deviceToken.getRefreshToken();

        try {
            if (jwtUtil.isTokenExpired(oldRefreshToken) || !jwtUtil.isRefreshToken(oldRefreshToken)) {
                throw new AuthenticationException(MessageError.SESSION_EXPIRED);
            }
        } catch (AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            throw new AuthenticationException(MessageError.SESSION_EXPIRED);
        }

        String newAccessToken = jwtUtil.generateAccessToken(user.getId());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getId());

        deviceToken.setRefreshToken(newRefreshToken);
        deviceToken.setLastActiveAt(Instant.now());
        deviceTokenRepository.save(deviceToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    public void removeAccount(SwitchAccountRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AuthenticationException(MessageError.USERNAME_NOT_FOUND));

        deviceTokenRepository.deleteByUserIdAndDeviceId(user.getId(), request.getDeviceId());
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        DeviceToken deviceToken = deviceTokenRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new AuthenticationException(MessageError.INVALID_REFRESH_TOKEN));

        try {
            if (jwtUtil.isTokenExpired(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
                deviceTokenRepository.delete(deviceToken);
                throw new AuthenticationException(MessageError.INVALID_REFRESH_TOKEN);
            }
        } catch (Exception e) {
            deviceTokenRepository.delete(deviceToken);
            throw new AuthenticationException(MessageError.INVALID_REFRESH_TOKEN);
        }

        String userId = jwtUtil.extractUserId(refreshToken);

        String newAccessToken = jwtUtil.generateAccessToken(userId);
        String newRefreshToken = jwtUtil.generateRefreshToken(userId);

        deviceToken.setRefreshToken(newRefreshToken);
        deviceToken.setLastActiveAt(Instant.now());
        deviceTokenRepository.save(deviceToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    private void saveDeviceToken(User user, LoginRequest request, String refreshToken) {
        String userId = user.getId();
        DeviceToken deviceToken = deviceTokenRepository
                .findByUserIdAndDeviceId(userId, request.getDeviceId())
                .orElse(DeviceToken.builder()
                        .userId(userId)
                        .deviceId(request.getDeviceId())
                        .build());

        deviceToken.setRefreshToken(refreshToken);
        deviceToken.setPlatform(request.getPlatform());
        deviceToken.setDeviceName(request.getDeviceName());
        deviceToken.setDeviceModel(request.getDeviceModel());
        deviceToken.setOsVersion(request.getOsVersion());
        deviceToken.setAppVersion(request.getAppVersion());
        deviceToken.setLastActiveAt(Instant.now());

        deviceTokenRepository.save(deviceToken);
    }

    public void logout(String accessToken, LogoutRequest request) {
        tokenBlacklistService.blacklist(accessToken);
        String userId = FnCommon.getUserId();
        deviceTokenRepository.deleteByUserIdAndDeviceId(userId, request.getDeviceId());
    }

    public AuthResponse loginWithGoogle(LoginWithGoogleRequest request) {
        GoogleIdToken.Payload payload;
        try {
            payload = verify(request.getIdTokenString());
        } catch (Exception e) {
            throw new AuthenticationException(MessageError.INVALID_CREDENTIALS);
        }

        String email = payload.getEmail();
        String googleId = payload.getSubject();
        String displayName = (String) payload.get("name");
        String avatarUrl = (String) payload.get("picture");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .displayName(displayName != null ? displayName : email)
                    .avatarUrl(avatarUrl)
                    .linkedProviders(List.of(
                            User.LinkedProvider.builder()
                                    .provider(User.AuthProvider.GOOGLE)
                                    .providerId(googleId)
                                    .build()))
                    .build();
            return userRepository.save(newUser);
        });

        String accessToken = jwtUtil.generateAccessToken(user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        saveGoogleDeviceToken(user, request, refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    private void saveGoogleDeviceToken(User user, LoginWithGoogleRequest request, String refreshToken) {
        DeviceToken deviceToken = deviceTokenRepository
                .findByUserIdAndDeviceId(user.getId(), request.getDeviceId())
                .orElse(DeviceToken.builder()
                        .userId(user.getId())
                        .deviceId(request.getDeviceId())
                        .build());

        deviceToken.setRefreshToken(refreshToken);
        deviceToken.setPlatform(request.getPlatform());
        deviceToken.setDeviceName(request.getDeviceName());
        deviceToken.setDeviceModel(request.getDeviceModel());
        deviceToken.setOsVersion(request.getOsVersion());
        deviceToken.setAppVersion(request.getAppVersion());
        deviceToken.setLastActiveAt(Instant.now());

        deviceTokenRepository.save(deviceToken);
    }

    private GoogleIdToken.Payload verify(String idTokenString) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);

        if (idToken != null) {
            return idToken.getPayload();
        }

        throw new RuntimeException(MessageError.INVALID_CREDENTIALS);
    }
}
