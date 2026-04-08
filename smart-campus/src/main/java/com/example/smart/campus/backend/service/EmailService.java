package com.example.smart.campus.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmailService {

    @Autowired
    private EmailClient emailClient;

    public void sendOtpEmail(String email, String otp) {
        try {
            boolean sent = emailClient.sendOtpEmail(email, otp);
            if (sent) {
                log.info("OTP email sent successfully to: {}", email);
            } else {
                throw new RuntimeException("Email service returned failure");
            }
        } catch (RuntimeException e) {
            log.error("Failed to send OTP email to: {}", email, e);
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }

    public void sendConfirmationEmail(String email, String name) {
        try {
            boolean sent = emailClient.sendConfirmationEmail(email, name);
            if (sent) {
                log.info("Confirmation email sent successfully to: {}", email);
            } else {
                throw new RuntimeException("Email service returned failure");
            }
        } catch (RuntimeException e) {
            log.error("Failed to send confirmation email to: {}", email, e);
            throw new RuntimeException("Failed to send confirmation email: " + e.getMessage());
        }
    }

    public void sendPasswordResetEmail(String email, String resetLink) {
        try {
            boolean sent = emailClient.sendPasswordResetEmail(email, resetLink);
            if (sent) {
                log.info("Password reset email sent successfully to: {}", email);
            } else {
                throw new RuntimeException("Email service returned failure");
            }
        } catch (RuntimeException e) {
            log.error("Failed to send password reset email to: {}", email, e);
            throw new RuntimeException("Failed to send password reset email: " + e.getMessage());
        }
    }

    public void sendBookingUpdateEmail(String email, String name, String resourceName,
                                       String date, String startTime, String endTime,
                                       String status, String message) {
        try {
            boolean sent = emailClient.sendBookingUpdateEmail(
                email,
                name,
                resourceName,
                date,
                startTime,
                endTime,
                status,
                message
            );
            if (sent) {
                log.info("Booking update email sent successfully to: {}", email);
            } else {
                log.warn("Booking update email could not be sent to: {}", email);
            }
        } catch (RuntimeException e) {
            log.warn("Failed to send booking update email to {}: {}", email, e.getMessage());
        }
    }
}
