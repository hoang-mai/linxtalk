package com.linxtalk.dto.request;

import com.linxtalk.enumeration.FriendRequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFriendRequestStatusRequest {

    @NotNull(message = "{friend.request.status.notnull}")
    private FriendRequestStatus status;

}

