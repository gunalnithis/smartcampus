package com.example.smart.campus.backend.dto;

import com.example.smart.campus.backend.model.Ticket;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketStatusUpdateRequest {
    @NotBlank(message = "Actor userId is required")
    private String actorUserId;

    @NotNull(message = "Status is required")
    private Ticket.TicketStatus status;

    private String resolutionNotes;
}
