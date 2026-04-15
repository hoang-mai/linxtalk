package com.linxtalk.repository.custom;

import com.linxtalk.entity.Friend;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@RequiredArgsConstructor
@Repository
public class FriendRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    public Page<Friend> getFriends(String userId, Boolean hasChatted, Pageable pageable) {
        Query query = new Query();
        if (userId != null) {
            query.addCriteria(Criteria.where("userId").is(userId));
        }
        if (hasChatted != null) {
            query.addCriteria(Criteria.where("hasChatted").is(hasChatted));
        }
        long totalElements = mongoTemplate.count(query, Friend.class);

        query.with(pageable);
        List<Friend> friends = mongoTemplate.find(query, Friend.class);
        return new PageImpl<>(friends, pageable, totalElements);
    }
}
