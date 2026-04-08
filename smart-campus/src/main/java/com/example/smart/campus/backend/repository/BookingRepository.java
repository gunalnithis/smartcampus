package com.example.smart.campus.backend.repository;

import com.example.smart.campus.backend.model.Booking;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceIdAndDate(String resourceId, LocalDate date);
    List<Booking> findByStatus(Booking.BookingStatus status);
}