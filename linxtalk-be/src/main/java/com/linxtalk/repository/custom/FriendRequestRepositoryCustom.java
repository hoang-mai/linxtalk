package com.linxtalk.repository.custom;

import com.linxtalk.entity.FriendRequest;
import com.linxtalk.enumeration.FriendRequestStatus;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class FriendRequestRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    public Page<FriendRequest> getFriendRequests(String senderId, String receiverId, FriendRequestStatus friendRequestStatus, Pageable pageable) {
        Query query = new Query();
        if (StringUtils.isNotBlank(senderId)) {
            query.addCriteria(Criteria.where("senderId").is(senderId));
        }
        if (StringUtils.isNotBlank(receiverId)) {
            query.addCriteria(Criteria.where("receiverId").is(receiverId));
        }
        if (friendRequestStatus != null) {
            query.addCriteria(Criteria.where("status").is(friendRequestStatus));
        }

        long totalElements = mongoTemplate.count(query, FriendRequest.class);

        query.with(pageable);

        List<FriendRequest> friendRequests = mongoTemplate.find(query, FriendRequest.class);

        return new PageImpl<>(friendRequests, pageable, totalElements);
    }
}
