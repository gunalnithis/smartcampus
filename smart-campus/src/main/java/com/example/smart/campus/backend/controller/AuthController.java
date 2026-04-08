package com.example.smart.campus.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.smart.campus.backend.dto.BootstrapUserRequest;
import com.example.smart.campus.backend.dto.LoginRequest;
import com.example.smart.campus.backend.dto.OtpResponse;
import com.example.smart.campus.backend.dto.SendOtpRequest;
import com.example.smart.campus.backend.dto.UserProfileUpdateRequest;
import com.example.smart.campus.backend.dto.UserSummaryResponse;
import com.example.smart.campus.backend.dto.VerifyOtpRequest;
import com.example.smart.campus.backend.model.User;
import com.example.smart.campus.backend.repository.UserRepository;
import com.example.smart.campus.backend.service.OtpService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = {"http://localhost:*"})
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/bootstrap-user")
    public ResponseEntity<UserSummaryResponse> bootstrapUser(@RequestBody BootstrapUserRequest request) {
        // Normalize email to lowercase
        String normalizedEmail = request.getEmail().toLowerCase();
        
        // Verify OTP before creating/updating user
        if (!otpService.isOtpVerified(normalizedEmail)) {
            throw new RuntimeException("Email not verified. Please verify OTP first.");
        }

        User user = null;
        if (request.getId() != null && !request.getId().isBlank()) {
            user = userRepository.findById(request.getId()).orElse(null);
        }
        if (user == null && request.getEmail() != null && !request.getEmail().isBlank()) {
            user = userRepository.findByEmail(normalizedEmail).orElse(null);
        }
        if (user == null) {
            user = new User();
        }

        user.setName(request.getName());
        user.setItNumber(request.getItNumber());
        user.setEmail(normalizedEmail);
        user.setPhoneNumber(request.getPhoneNumber());
        user.setCampusType(request.getCampusType());
        user.setRole(request.getRole() == null ? User.Role.USER : request.getRole());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        User saved = userRepository.save(user);
        return ResponseEntity.ok(toUserSummary(saved));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            String normalizedEmail = request.getEmail().toLowerCase();
            User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

            String storedPassword = user.getPasswordHash();
            if (storedPassword == null || storedPassword.isBlank() || !passwordEncoder.matches(request.getPassword(), storedPassword)) {
                throw new RuntimeException("Invalid email or password");
            }

            return ResponseEntity.ok(toUserSummary(user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(new OtpResponse("Invalid email or password", false));
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<OtpResponse> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        try {
            otpService.generateAndSendOtp(request.getEmail().toLowerCase());
            return ResponseEntity.ok(new OtpResponse("OTP sent to your email successfully", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new OtpResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<OtpResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            otpService.verifyOtp(request.getEmail().toLowerCase(), request.getOtp());
            return ResponseEntity.ok(new OtpResponse("OTP verified successfully", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new OtpResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryResponse>> listUsers(@RequestParam(required = false) User.Role role) {
        if (role == null) {
            return ResponseEntity.ok(userRepository.findAll().stream().map(this::toUserSummary).toList());
        }
        return ResponseEntity.ok(userRepository.findByRole(role).stream().map(this::toUserSummary).toList());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserSummaryResponse> getUserById(@PathVariable String id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(toUserSummary(user));
    }

    @PutMapping("/users/{id}/profile")
    public ResponseEntity<UserSummaryResponse> updateProfile(
        @PathVariable String id,
        @Valid @RequestBody UserProfileUpdateRequest request
    ) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getName());
        user.setItNumber(request.getItNumber());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setCampusType(request.getCampusType());

        User saved = userRepository.save(user);
        return ResponseEntity.ok(toUserSummary(saved));
    }

    @PutMapping("/users/{id}/promote-admin")
    public ResponseEntity<UserSummaryResponse> promoteToAdmin(@PathVariable String id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(User.Role.ADMIN);
        User saved = userRepository.save(user);
        return ResponseEntity.ok(toUserSummary(saved));
    }

    private UserSummaryResponse toUserSummary(User user) {
        return new UserSummaryResponse(
            user.getId(),
            user.getName(),
            user.getItNumber(),
            user.getEmail(),
            user.getPhoneNumber(),
            user.getCampusType(),
            user.getRole()
        );
    }
}
