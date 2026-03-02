package com.linxtalk.controller;

import com.linxtalk.dto.request.UpdateProfileRequest;
import com.linxtalk.dto.response.ProfileResponse;
import com.linxtalk.dto.response.UserSearchResponse;
import com.linxtalk.service.UserService;
import com.linxtalk.utils.BaseResponse;
import com.linxtalk.utils.Constant;
import com.linxtalk.utils.MessageSuccess;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/profile")
    public ResponseEntity<BaseResponse<ProfileResponse>> getProfile() {
        ProfileResponse profileResponse = userService.getProfile();

        BaseResponse<ProfileResponse> response = BaseResponse.<ProfileResponse>builder()
                .status(HttpStatus.OK.value())
                .message(MessageSuccess.GET_PROFILE_SUCCESS)
                .data(profileResponse)
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<BaseResponse<Void>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        userService.updateProfile(request);

        BaseResponse<Void> response = BaseResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message(MessageSuccess.UPDATE_PROFILE_SUCCESS)
                .build();

        return ResponseEntity.ok(response);
    }
}
