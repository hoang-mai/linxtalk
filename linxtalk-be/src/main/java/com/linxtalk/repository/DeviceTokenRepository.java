package com.linxtalk.repository;

import com.linxtalk.entity.DeviceToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeviceTokenRepository extends MongoRepository<DeviceToken, String> {

    Optional<DeviceToken> findByUserIdAndDeviceId(String userId, String deviceId);

    Optional<DeviceToken> findByRefreshToken(String refreshToken);

    void deleteByUserIdAndDeviceId(String userId, String deviceId);

    void deleteAllByUserId(String userId);
}
