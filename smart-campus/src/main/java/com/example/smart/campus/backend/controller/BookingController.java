package com.example.smart.campus.backend.controller;


import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.smart.campus.backend.dto.BookingDecisionRequest;
import com.example.smart.campus.backend.dto.BookingRequest;
import com.example.smart.campus.backend.model.Booking;
import com.example.smart.campus.backend.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = {"http://localhost:*"})
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> create(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Booking>> myBookings(@RequestParam String userId) {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @GetMapping
    public ResponseEntity<List<Booking>> allBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/available-slots")
    public ResponseEntity<Map<String, Object>> availableSlots(@RequestParam String resourceId,
                                                              @RequestParam String date) {
        return ResponseEntity.ok(bookingService.getAvailableSlots(resourceId, date));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Booking> approve(@PathVariable String id,
                                           @Valid @RequestBody BookingDecisionRequest request) {
        return ResponseEntity.ok(bookingService.approveBooking(id, request.getAdminId()));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Booking> reject(@PathVariable String id,
                                          @Valid @RequestBody BookingDecisionRequest request) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, request.getAdminId(), request.getReason()));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancel(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }
}