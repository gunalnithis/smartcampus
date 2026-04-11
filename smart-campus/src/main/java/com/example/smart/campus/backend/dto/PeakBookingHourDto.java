package com.example.smart.campus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PeakBookingHourDto {
    private String hourLabel;
    private long totalBookings;
}
