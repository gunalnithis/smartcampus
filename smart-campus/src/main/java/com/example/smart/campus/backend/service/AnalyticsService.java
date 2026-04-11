package com.example.smart.campus.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import com.example.smart.campus.backend.dto.BookingsByBuildingDto;
import com.example.smart.campus.backend.dto.DashboardAnalyticsResponse;
import com.example.smart.campus.backend.dto.PeakBookingHourDto;
import com.example.smart.campus.backend.model.Booking;
import com.example.smart.campus.backend.model.Resource;
import com.example.smart.campus.backend.repository.BookingRepository;
import com.example.smart.campus.backend.repository.ResourceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final MongoTemplate mongoTemplate;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;

    public DashboardAnalyticsResponse getDashboardAnalytics() {
        long totalResources = resourceRepository.count();
        long totalBookings = bookingRepository.count();
        long activeResources = resourceRepository.countByStatus(Resource.ResourceStatus.ACTIVE);
        long cancelledBookings = bookingRepository.findByStatus(Booking.BookingStatus.CANCELLED).size();

        return new DashboardAnalyticsResponse(
            totalResources,
            totalBookings,
            activeResources,
            cancelledBookings,
            getBookingsByBuilding(),
            getPeakBookingHours()
        );
    }

    private List<BookingsByBuildingDto> getBookingsByBuilding() {
        List<Document> pipeline = List.of(
            new Document("$match", new Document("status", new Document("$ne", "CANCELLED"))),
            new Document("$lookup", new Document("from", "resources")
                .append("localField", "resourceId")
                .append("foreignField", "_id")
                .append("as", "resource")),
            new Document("$project", new Document("building", new Document("$ifNull", List.of(
                new Document("$arrayElemAt", List.of("$resource.building", 0)),
                "UNKNOWN_BUILDING"
            )))),
            new Document("$group", new Document("_id", "$building").append("totalBookings", new Document("$sum", 1))),
            new Document("$sort", new Document("totalBookings", -1)),
            new Document("$project", new Document("_id", 0)
                .append("building", "$_id")
                .append("totalBookings", 1))
        );

        List<Document> docs = mongoTemplate.getCollection("bookings")
            .aggregate(pipeline)
            .into(new ArrayList<>());

        return docs.stream()
            .map(doc -> new BookingsByBuildingDto(
                doc.getString("building"),
                ((Number) doc.getOrDefault("totalBookings", 0)).longValue()
            ))
            .toList();
    }

    private List<PeakBookingHourDto> getPeakBookingHours() {
        List<Document> pipeline = List.of(
            new Document("$match", new Document("status", new Document("$ne", "CANCELLED"))),
            new Document("$project", new Document("hour", new Document(
                "$substr", List.of(new Document("$toString", "$startTime"), 0, 2)
            ))),
            new Document("$match", new Document("hour", Pattern.compile("^\\d{2}$"))),
            new Document("$group", new Document("_id", "$hour").append("totalBookings", new Document("$sum", 1))),
            new Document("$sort", new Document("_id", 1))
        );

        List<Document> docs = mongoTemplate.getCollection("bookings")
            .aggregate(pipeline)
            .into(new ArrayList<>());

        return docs.stream()
            .map(doc -> new PeakBookingHourDto(
                doc.getString("_id") + ":00",
                ((Number) doc.getOrDefault("totalBookings", 0)).longValue()
            ))
            .toList();
    }
}
