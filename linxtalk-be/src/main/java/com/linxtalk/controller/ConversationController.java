package com.linxtalk.controller;

import com.linxtalk.dto.request.CreateConversationRequest;
import com.linxtalk.dto.response.ConversationResponse;
import com.linxtalk.service.ConversationService;
import com.linxtalk.utils.BaseResponse;
import com.linxtalk.utils.Constant;
import com.linxtalk.utils.MessageSuccess;
import com.linxtalk.utils.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = Constant.CONVERSATION)
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping
    public ResponseEntity<BaseResponse<ConversationResponse>> createConversation(
            @Valid @RequestBody CreateConversationRequest request) {
        ConversationResponse conversationResponse = conversationService.createConversation(request);

        BaseResponse<ConversationResponse> response = BaseResponse.<ConversationResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message(MessageSuccess.CREATE_CONVERSATION_SUCCESS)
                .data(conversationResponse)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<BaseResponse<PageResponse<ConversationResponse>>> getConversations(
            @RequestParam(required = false, defaultValue = "0") int pageNo,
            @RequestParam(required = false, defaultValue = "10") int pageSize) {
        PageResponse<ConversationResponse> conversations = conversationService.getConversations(pageNo, pageSize);

        BaseResponse<PageResponse<ConversationResponse>> response = BaseResponse.<PageResponse<ConversationResponse>>builder()
                .status(HttpStatus.OK.value())
                .message(MessageSuccess.GET_CONVERSATIONS_SUCCESS)
                .data(conversations)
                .build();

        return ResponseEntity.ok(response);
    }
}
