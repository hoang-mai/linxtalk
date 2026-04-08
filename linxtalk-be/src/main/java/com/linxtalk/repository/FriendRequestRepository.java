package com.linxtalk.repository;

import com.linxtalk.entity.FriendRequest;
import com.linxtalk.enumeration.FriendRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends MongoRepository<FriendRequest, String> {

    Optional<FriendRequest> findBySenderIdAndReceiverId(String id, String currentUserId);

    Page<FriendRequest> findByReceiverIdAndStatus(String currentUserId, FriendRequestStatus friendRequestStatus, Pageable pageable);
}
