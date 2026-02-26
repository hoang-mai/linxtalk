package com.linxtalk.utils;

import com.linxtalk.exception.ResourceNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class FnCommon {
    public static String getUserId(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication != null && authentication.getPrincipal() instanceof String userId){
            return userId;
        } else throw new ResourceNotFoundException(MessageError.USER_NOT_FOUND);
    }
}
