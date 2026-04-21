package com.linxtalk.repository.custom;

import com.linxtalk.entity.ConversationMember;
import com.linxtalk.enumeration.ConversationType;
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
public class ConversationMemberRepositoryCustom {
    private final MongoTemplate mongoTemplate;

    public Page<ConversationMember> getConversations(String userId, ConversationType conversationType, Boolean isActive, Pageable pageable) {
        Query query = new Query();
        if (userId != null) {
            query.addCriteria(Criteria.where("userId").is(userId));
        }
        if (conversationType != null) {
            query.addCriteria(Criteria.where("conversationType").is(conversationType));
        }
        if (isActive != null) {
            query.addCriteria(Criteria.where("isActive").is(isActive));
        }
        long totalElements = mongoTemplate.count(query, ConversationMember.class);
        query.with(pageable);
        List<ConversationMember> conversationMembers = mongoTemplate.find(query, ConversationMember.class);
        return new PageImpl<>(conversationMembers, pageable, totalElements);
    }
}
