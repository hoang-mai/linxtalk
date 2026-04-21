package com.linxtalk.repository;

import com.linxtalk.entity.Conversation;
import com.linxtalk.enumeration.ConversationType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    @Query(value = "{'type': 'PRIVATE', 'participantIds': { $all: ?0 } }", exists = true)
    boolean existsPrivateConversation(List<String> participantIds);

    @Query("{'type': ?0, 'participantIds': { $all: ?1 } }")
    Optional<Conversation> findByConversationTypeAndParticipantIds(ConversationType type, List<String> participantIds);

}
