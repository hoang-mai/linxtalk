package com.linxtalk.component;

import com.linxtalk.utils.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice
@RequiredArgsConstructor
public class I18nResponseAdvice implements ResponseBodyAdvice<BaseResponse<?>> {

    private final MessageSource messageSource;

    @Override
    public boolean supports(MethodParameter returnType,
                            Class<? extends HttpMessageConverter<?>> converterType) {
        return BaseResponse.class.isAssignableFrom(returnType.getParameterType());
    }

    @Override
    public BaseResponse<?> beforeBodyWrite(BaseResponse<?> body, MethodParameter returnType, MediaType contentType,
                                           Class<? extends HttpMessageConverter<?>> converterType,
                                           ServerHttpRequest request, ServerHttpResponse response) {

        if (body != null && body.getMessage() != null) {
            String resolved = messageSource.getMessage(
                body.getMessage(),
                body.getMessageArgs(),
                body.getMessage(),
                LocaleContextHolder.getLocale());
            body.setMessage(resolved);
        }
        return body;
    }
}
