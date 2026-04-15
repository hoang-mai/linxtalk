package com.linxtalk.entity;

import com.linxtalk.enumeration.FriendRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
@Document(collection = "friends")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Friend {
    @MongoId(FieldType.OBJECT_ID)
    private String id;

    private String friendRequestId;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String friendId;

    private String displayName;

    private String avatarUrl;

    @Builder.Default
    private Boolean hasChatted = false;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
