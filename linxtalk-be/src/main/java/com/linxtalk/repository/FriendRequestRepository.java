package com.linxtalk.repository;

import com.linxtalk.entity.FriendRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FriendRequestRepository extends MongoRepository<FriendRequest, String> {

    Optional<FriendRequest> findBySenderIdAndReceiverId(String id, String currentUserId);
}
