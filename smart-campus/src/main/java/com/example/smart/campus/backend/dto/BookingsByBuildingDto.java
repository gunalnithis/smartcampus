package com.example.smart.campus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BookingsByBuildingDto {
    private String building;
    private long totalBookings;
}
