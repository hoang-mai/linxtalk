# Skill: Tạo Custom Repository (MongoTemplate)

## Mô tả
Tạo custom repository sử dụng MongoTemplate cho complex queries mà MongoRepository không hỗ trợ.

## Template

```java
// repository/custom/NewResourceRepositoryCustom.java
package com.linxtalk.repository.custom;

import com.linxtalk.entity.NewResource;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import java.util.List;

@RequiredArgsConstructor
@Repository
public class NewResourceRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    // Paginated query with dynamic filters
    public Page<NewResource> findWithFilters(String userId, String status, Pageable pageable) {
        Query query = new Query();
        query.addCriteria(Criteria.where("userId").is(userId));

        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }

        long totalElements = mongoTemplate.count(query, NewResource.class);
        query.with(pageable);
        List<NewResource> results = mongoTemplate.find(query, NewResource.class);

        return new PageImpl<>(results, pageable, totalElements);
    }

    // Bulk update
    public void updateFieldByCondition(String conditionField, String conditionValue,
                                        String updateField, String updateValue) {
        Query query = new Query(Criteria.where(conditionField).is(conditionValue));
        Update update = new Update().set(updateField, updateValue);
        mongoTemplate.updateMulti(query, update, NewResource.class);
    }

    // Find with multiple criteria (OR)
    public List<NewResource> findByMultipleConditions(String field1, String field2) {
        Query query = new Query(new Criteria().orOperator(
            Criteria.where("field1").is(field1),
            Criteria.where("field2").is(field2)
        ));
        return mongoTemplate.find(query, NewResource.class);
    }
}
```

## Khi nào dùng Custom Repository
- Dynamic filters (optional parameters)
- Complex queries (OR, regex, $in, aggregation)
- Bulk updates với `updateMulti`
- Queries mà Spring Data query methods không hỗ trợ

## Khi nào dùng MongoRepository + @Query/@Update
- Simple CRUD
- Fixed-condition updates:

```java
@Query("{ 'fieldId' : ?0 }")
@Update("{ '$set' : { 'name' : ?1 } }")
void updateNameByFieldId(String fieldId, String name);
```
