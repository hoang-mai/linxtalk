package com.linxtalk.service;

import com.linxtalk.dto.AuthResponse;
import com.linxtalk.dto.LoginRequest;
import com.linxtalk.dto.LogoutRequest;
import com.linxtalk.dto.RefreshTokenRequest;
import com.linxtalk.dto.RegisterRequest;
import com.linxtalk.dto.UserSearchResponse;
import com.linxtalk.entity.DeviceToken;
import com.linxtalk.entity.User;
import com.linxtalk.exception.AuthenticationException;
import com.linxtalk.exception.DuplicateException;
import com.linxtalk.exception.ResourceNotFoundException;
import com.linxtalk.repository.DeviceTokenRepository;
import com.linxtalk.repository.UserRepository;
import com.linxtalk.security.JwtUtil;
import com.linxtalk.util.MessageError;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;

    public UserSearchResponse searchUser(String query) {
        User user;

        if (query.startsWith("@")) {
            String username = query.substring(1);
            user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND, query));
        } else if (query.contains("@gmail.com")) {
            user = userRepository.findByEmail(query)
                    .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND, query));
        } else {
            user = userRepository.findByUsername(query)
                    .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND, query));
        }

        return UserSearchResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

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

        String accessToken = jwtUtil.generateAccessToken(user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());
        saveDeviceToken(user, request, refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
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

        String username = jwtUtil.extractUsername(refreshToken);

        String newAccessToken = jwtUtil.generateAccessToken(username);
        String newRefreshToken = jwtUtil.generateRefreshToken(username);

        deviceToken.setRefreshToken(newRefreshToken);
        deviceToken.setLastActiveAt(Instant.now());
        deviceTokenRepository.save(deviceToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    private void saveDeviceToken(User user, LoginRequest request, String refreshToken) {
        ObjectId userId = new ObjectId(user.getId());

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

    public void logout(String accessToken, String username, LogoutRequest request) {
        tokenBlacklistService.blacklist(accessToken);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthenticationException(MessageError.INVALID_CREDENTIALS));

        ObjectId userId = new ObjectId(user.getId());
        deviceTokenRepository.deleteByUserIdAndDeviceId(userId, request.getDeviceId());
    }
}
