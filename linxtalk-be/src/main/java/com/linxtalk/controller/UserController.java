package com.linxtalk.controller;

import com.linxtalk.dto.AuthResponse;
import com.linxtalk.dto.LoginRequest;
import com.linxtalk.dto.LogoutRequest;
import com.linxtalk.dto.RefreshTokenRequest;
import com.linxtalk.dto.RegisterRequest;
import com.linxtalk.dto.UserSearchResponse;
import com.linxtalk.exception.AuthenticationException;
import com.linxtalk.service.UserService;
import com.linxtalk.util.BaseResponse;
import com.linxtalk.util.Constant;
import com.linxtalk.util.MessageError;
import com.linxtalk.util.MessageSuccess;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = Constant.USER)
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/search")
    public ResponseEntity<BaseResponse<UserSearchResponse>> searchUser(@RequestParam("q") String query) {
        UserSearchResponse userSearchResponse = userService.searchUser(query);

        BaseResponse<UserSearchResponse> response = BaseResponse.<UserSearchResponse>builder()
                .status(HttpStatus.OK.value())
                .message(MessageSuccess.SEARCH_USER_SUCCESS)
                .data(userSearchResponse)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<BaseResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        userService.register(request);

        BaseResponse<Void> response = BaseResponse.<Void>builder()
                .status(HttpStatus.CREATED.value())
                .message(MessageSuccess.REGISTER_USER_SUCCESS)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<BaseResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = userService.login(request);

        BaseResponse<AuthResponse> response = BaseResponse.<AuthResponse>builder()
                .status(HttpStatus.OK.value())
                .message(MessageSuccess.LOGIN_SUCCESS)
                .data(authResponse)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<BaseResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse authResponse = userService.refreshToken(request);

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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AuthenticationException(MessageError.INVALID_CREDENTIALS);
        }
        String accessToken = authHeader.substring(7);

        userService.logout(accessToken, username, request);

        BaseResponse<Void> response = BaseResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message(MessageSuccess.LOGOUT_SUCCESS)
                .build();

        return ResponseEntity.ok(response);
    }
}
