package com.example.smart.campus.backend.model;


import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;

    private String resourceId;
    private String userId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private int expectedAttendees;
    private BookingStatus status = BookingStatus.PENDING;
    private String rejectionReason;
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum BookingStatus {
        PENDING, APPROVED, REJECTED, CANCELLED
    }
}