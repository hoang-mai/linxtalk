package com.linxtalk.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Document(collection = "device_tokens")
@CompoundIndexes({
        @CompoundIndex(name = "user_device", def = "{'userId': 1, 'deviceId': 1}", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceToken {

    @MongoId(FieldType.OBJECT_ID)
    private String id;

    @Indexed
    private ObjectId userId;

    @Indexed
    private String deviceId;

    @Indexed
    private String refreshToken;

    private DevicePlatform platform;

    private String deviceName;

    private String deviceModel;

    private String osVersion;

    private String appVersion;

    private Instant lastActiveAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Getter
    @RequiredArgsConstructor
    public enum DevicePlatform {
        IOS("ios"),
        ANDROID("android"),
        WEB("web"),
        DESKTOP_WINDOWS("desktop_windows"),
        DESKTOP_MAC("desktop_mac"),
        DESKTOP_LINUX("desktop_linux");

        private final String value;

        @JsonCreator
        public static DevicePlatform fromValue(String value) {
            for (DevicePlatform platform : values()) {
                if (platform.value.equalsIgnoreCase(value)) {
                    return platform;
                }
            }
            throw new IllegalArgumentException("Unknown platform: " + value);
        }
    }
}
