package com.linxtalk.repository;

import com.linxtalk.entity.Friend;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;


@Repository
public interface FriendRepository extends MongoRepository<Friend, String> {
    Page<Friend> findByUserId(String userId, Pageable pageable);

    @Query("{ 'friendId' : ?0 }")
    @Update("{ '$set' : { 'displayName' : ?1 } }")
    void updateDisplayNameByFriendId(String friendId, String displayName);

    @Query("{ 'friendId' : ?0 }")
    @Update("{ '$set' : { 'avatarUrl' : ?1 } }")
    void updateAvatarByFriendId(String friendId, String avatarUrl);

    void deleteAllByFriendId(String friendId);
}
