package com.example.smart.campus.backend.dto;

import com.example.smart.campus.backend.model.Resource;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResourceRequest {
    @NotBlank(message = "Resource name is required")
    private String name;

    @NotNull(message = "Resource type is required")
    private Resource.ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    @NotBlank(message = "Building is required")
    private String building;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Resource status is required")
    private Resource.ResourceStatus status;

    private String description;

    private String imageUrl;

    private String availableFrom;

    private String availableTo;
}
