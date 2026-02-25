package com.linxtalk.controller;

import com.linxtalk.dto.response.UserSearchResponse;
import com.linxtalk.service.UserService;
import com.linxtalk.utils.BaseResponse;
import com.linxtalk.utils.Constant;
import com.linxtalk.utils.MessageSuccess;
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
}
