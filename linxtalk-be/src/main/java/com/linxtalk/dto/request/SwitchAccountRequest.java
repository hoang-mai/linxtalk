package com.linxtalk.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SwitchAccountRequest {

    @NotBlank(message = "{login.username.notblank}")
    private String username;

    @NotBlank(message = "{login.deviceId.notblank}")
    private String deviceId;
}

