package com.linxtalk.exception;

import com.linxtalk.utils.BaseResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BaseResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        BaseResponse<Void> response = BaseResponse.<Void>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(errors)
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(DuplicateException.class)
    public ResponseEntity<BaseResponse<Void>> handleDuplicate(DuplicateException ex) {
        BaseResponse<Void> response = BaseResponse.<Void>builder()
                .status(HttpStatus.CONFLICT.value())
                .message(ex.getMessageKey())
                .messageArgs(ex.getArgs())
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<BaseResponse<Void>> handleAuthentication(AuthenticationException ex) {
        BaseResponse<Void> response = BaseResponse.<Void>builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .message(ex.getMessageKey())
                .messageArgs(ex.getArgs())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<BaseResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        BaseResponse<Void> response = BaseResponse.<Void>builder()
                .status(HttpStatus.NOT_FOUND.value())
                .message(ex.getMessageKey())
                .messageArgs(ex.getArgs())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
}
