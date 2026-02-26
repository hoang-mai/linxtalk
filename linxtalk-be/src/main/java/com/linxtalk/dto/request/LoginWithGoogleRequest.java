package com.linxtalk.dto.request;

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
public class LoginWithGoogleRequest {

    @NotBlank(message = "{login.idTokenString.notblank}")
    private String idTokenString;

    @NotBlank(message = "{login.deviceId.notblank}")
    private String deviceId;

    private DeviceToken.DevicePlatform platform;

    private String deviceName;

    private String deviceModel;

    private String osVersion;

    private String appVersion;
}
