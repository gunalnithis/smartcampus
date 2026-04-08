package com.example.smart.campus.backend.model;


import java.time.LocalTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "resources")
public class Resource {
    @Id
    private String id;

    private String name;
    private ResourceType type;
    private int capacity;
    private String building;
    private String location;
    private ResourceStatus status = ResourceStatus.ACTIVE;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private String description;
    private String imageUrl;

    public enum ResourceType {
        LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
    }

    public enum ResourceStatus {
        ACTIVE, OUT_OF_SERVICE
    }
}