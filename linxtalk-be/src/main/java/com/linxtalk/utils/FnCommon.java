package com.linxtalk.utils;

import com.linxtalk.exception.ResourceNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class FnCommon {
    public static String getUsername(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication != null && authentication.getPrincipal() instanceof String username){
            return username;
        } else throw new ResourceNotFoundException(MessageError.USERNAME_NOT_FOUND);
    }
}
