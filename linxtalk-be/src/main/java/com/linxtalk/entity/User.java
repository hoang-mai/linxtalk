package com.linxtalk.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import java.util.ArrayList;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
import java.util.List;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @MongoId(FieldType.OBJECT_ID)
    private String id;

    @Indexed(unique = true)
    private String username;

    private String password;

    @Indexed(unique = true)
    private String email;

    private String displayName;

    private String avatarUrl;

    private String bio;

    private String phoneNumber;

    @Builder.Default
    private List<LinkedProvider> linkedProviders = new ArrayList<>();

    @Builder.Default
    private UserStatus status = UserStatus.OFFLINE;

    private Instant lastSeenAt;

    @Builder.Default
    private Boolean isVerified = true;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Boolean isBanned = false;

    private UserSettings settings;

    @Field(targetType = FieldType.OBJECT_ID)
    private List<String> blockedUserIds;

    @Field(targetType = FieldType.OBJECT_ID)
    private List<String> friendIds;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum AuthProvider {
        GOOGLE,
        FACEBOOK,
        TWITTER,
        GITHUB
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LinkedProvider {
        private AuthProvider provider;
        private String providerId;
    }

    public enum UserStatus {
        ONLINE,
        OFFLINE,
        AWAY,
        DO_NOT_DISTURB,
        INVISIBLE
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSettings {
        @Builder.Default
        private Boolean notificationsEnabled = true;
        @Builder.Default
        private Boolean soundEnabled = true;
        @Builder.Default
        private Boolean showOnlineStatus = true;
        @Builder.Default
        private Boolean readReceipts = true;
        @Builder.Default
        private String language = "vi";
        @Builder.Default
        private String theme = "light";
    }
}
