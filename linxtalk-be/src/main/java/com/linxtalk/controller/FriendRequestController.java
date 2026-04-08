package com.linxtalk.controller;

import com.linxtalk.dto.request.CreateFriendRequestRequest;
import com.linxtalk.dto.request.UpdateFriendRequestStatusRequest;
import com.linxtalk.dto.response.FriendRequestResponse;
import com.linxtalk.service.FriendRequestService;
import com.linxtalk.utils.BaseResponse;
import com.linxtalk.utils.Constant;
import com.linxtalk.utils.MessageSuccess;
import com.linxtalk.utils.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping(value = Constant.FRIEND_REQUEST)
@RequiredArgsConstructor
public class FriendRequestController {

    private final FriendRequestService friendRequestService;

    @PostMapping
    public ResponseEntity<BaseResponse<FriendRequestResponse>> createFriendRequest(
            @Valid @RequestBody CreateFriendRequestRequest request) {
        FriendRequestResponse friendRequestResponse = friendRequestService.createFriendRequest(request);

        BaseResponse<FriendRequestResponse> response = BaseResponse.<FriendRequestResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message(MessageSuccess.CREATE_FRIEND_REQUEST_SUCCESS)
                .data(friendRequestResponse)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<BaseResponse<PageResponse<FriendRequestResponse>>> getIncomingFriendRequests(
            @RequestParam(required = false, defaultValue = "0") int pageNo,
            @RequestParam(required = false, defaultValue = "10") int pageSize) {
        PageResponse<FriendRequestResponse> friendRequests = friendRequestService.getIncomingFriendRequests(pageNo, pageSize);

        BaseResponse<PageResponse<FriendRequestResponse>> response = BaseResponse.<PageResponse<FriendRequestResponse>>builder()
                .status(HttpStatus.OK.value())
                .message(MessageSuccess.GET_FRIEND_REQUESTS_SUCCESS)
                .data(friendRequests)
                .build();

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{friendRequestId}/status")
    public ResponseEntity<BaseResponse<FriendRequestResponse>> updateStatus(
            @PathVariable String friendRequestId,
            @Valid @RequestBody UpdateFriendRequestStatusRequest request) {
        FriendRequestResponse friendRequestResponse = friendRequestService.updateStatus(friendRequestId, request);

        BaseResponse<FriendRequestResponse> response = BaseResponse.<FriendRequestResponse>builder()
                .status(HttpStatus.OK.value())
                .message(MessageSuccess.UPDATE_FRIEND_REQUEST_STATUS_SUCCESS)
                .data(friendRequestResponse)
                .build();

        return ResponseEntity.ok(response);
    }
}
