package com.example.smart.campus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopBookedResourceDto {
    private String resourceId;
    private String resourceName;
    private long totalBookings;
}
