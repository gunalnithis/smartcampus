package com.example.smart.campus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketCommentRequest {
    @NotBlank(message = "UserId is required")
    private String userId;

    @NotBlank(message = "Comment text is required")
    private String text;
}
