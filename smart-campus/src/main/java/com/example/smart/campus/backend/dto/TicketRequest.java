package com.example.smart.campus.backend.dto;

import com.example.smart.campus.backend.model.Ticket;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketRequest {
	private String resourceId;

	@NotBlank(message = "Reported by userId is required")
	private String reportedByUserId;

	@NotBlank(message = "Category is required")
	private String category;

	@NotBlank(message = "Description is required")
	private String description;

	@NotNull(message = "Priority is required")
	private Ticket.Priority priority;

	private String contactDetails;
}
