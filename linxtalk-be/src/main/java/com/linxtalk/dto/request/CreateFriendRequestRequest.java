package com.linxtalk.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateFriendRequestRequest {

    @NotBlank(message = "{friend.request.receiverId.notblank}")
    private String receiverId;

    @Size(max = 255, message = "{friend.request.message.size}")
    private String message;
}

