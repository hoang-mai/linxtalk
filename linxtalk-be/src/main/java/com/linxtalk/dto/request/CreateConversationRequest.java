package com.linxtalk.dto.request;

import com.linxtalk.enumeration.ConversationType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationRequest {

    @NotNull(message = "{conversation.type.notnull}")
    private ConversationType type;

    @NotEmpty(message = "{conversation.participantIds.notempty}")
    private List<String> participantIds;

    @Size(max = 100, message = "{conversation.name.size}")
    private String name;

    @Size(max = 255, message = "{conversation.avatar.size}")
    private String avatarUrl;

    @Size(max = 500, message = "{conversation.description.size}")
    private String description;
}

