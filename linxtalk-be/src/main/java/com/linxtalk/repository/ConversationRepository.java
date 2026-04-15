package com.linxtalk.repository;

import com.linxtalk.entity.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    @Query(value = "{'type': 'PRIVATE', 'participantIds': { $all: ?0 } }", exists = true)
    boolean existsPrivateConversation(List<String> participantIds);

}
