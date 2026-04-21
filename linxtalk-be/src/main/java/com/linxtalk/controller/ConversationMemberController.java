package com.linxtalk.controller;

import com.linxtalk.dto.request.UpdateConversationMemberRequest;
import com.linxtalk.service.ConversationMemberService;
import com.linxtalk.utils.BaseResponse;
import com.linxtalk.utils.Constant;
import com.linxtalk.utils.MessageSuccess;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = Constant.CONVERSATION_MEMBER)
@RequiredArgsConstructor
public class ConversationMemberController {

    private final ConversationMemberService conversationMemberService;

    @PatchMapping("/{conversationId}")
    public ResponseEntity<BaseResponse<Void>> updateConversationMember(
            @PathVariable String conversationId,
            @Valid @RequestBody UpdateConversationMemberRequest request) {
        conversationMemberService.updateConversationMember(conversationId, request);

        BaseResponse<Void> response = BaseResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message(MessageSuccess.UPDATE_CONVERSATION_MEMBER_SUCCESS)
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{conversationId}")
    public ResponseEntity<BaseResponse<Void>> deleteConversationMember(@PathVariable String conversationId) {
        conversationMemberService.deleteConversationMember(conversationId);

        BaseResponse<Void> response = BaseResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message(MessageSuccess.DELETE_CONVERSATION_MEMBER_SUCCESS)
                .build();

        return ResponseEntity.ok(response);
    }
}

