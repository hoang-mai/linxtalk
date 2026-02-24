package com.linxtalk.dto.request;

import com.linxtalk.entity.DeviceToken;
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
public class LoginRequest {

    @NotBlank(message = "{login.username.notblank}")
    @Size(min = 6, max = 30, message = "{login.username.size}")
    private String username;

    @NotBlank(message = "{login.password.notblank}")
    @Size(min = 6, max = 30, message = "{login.password.size}")
    private String password;

    @NotBlank(message = "{login.deviceId.notblank}")
    private String deviceId;

    private DeviceToken.DevicePlatform platform;

    private String deviceName;

    private String deviceModel;

    private String osVersion;

    private String appVersion;
}
