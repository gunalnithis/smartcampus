package com.example.smart.campus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketAssignmentRequest {
    @NotBlank(message = "Admin userId is required")
    private String adminUserId;

    @NotBlank(message = "Technician userId is required")
    private String technicianUserId;
}
