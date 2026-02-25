package com.linxtalk.service;

import com.linxtalk.dto.response.UserSearchResponse;
import com.linxtalk.entity.User;
import com.linxtalk.exception.ResourceNotFoundException;
import com.linxtalk.repository.UserRepository;
import com.linxtalk.utils.MessageError;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserSearchResponse searchUser(String query) {
        User user;

        if (query.startsWith("@")) {
            String username = query.substring(1);
            user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND, query));
        } else if (query.contains("@gmail.com")) {
            user = userRepository.findByEmail(query)
                    .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND, query));
        } else {
            user = userRepository.findByUsername(query)
                    .orElseThrow(() -> new ResourceNotFoundException(MessageError.USER_NOT_FOUND, query));
        }

        return UserSearchResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }


}
