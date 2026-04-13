package com.linxtalk.repository;

import com.linxtalk.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    @Query("{ '_id' : ?0 }")
    @Update("{ '$set' : { 'lastSeenAt' : ?1 } }")
    void updateLastSeenAt(String userId, Instant lastSeenAt);

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

}
