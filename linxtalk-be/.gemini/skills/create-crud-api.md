# Skill: Tạo CRUD API Endpoint

## Mô tả
Tạo một REST API endpoint mới với đầy đủ các tầng (Controller → Service → Repository → DTO → Entity).

## Các bước thực hiện

### 1. Tạo Entity (MongoDB Document)

```java
// entity/NewResource.java
package com.linxtalk.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.MongoId;
import java.time.Instant;

@Document(collection = "new_resources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewResource {

    @MongoId(FieldType.OBJECT_ID)
    private String id;

    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;

    private String name;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
```

### 2. Tạo Request/Response DTOs

```java
// dto/request/CreateNewResourceRequest.java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateNewResourceRequest {
    @NotBlank(message = "{new.resource.name.notblank}")
    @Size(max = 100, message = "{new.resource.name.size}")
    private String name;
}

// dto/response/NewResourceResponse.java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NewResourceResponse {
    private String id;
    private String name;
    private Instant createdAt;
}
```

### 3. Tạo Repository

```java
// repository/NewResourceRepository.java
@Repository
public interface NewResourceRepository extends MongoRepository<NewResource, String> {
    Page<NewResource> findByUserId(String userId, Pageable pageable);
}
```

### 4. Tạo Mapper

```java
// mapper/NewResourceMapper.java
@Component
public class NewResourceMapper {
    public NewResourceResponse toResponse(NewResource entity) {
        return NewResourceResponse.builder()
            .id(entity.getId())
            .name(entity.getName())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
```

### 5. Tạo Service

```java
// service/NewResourceService.java
@Service
@RequiredArgsConstructor
public class NewResourceService {
    private final NewResourceRepository repository;
    private final NewResourceMapper mapper;

    public NewResourceResponse create(CreateNewResourceRequest request) {
        String userId = FnCommon.getUserId();
        NewResource entity = NewResource.builder()
            .userId(userId)
            .name(request.getName())
            .build();
        return mapper.toResponse(repository.save(entity));
    }

    public PageResponse<NewResourceResponse> getAll(int pageNo, int pageSize) {
        String userId = FnCommon.getUserId();
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending());
        Page<NewResource> page = repository.findByUserId(userId, pageable);

        List<NewResourceResponse> content = page.getContent().stream()
            .map(mapper::toResponse).toList();

        return PageResponse.<NewResourceResponse>builder()
            .pageSize(page.getSize())
            .totalElements(page.getTotalElements())
            .pageNumber(page.getNumber())
            .totalPages(page.getTotalPages())
            .hasNext(page.hasNext())
            .hasPrevious(page.hasPrevious())
            .data(content)
            .build();
    }
}
```

### 6. Tạo Controller

```java
// controller/NewResourceController.java
@RestController
@RequestMapping(value = Constant.NEW_RESOURCE)
@RequiredArgsConstructor
public class NewResourceController {
    private final NewResourceService service;

    @PostMapping
    public ResponseEntity<BaseResponse<NewResourceResponse>> create(
            @Valid @RequestBody CreateNewResourceRequest request) {
        NewResourceResponse data = service.create(request);
        BaseResponse<NewResourceResponse> response = BaseResponse.<NewResourceResponse>builder()
            .status(HttpStatus.CREATED.value())
            .message(MessageSuccess.CREATE_NEW_RESOURCE_SUCCESS)
            .data(data)
            .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<BaseResponse<PageResponse<NewResourceResponse>>> getAll(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        PageResponse<NewResourceResponse> data = service.getAll(pageNo, pageSize);
        BaseResponse<PageResponse<NewResourceResponse>> response = BaseResponse.<PageResponse<NewResourceResponse>>builder()
            .status(HttpStatus.OK.value())
            .message(MessageSuccess.GET_NEW_RESOURCES_SUCCESS)
            .data(data)
            .build();
        return ResponseEntity.ok(response);
    }
}
```

### 7. Cập nhật Constants & Messages
- Thêm path vào `Constant.java`
- Thêm success keys vào `MessageSuccess.java`
- Thêm error keys vào `MessageError.java` (nếu cần)
- Thêm translations vào `i18n.properties`, `i18n_vi.properties`, `i18n_en.properties`

## Checklist
- [ ] Entity với Lombok annotations + MongoDB annotations
- [ ] Request DTO với validation
- [ ] Response DTO
- [ ] Repository (MongoRepository hoặc custom)
- [ ] Mapper component
- [ ] Service với business logic
- [ ] Controller trả BaseResponse
- [ ] Constants + message keys + i18n translations
