package com.example.smart.campus.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardAnalyticsResponse {
    private long totalResources;
    private long totalBookings;
    private long activeResources;
    private long cancelledBookings;
    private List<BookingsByBuildingDto> bookingsByBuilding;
    private List<PeakBookingHourDto> peakBookingHours;
}
