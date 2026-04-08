package com.example.smart.campus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BookingDecisionRequest {
    @NotBlank(message = "Admin userId is required")
    private String adminId;

    private String reason;
}
