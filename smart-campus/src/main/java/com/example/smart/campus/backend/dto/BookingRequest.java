package com.example.smart.campus.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequest {
	@NotBlank(message = "Resource ID is required")
	private String resourceId;

	@NotBlank(message = "User ID is required")
	private String userId;

	@NotBlank(message = "Booking date is required")
	private String date;

	@NotBlank(message = "Start time is required")
	private String startTime;

	@NotBlank(message = "End time is required")
	private String endTime;

	@NotBlank(message = "Purpose is required")
	private String purpose;

	@NotNull(message = "Expected attendees is required")
	@Min(value = 1, message = "Expected attendees must be at least 1")
	private Integer expectedAttendees;
}
