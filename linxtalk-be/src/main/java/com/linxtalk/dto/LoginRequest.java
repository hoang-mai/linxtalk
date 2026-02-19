package com.linxtalk.dto;

import com.linxtalk.entity.DeviceToken;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "{login.username.notblank}")
    private String username;

    @NotBlank(message = "{login.password.notblank}")
    private String password;

    @NotBlank(message = "{login.deviceId.notblank}")
    private String deviceId;

    private DeviceToken.DevicePlatform platform;

    private String deviceName;

    private String deviceModel;

    private String osVersion;

    private String appVersion;
}
