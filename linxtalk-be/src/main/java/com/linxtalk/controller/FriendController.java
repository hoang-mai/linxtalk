package com.linxtalk.controller;

import com.linxtalk.dto.response.FriendResponse;
import com.linxtalk.service.FriendService;
import com.linxtalk.utils.BaseResponse;
import com.linxtalk.utils.Constant;
import com.linxtalk.utils.MessageSuccess;
import com.linxtalk.utils.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = Constant.FRIEND)
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @GetMapping
    public ResponseEntity<BaseResponse<PageResponse<FriendResponse>>> getFriends(
            @RequestParam(required = false) Boolean hasChatted,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir,
            @RequestParam(required = false, defaultValue = "0") int pageNo,
            @RequestParam(required = false, defaultValue = "10") int pageSize) {
        PageResponse<FriendResponse> friendResponse = friendService.getFriends(hasChatted, sortBy, sortDir, pageNo, pageSize);
        BaseResponse<PageResponse<FriendResponse>> response = BaseResponse.<PageResponse<FriendResponse>>builder()
                .status(HttpStatus.OK.value())
                .message(MessageSuccess.GET_FRIENDS_SUCCESS)
                .data(friendResponse)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/online")
    public ResponseEntity<BaseResponse<List<FriendResponse>>> getOnlineFriends(
            @RequestParam(required = false, defaultValue = "0") int pageNo,
            @RequestParam(required = false, defaultValue = "100") int pageSize,
            @RequestParam(required = false, defaultValue = "20") int pageSizeOnline
    ) {
        List<FriendResponse> onlineFriends = friendService.getOnlineFriends(pageNo, pageSize, pageSizeOnline);
        BaseResponse<List<FriendResponse>> response = BaseResponse.<List<FriendResponse>>builder()
                .status(HttpStatus.OK.value())
                .message(MessageSuccess.GET_ONLINE_FRIENDS_SUCCESS)
                .data(onlineFriends)
                .build();
        return ResponseEntity.ok(response);
    }

}

