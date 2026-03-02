package com.linxtalk.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = "{update.displayName.notblank}")
    @Size(max = 50, message = "{update.displayName.size}")
    private String displayName;

    @Size(max = 100, message = "{update.bio.size}")
    private String bio;

    private String phoneNumber;

    private Instant birthday;
}

