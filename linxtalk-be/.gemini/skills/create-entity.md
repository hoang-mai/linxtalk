# Skill: Tạo Entity (MongoDB Document)

## Mô tả
Tạo một MongoDB document entity mới theo pattern chuẩn của dự án.

## Template

```java
package com.linxtalk.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Document(collection = "collection_name")  // plural, snake_case
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityName {

    @MongoId(FieldType.OBJECT_ID)
    private String id;

    // Reference fields (foreign key equivalent)
    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;

    // Unique indexed field
    @Indexed(unique = true)
    private String uniqueField;

    // Regular field
    private String name;

    // Boolean with default
    @Builder.Default
    private Boolean isActive = true;

    // Integer with default
    @Builder.Default
    private Integer count = 0;

    // Enum field
    private SomeEnum status;

    // Nested object
    private NestedObject settings;

    // List of ObjectId references
    @Field(targetType = FieldType.OBJECT_ID)
    private List<String> relatedIds;

    // Audit fields (auto-populated bởi MongoDB auditing)
    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    // Nested class (nếu cần)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NestedObject {
        @Builder.Default
        private Boolean enabled = true;
        private String value;
    }

    // Enum (nếu specific cho entity này)
    public enum SomeEnum {
        ACTIVE,
        INACTIVE,
        PENDING
    }
}
```

## Compound Index

```java
@CompoundIndexes({
    @CompoundIndex(name = "field1_field2", def = "{'field1': 1, 'field2': 1}", unique = true),
    @CompoundIndex(name = "field2_field1", def = "{'field2': 1, 'field1': 1}")
})
```

## Quy tắc
- Collection name: **plural, snake_case** (`users`, `friend_requests`, `conversation_members`)
- ID: luôn dùng `@MongoId(FieldType.OBJECT_ID)`
- Reference fields: `@Field(targetType = FieldType.OBJECT_ID)` + `@Indexed`
- Timestamps: `Instant` (không dùng `Date` hoặc `LocalDateTime`)
- Defaults: `@Builder.Default` cho boolean/integer defaults
- Lombok: `@Data @Builder @NoArgsConstructor @AllArgsConstructor`
