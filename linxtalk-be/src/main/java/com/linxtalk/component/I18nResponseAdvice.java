package com.linxtalk.component;

import com.linxtalk.utils.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice
@RequiredArgsConstructor
public class I18nResponseAdvice implements ResponseBodyAdvice<Object> {

    private final MessageSource messageSource;

    @Override
    public boolean supports(MethodParameter returnType,
                            Class<? extends HttpMessageConverter<?>> converterType) {
        Class<?> paramType = returnType.getParameterType();
        return BaseResponse.class.isAssignableFrom(paramType)
                || ResponseEntity.class.isAssignableFrom(paramType);
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType contentType,
                                  Class<? extends HttpMessageConverter<?>> converterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {

        if (body instanceof BaseResponse<?> baseResponse && baseResponse.getMessage() != null) {
            String resolved = messageSource.getMessage(
                baseResponse.getMessage(),
                baseResponse.getMessageArgs(),
                baseResponse.getMessage(),
                LocaleContextHolder.getLocale());
            baseResponse.setMessage(resolved);
        }
        return body;
    }
}
