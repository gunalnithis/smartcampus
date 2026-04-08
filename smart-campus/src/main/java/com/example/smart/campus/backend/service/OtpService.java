package com.example.smart.campus.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.smart.campus.backend.model.Otp;
import com.example.smart.campus.backend.repository.OtpRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class OtpService {

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    @Value("${otp.expiry.time:5}")
    private int otpExpiryMinutes;

    private final int MAX_ATTEMPTS = 3;
    private final SecureRandom random = new SecureRandom();

    public void generateAndSendOtp(String email) {
        String lowerEmail = email.toLowerCase();
        // Delete any existing OTP for this email
        otpRepository.deleteByEmail(lowerEmail);

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", random.nextInt(1000000));

        // Create OTP record
        Otp otp = new Otp();
        otp.setEmail(lowerEmail);
        otp.setOtpCode(otpCode);
        otp.setCreatedAt(LocalDateTime.now());
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        otp.setVerified(false);
        otp.setAttempts(0);

        otpRepository.save(otp);
        log.info("OTP generated and saved for email: {}", lowerEmail);

        // Send OTP to email
        emailService.sendOtpEmail(email, otpCode);
    }

    public boolean verifyOtp(String email, String otpCode) {
        String lowerEmail = email.toLowerCase();
        Otp otp = otpRepository.findByEmailAndVerifiedFalse(lowerEmail)
                .orElseThrow(() -> new RuntimeException("No OTP found for this email"));

        // Check if OTP is expired
        if (otp.isExpired()) {
            otpRepository.delete(otp);
            throw new RuntimeException("OTP has expired");
        }

        // Check attempts
        if (otp.getAttempts() >= MAX_ATTEMPTS) {
            otpRepository.delete(otp);
            throw new RuntimeException("Maximum OTP verification attempts exceeded");
        }

        // Verify OTP code
        if (!otp.getOtpCode().equals(otpCode)) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);
            log.warn("Invalid OTP attempt for email: {}", lowerEmail);
            throw new RuntimeException("Invalid OTP code");
        }

        // Mark OTP as verified
        otp.setVerified(true);
        otpRepository.save(otp);
        log.info("OTP verified successfully for email: {}", lowerEmail);

        return true;
    }

    public boolean isOtpVerified(String email) {
        String lowerEmail = email.toLowerCase();
        return otpRepository.findByEmail(lowerEmail)
                .map(otp -> otp.isVerified() && !otp.isExpired())
                .orElse(false);
    }
}
