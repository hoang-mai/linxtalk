package com.linxtalk.repository;

import com.linxtalk.entity.ConversationMember;
import com.linxtalk.enumeration.ConversationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationMemberRepository extends MongoRepository<ConversationMember, String> {
    Page<ConversationMember> findByUserIdAndIsActiveTrue(String userId, Pageable pageable);

    @Query("{ 'userId' : ?0 }")
    @Update("{ '$set' : { 'displayName' : ?1, 'avatarUrl' : ?2 } }")
    void updateProfileByUserId(String userId, String displayName, String avatarUrl);

    @Query("{ 'userId' : ?0 }")
    @Update("{ '$set' : { 'displayName' : ?1 } }")
    void updateDisplayNameByUserId(String userId, String displayName);

    @Query("{ 'userId' : ?0 }")
    @Update("{ '$set' : { 'avatarUrl' : ?1 } }")
    void updateAvatarByUserId(String userId, String avatarUrl);

    @Query("{ 'conversationType' : ?0 , 'otherUserId' :  ?1  }")
    @Update("{ '$set' : { 'otherDisplayName' : ?2, 'otherAvatarUrl' : ?3 } }")
    void updateOtherProfileByUserId(ConversationType conversationType, String excludeUserId, String displayName, String avatarUrl);

   @Query("{ 'conversationType' : ?0 , 'otherUserId' :  ?1  }")
    @Update("{ '$set' : { 'otherDisplayName' : ?2 } }")
    void updateOtherDisplayNameByUserId(ConversationType conversationType, String excludeUserId, String displayName);

   @Query("{ 'conversationType' : ?0 , 'otherUserId' :  ?1  }")
    @Update("{ '$set' : { 'otherAvatarUrl' : ?2 } }")
    void updateOtherAvatarByUserId(ConversationType conversationType, String excludeUserId, String avatarUrl);


}
