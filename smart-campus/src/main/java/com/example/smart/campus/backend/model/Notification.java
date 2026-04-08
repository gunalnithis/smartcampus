package com.example.smart.campus.backend.model;



import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;

    private String userId;
    private String message;
    private NotificationType type;
    private String referenceId;
    private boolean read = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum NotificationType {
        BOOKING_CREATED,
        BOOKING_APPROVED,
        BOOKING_REJECTED,
        TICKET_CREATED,
        TICKET_STATUS_CHANGED,
        NEW_COMMENT
    }
}