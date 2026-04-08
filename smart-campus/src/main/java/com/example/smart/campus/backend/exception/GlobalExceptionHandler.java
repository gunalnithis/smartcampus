package com.example.smart.campus.backend.exception;

import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<Map<String, Object>> handleApiException(ApiException ex) {
		return buildError(ex.getStatus(), ex.getMessage());
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
		Map<String, String> fieldErrors = new HashMap<>();
		for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
			fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
		}

		Map<String, Object> payload = new HashMap<>();
		payload.put("timestamp", Instant.now().toString());
		payload.put("status", HttpStatus.BAD_REQUEST.value());
		payload.put("error", HttpStatus.BAD_REQUEST.getReasonPhrase());
		payload.put("message", "Validation failed");
		payload.put("fieldErrors", fieldErrors);
		return ResponseEntity.badRequest().body(payload);
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<Map<String, Object>> handleConstraint(ConstraintViolationException ex) {
		return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
		return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
		return buildError(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
	}

	private ResponseEntity<Map<String, Object>> buildError(HttpStatus status, String message) {
		Map<String, Object> payload = new HashMap<>();
		payload.put("timestamp", Instant.now().toString());
		payload.put("status", status.value());
		payload.put("error", status.getReasonPhrase());
		payload.put("message", message);
		return ResponseEntity.status(status).body(payload);
	}
}
