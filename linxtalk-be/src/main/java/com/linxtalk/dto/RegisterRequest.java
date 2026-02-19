package com.linxtalk.dto;

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
public class RegisterRequest {

    @NotBlank(message = "{register.username.notblank}")
    @Size(min = 3, max = 30, message = "{register.username.size}")
    private String username;

    @NotBlank(message = "{register.password.notblank}")
    @Size(min = 6, max = 100, message = "{register.password.size}")
    private String password;

    @Size(max = 50, message = "{register.displayName.size}")
    private String displayName;
}
