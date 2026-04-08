package com.example.smart.campus.backend.service;


import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.example.smart.campus.backend.dto.BookingRequest;
import com.example.smart.campus.backend.exception.ApiException;
import com.example.smart.campus.backend.model.Booking;
import com.example.smart.campus.backend.model.Notification;
import com.example.smart.campus.backend.model.Resource;
import com.example.smart.campus.backend.model.User;
import com.example.smart.campus.backend.repository.BookingRepository;
import com.example.smart.campus.backend.repository.ResourceRepository;
import com.example.smart.campus.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    private static final Set<Booking.BookingStatus> BLOCKING_STATUSES = Set.of(
        Booking.BookingStatus.PENDING,
        Booking.BookingStatus.APPROVED
    );

    public Booking createBooking(BookingRequest request) {
        Resource resource = resourceRepository.findById(request.getResourceId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resource not found"));

        if (resource.getStatus() != Resource.ResourceStatus.ACTIVE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Resource is not active for booking");
        }

        if (request.getExpectedAttendees() > resource.getCapacity()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Expected attendees exceed resource capacity");
        }

        LocalDate date = LocalDate.parse(request.getDate());
        LocalTime startTime = LocalTime.parse(request.getStartTime());
        LocalTime endTime = LocalTime.parse(request.getEndTime());

        if (!endTime.isAfter(startTime)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        List<Booking> existing = bookingRepository
            .findByResourceIdAndDate(request.getResourceId(), date);

        boolean conflict = existing.stream()
            .filter(b -> BLOCKING_STATUSES.contains(b.getStatus()))
            .anyMatch(b ->
                startTime.isBefore(b.getEndTime()) &&
                endTime.isAfter(b.getStartTime())
            );

        if (conflict) {
            throw new ApiException(HttpStatus.CONFLICT, "Time slot already booked");
        }

        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setUserId(request.getUserId());
        booking.setDate(date);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        Booking saved = bookingRepository.save(booking);
        notificationService.createNotification(
            saved.getUserId(),
            "Booking request sent for " + resource.getName() + ". Status: PENDING",
            Notification.NotificationType.BOOKING_CREATED,
            saved.getId()
        );
        sendBookingEmailToUser(
            saved,
            resource.getName(),
            "PENDING",
            "Your booking request has been submitted successfully."
        );

        List<User> admins = userRepository.findByRole(User.Role.ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(
                admin.getId(),
                "New booking request for " + resource.getName() + " on " + saved.getDate(),
                Notification.NotificationType.BOOKING_CREATED,
                saved.getId()
            );
        }
        return saved;
    }

    public Map<String, Object> getAvailableSlots(String resourceId, String dateText) {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resource not found"));

        LocalDate date = LocalDate.parse(dateText);
        LocalTime windowStart = resource.getAvailableFrom() != null
            ? resource.getAvailableFrom()
            : LocalTime.of(8, 0);
        LocalTime windowEnd = resource.getAvailableTo() != null
            ? resource.getAvailableTo()
            : LocalTime.of(18, 0);

        if (!windowEnd.isAfter(windowStart)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid resource availability window");
        }

        List<Booking> existing = bookingRepository.findByResourceIdAndDate(resourceId, date);

        List<Booking> blocked = existing.stream()
            .filter(b -> BLOCKING_STATUSES.contains(b.getStatus()))
            .toList();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm");
        List<Map<String, Object>> slots = new ArrayList<>();

        LocalTime cursor = windowStart;
        while (cursor.isBefore(windowEnd)) {
            LocalTime next = cursor.plusHours(1);
            if (next.isAfter(windowEnd)) {
                break;
            }

            LocalTime slotStart = cursor;
            LocalTime slotEnd = next;
            boolean available = blocked.stream().noneMatch(b ->
                slotStart.isBefore(b.getEndTime()) &&
                slotEnd.isAfter(b.getStartTime())
            );

            Map<String, Object> slot = new LinkedHashMap<>();
            slot.put("startTime", slotStart.format(fmt));
            slot.put("endTime", slotEnd.format(fmt));
            slot.put("available", available);
            slots.add(slot);

            cursor = next;
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("resourceId", resourceId);
        response.put("date", date.toString());
        response.put("windowStart", windowStart.format(fmt));
        response.put("windowEnd", windowEnd.format(fmt));
        response.put("slots", slots);
        return response;
    }

    public List<Booking> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking approveBooking(String id, String adminId) {
        validateAdmin(adminId);
        Booking booking = getBookingById(id);
        ensurePending(booking);
        booking.setStatus(Booking.BookingStatus.APPROVED);
        booking.setRejectionReason(null);
        Booking saved = bookingRepository.save(booking);
        notificationService.createNotification(
            booking.getUserId(),
            "Your booking has been approved!",
            Notification.NotificationType.BOOKING_APPROVED,
            id
        );
        Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
        sendBookingEmailToUser(
            saved,
            resource != null ? resource.getName() : "Resource",
            "APPROVED",
            "Your booking has been approved."
        );
        return saved;
    }

    public Booking rejectBooking(String id, String adminId, String reason) {
        validateAdmin(adminId);
        Booking booking = getBookingById(id);
        ensurePending(booking);

        if (reason == null || reason.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rejection reason is required");
        }

        booking.setStatus(Booking.BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking saved = bookingRepository.save(booking);
        notificationService.createNotification(
            booking.getUserId(),
            "Your booking was rejected: " + reason,
            Notification.NotificationType.BOOKING_REJECTED,
            id
        );
        Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
        sendBookingEmailToUser(
            saved,
            resource != null ? resource.getName() : "Resource",
            "REJECTED",
            "Your booking was rejected. Reason: " + reason
        );
        return saved;
    }

    public Booking cancelBooking(String id) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            return booking;
        }
        if (booking.getStatus() == Booking.BookingStatus.REJECTED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rejected booking cannot be cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        notificationService.createNotification(
            booking.getUserId(),
            "Your booking has been cancelled",
            Notification.NotificationType.BOOKING_REJECTED,
            booking.getId()
        );
        Booking saved = bookingRepository.save(booking);
        Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
        sendBookingEmailToUser(
            saved,
            resource != null ? resource.getName() : "Resource",
            "CANCELLED",
            "Your booking has been cancelled."
        );
        return saved;
    }

    private void sendBookingEmailToUser(Booking booking, String resourceName, String status, String message) {
        try {
            User user = userRepository.findById(booking.getUserId()).orElse(null);
            if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
                return;
            }
            emailService.sendBookingUpdateEmail(
                user.getEmail(),
                user.getName(),
                resourceName,
                booking.getDate() != null ? booking.getDate().toString() : "-",
                booking.getStartTime() != null ? booking.getStartTime().toString() : "-",
                booking.getEndTime() != null ? booking.getEndTime().toString() : "-",
                status,
                message
            );
        } catch (Exception ignored) {
            // Booking flow should not fail if email service is temporarily unavailable.
        }
    }

    private Booking getBookingById(String id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    private void validateAdmin(String adminId) {
        if (adminId == null || adminId.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Acting userId is required");
        }

        User actingUser = userRepository.findById(adminId)
            .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Acting user not found"));

        boolean hasAdminAccounts = !userRepository.findByRole(User.Role.ADMIN).isEmpty();
        if (hasAdminAccounts && actingUser.getRole() != User.Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only admins can approve/reject bookings");
        }
    }

    private void ensurePending(Booking booking) {
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only pending bookings can be updated");
        }
    }
}