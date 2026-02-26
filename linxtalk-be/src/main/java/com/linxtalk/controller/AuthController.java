package com.linxtalk.controller;

import com.linxtalk.dto.request.LoginRequest;
import com.linxtalk.dto.request.LoginWithGoogleRequest;
import com.linxtalk.dto.request.LogoutRequest;
import com.linxtalk.dto.request.RefreshTokenRequest;
import com.linxtalk.dto.request.RegisterRequest;
import com.linxtalk.dto.response.AuthResponse;
import com.linxtalk.exception.AuthenticationException;
import com.linxtalk.service.AuthService;
import com.linxtalk.utils.BaseResponse;
import com.linxtalk.utils.Constant;
import com.linxtalk.utils.MessageError;
import com.linxtalk.utils.MessageSuccess;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = Constant.AUTH)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    @PostMapping("/register")
    public ResponseEntity<BaseResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);

        BaseResponse<Void> response = BaseResponse.<Void>builder()
            .status(HttpStatus.CREATED.value())
            .message(MessageSuccess.REGISTER_USER_SUCCESS)
            .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<BaseResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);

        BaseResponse<AuthResponse> response = BaseResponse.<AuthResponse>builder()
            .status(HttpStatus.OK.value())
            .message(MessageSuccess.LOGIN_SUCCESS)
            .data(authResponse)
            .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<BaseResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse authResponse = authService.refreshToken(request);

        BaseResponse<AuthResponse> response = BaseResponse.<AuthResponse>builder()
            .status(HttpStatus.OK.value())
            .message(MessageSuccess.REFRESH_TOKEN_SUCCESS)
            .data(authResponse)
            .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<BaseResponse<Void>> logout(@Valid @RequestBody LogoutRequest request,
                                                     HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AuthenticationException(MessageError.INVALID_CREDENTIALS);
        }
        String accessToken = authHeader.substring(7);

        authService.logout(accessToken, request);

        BaseResponse<Void> response = BaseResponse.<Void>builder()
            .status(HttpStatus.OK.value())
            .message(MessageSuccess.LOGOUT_SUCCESS)
            .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login-google")
    public ResponseEntity<BaseResponse<AuthResponse>> loginWithGoogle(@Valid @RequestBody LoginWithGoogleRequest request) {
        AuthResponse authResponse = authService.loginWithGoogle(request);

        BaseResponse<AuthResponse> response = BaseResponse.<AuthResponse>builder()
            .status(HttpStatus.OK.value())
            .message(MessageSuccess.LOGIN_SUCCESS)
            .data(authResponse)
            .build();

        return ResponseEntity.ok(response);
    }
}
