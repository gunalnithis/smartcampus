package com.example.smart.campus.backend.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmailClient {

    @Value("${email.service.url:http://localhost:3001}")
    private String emailServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean sendOtpEmail(String email, String otp) {
        try {
            String url = emailServiceUrl + "/api/email/send-otp";
            
            Map<String, String> payload = new HashMap<>();
            payload.put("email", email);
            payload.put("otp", otp);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ OTP email sent successfully via Nodemailer to: {}", email);
                return true;
            } else {
                log.error("❌ Failed to send OTP email. Status: {}", response.getStatusCode());
                return false;
            }
        } catch (RestClientException | IllegalArgumentException e) {
            log.error("❌ Error sending OTP email via Nodemailer: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send OTP email via email service");
        }
    }

    public boolean sendConfirmationEmail(String email, String name) {
        try {
            String url = emailServiceUrl + "/api/email/send-confirmation";
            
            Map<String, String> payload = new HashMap<>();
            payload.put("email", email);
            payload.put("name", name);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Confirmation email sent successfully via Nodemailer to: {}", email);
                return true;
            } else {
                log.error("❌ Failed to send confirmation email. Status: {}", response.getStatusCode());
                return false;
            }
        } catch (RestClientException | IllegalArgumentException e) {
            log.error("❌ Error sending confirmation email via Nodemailer: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send confirmation email via email service");
        }
    }

    public boolean sendPasswordResetEmail(String email, String resetLink) {
        try {
            String url = emailServiceUrl + "/api/email/send-password-reset";
            
            Map<String, String> payload = new HashMap<>();
            payload.put("email", email);
            payload.put("resetLink", resetLink);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Password reset email sent successfully via Nodemailer to: {}", email);
                return true;
            } else {
                log.error("❌ Failed to send password reset email. Status: {}", response.getStatusCode());
                return false;
            }
        } catch (RestClientException | IllegalArgumentException e) {
            log.error("❌ Error sending password reset email via Nodemailer: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send password reset email via email service");
        }
    }

    public boolean sendBookingUpdateEmail(String email, String name, String resourceName,
                                          String date, String startTime, String endTime,
                                          String status, String message) {
        try {
            String url = emailServiceUrl + "/api/email/send-booking-update";

            Map<String, String> payload = new HashMap<>();
            payload.put("email", email);
            payload.put("name", name);
            payload.put("resourceName", resourceName);
            payload.put("date", date);
            payload.put("startTime", startTime);
            payload.put("endTime", endTime);
            payload.put("status", status);
            payload.put("message", message);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Booking update email sent successfully via Nodemailer to: {}", email);
                return true;
            } else {
                log.error("❌ Failed to send booking update email. Status: {}", response.getStatusCode());
                return false;
            }
        } catch (RestClientException | IllegalArgumentException e) {
            log.error("❌ Error sending booking update email via Nodemailer: {}", e.getMessage(), e);
            return false;
        }
    }
}
