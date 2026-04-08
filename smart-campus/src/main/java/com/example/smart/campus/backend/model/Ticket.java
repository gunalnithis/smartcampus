package com.example.smart.campus.backend.model;



import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "tickets")
public class Ticket {
    @Id
    private String id;

    private String resourceId;
    private String reportedByUserId;
    private String assignedToUserId;
    private String category;
    private String description;
    private Priority priority;
    private TicketStatus status = TicketStatus.OPEN;
    private List<String> imageUrls = new ArrayList<>();
    private List<Comment> comments = new ArrayList<>();
    private String resolutionNotes;
    private String contactDetails;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Priority { LOW, MEDIUM, HIGH, CRITICAL }
    public enum TicketStatus { OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED }

    @Data
    public static class Comment {
        private String id;
        private String userId;
        private String text;
        private LocalDateTime createdAt = LocalDateTime.now();
    }
}