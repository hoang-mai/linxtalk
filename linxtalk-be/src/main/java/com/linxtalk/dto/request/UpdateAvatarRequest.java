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
public class UpdateAvatarRequest {
    @NotBlank(message = "{update.avatar.notblank}")
    private String avatarUrl;
}
