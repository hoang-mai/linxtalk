package com.linxtalk.component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class LoggingAspect {

    private final ObjectMapper objectMapper;

    @Around("within(com.linxtalk.controller.*)")
    public Object logControllerMethod(ProceedingJoinPoint pjp) throws Throwable {
        String methodName = pjp.getSignature().getName();
        Instant startTime = Instant.now();

        Object[] loggableArgs = Arrays.stream(pjp.getArgs())
                .map(this::toLoggable)
                .toArray();

        log.info("Method [{}] called with args: {}. Start time: {}",
                methodName, toJson(loggableArgs), startTime);

        try {
            Object result = pjp.proceed();
            Instant endTime = Instant.now();
            long duration = Duration.between(startTime, endTime).toMillis();
            Object body = result instanceof ResponseEntity<?> re ? re.getBody() : result;
            log.info("Method [{}] completed with result: {}. End time: {}. Duration: {} ms",
                    methodName, toJson(body), endTime, duration);
            return result;
        } catch (Throwable e) {
            log.error("Method [{}] failed with exception: {}. Time: {}",
                    methodName, e.getMessage(), Instant.now());
            throw e;
        }
    }

    @AfterReturning(value = "within(com.linxtalk.exception.GlobalExceptionHandler)", returning = "result")
    public void logGlobalExceptionHandler(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        Object body = result instanceof ResponseEntity<?> re ? re.getBody() : result;
        log.info("GlobalExceptionHandler method [{}] returned: {}. Time: {}",
                methodName, toJson(body), Instant.now());
    }


    private Object toLoggable(Object arg) {
        if (arg instanceof MultipartFile file) {
            return formatMultipartFile(file);
        }
        if (arg instanceof MultipartFile[] files) {
            String content = Arrays.stream(files)
                    .map(this::formatMultipartFile)
                    .collect(Collectors.joining(", "));
            return "MultipartFile[" + content + "]";
        }
        if (arg instanceof List<?> list && !list.isEmpty() && list.getFirst() instanceof MultipartFile) {
            String content = list.stream()
                    .map(f -> formatMultipartFile((MultipartFile) f))
                    .collect(Collectors.joining(", "));
            return "List<MultipartFile>[" + content + "]";
        }
        return arg;
    }

    private String formatMultipartFile(MultipartFile file) {
        return String.format("{name=%s, size=%d, contentType=%s}",
                file.getOriginalFilename(), file.getSize(), file.getContentType());
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize value for logging: {}", e.getMessage());
            return String.valueOf(value);
        }
    }

}
