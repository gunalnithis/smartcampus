package com.example.smart.campus.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.smart.campus.backend.dto.TicketCommentRequest;
import com.example.smart.campus.backend.dto.TicketRequest;
import com.example.smart.campus.backend.dto.TicketStatusUpdateRequest;
import com.example.smart.campus.backend.exception.ApiException;
import com.example.smart.campus.backend.model.Notification;
import com.example.smart.campus.backend.model.Ticket;
import com.example.smart.campus.backend.model.User;
import com.example.smart.campus.backend.repository.TicketRepository;
import com.example.smart.campus.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketService {

	private static final int MAX_IMAGES = 3;
	private static final Path UPLOAD_DIR = Paths.get("uploads", "tickets");

	private final TicketRepository ticketRepository;
	private final UserRepository userRepository;
	private final NotificationService notificationService;

	public Ticket createTicket(TicketRequest request, List<MultipartFile> images) {
		if (images != null && images.size() > MAX_IMAGES) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Maximum 3 images are allowed");
		}

		Ticket ticket = new Ticket();
		ticket.setResourceId(request.getResourceId());
		ticket.setReportedByUserId(request.getReportedByUserId());
		ticket.setCategory(request.getCategory().trim());
		ticket.setDescription(request.getDescription().trim());
		ticket.setPriority(request.getPriority());
		ticket.setContactDetails(request.getContactDetails());
		ticket.setStatus(Ticket.TicketStatus.OPEN);
		ticket.setImageUrls(storeImages(images));

		Ticket saved = ticketRepository.save(ticket);

		notificationService.createNotification(
			saved.getReportedByUserId(),
			"Ticket created successfully: " + saved.getCategory(),
			Notification.NotificationType.TICKET_CREATED,
			saved.getId()
		);

		return saved;
	}

	public List<Ticket> listTickets(String status, String reportedBy, String assignedTo) {
		return ticketRepository.findAll().stream()
			.filter(t -> status == null || status.isBlank() || t.getStatus().name().equalsIgnoreCase(status))
			.filter(t -> reportedBy == null || reportedBy.isBlank() || reportedBy.equals(t.getReportedByUserId()))
			.filter(t -> assignedTo == null || assignedTo.isBlank() || assignedTo.equals(t.getAssignedToUserId()))
			.toList();
	}

	public Ticket getTicketById(String id) {
		return ticketRepository.findById(id)
			.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ticket not found"));
	}

	public Ticket updateStatus(String id, TicketStatusUpdateRequest request) {
		Ticket ticket = getTicketById(id);
		ticket.setStatus(request.getStatus());
		ticket.setUpdatedAt(LocalDateTime.now());

		if (request.getResolutionNotes() != null && !request.getResolutionNotes().isBlank()) {
			ticket.setResolutionNotes(request.getResolutionNotes().trim());
		}

		Ticket updated = ticketRepository.save(ticket);

		notificationService.createNotification(
			updated.getReportedByUserId(),
			"Ticket status changed to " + updated.getStatus().name(),
			Notification.NotificationType.TICKET_STATUS_CHANGED,
			updated.getId()
		);

		if (updated.getAssignedToUserId() != null && !updated.getAssignedToUserId().isBlank()) {
			notificationService.createNotification(
				updated.getAssignedToUserId(),
				"Ticket status changed to " + updated.getStatus().name(),
				Notification.NotificationType.TICKET_STATUS_CHANGED,
				updated.getId()
			);
		}

		return updated;
	}

	public Ticket assignTechnician(String id, String adminUserId, String technicianUserId) {
		User admin = userRepository.findById(adminUserId)
			.orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Admin user not found"));
		if (admin.getRole() != User.Role.ADMIN) {
			throw new ApiException(HttpStatus.FORBIDDEN, "Only admins can assign technicians");
		}

		User technician = userRepository.findById(technicianUserId)
			.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Technician not found"));
		if (technician.getRole() != User.Role.TECHNICIAN && technician.getRole() != User.Role.ADMIN) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Assigned user must be a technician or admin");
		}

		Ticket ticket = getTicketById(id);
		ticket.setAssignedToUserId(technicianUserId);
		if (ticket.getStatus() == Ticket.TicketStatus.OPEN) {
			ticket.setStatus(Ticket.TicketStatus.IN_PROGRESS);
		}
		ticket.setUpdatedAt(LocalDateTime.now());

		Ticket updated = ticketRepository.save(ticket);

		notificationService.createNotification(
			technicianUserId,
			"You have been assigned to ticket " + updated.getId(),
			Notification.NotificationType.TICKET_STATUS_CHANGED,
			updated.getId()
		);

		return updated;
	}

	public Ticket addComment(String id, TicketCommentRequest request) {
		Ticket ticket = getTicketById(id);
		Ticket.Comment comment = new Ticket.Comment();
		comment.setId(UUID.randomUUID().toString());
		comment.setUserId(request.getUserId());
		comment.setText(request.getText().trim());

		if (ticket.getComments() == null) {
			ticket.setComments(new ArrayList<>());
		}
		ticket.getComments().add(comment);
		ticket.setUpdatedAt(LocalDateTime.now());

		Ticket updated = ticketRepository.save(ticket);

		if (!request.getUserId().equals(updated.getReportedByUserId())) {
			notificationService.createNotification(
				updated.getReportedByUserId(),
				"New comment on your ticket",
				Notification.NotificationType.NEW_COMMENT,
				updated.getId()
			);
		}

		if (updated.getAssignedToUserId() != null
			&& !updated.getAssignedToUserId().isBlank()
			&& !request.getUserId().equals(updated.getAssignedToUserId())) {
			notificationService.createNotification(
				updated.getAssignedToUserId(),
				"New comment on assigned ticket",
				Notification.NotificationType.NEW_COMMENT,
				updated.getId()
			);
		}

		return updated;
	}

	private List<String> storeImages(List<MultipartFile> images) {
		List<String> storedPaths = new ArrayList<>();
		if (images == null || images.isEmpty()) {
			return storedPaths;
		}

		try {
			Files.createDirectories(UPLOAD_DIR);
			for (MultipartFile image : images) {
				if (image == null || image.isEmpty()) {
					continue;
				}
				String originalName = image.getOriginalFilename();
				String safeName = (originalName == null ? "image" : originalName)
					.replaceAll("[^a-zA-Z0-9._-]", "_")
					.toLowerCase(Locale.ROOT);
				String fileName = UUID.randomUUID() + "_" + safeName;
				Path target = UPLOAD_DIR.resolve(fileName);
				Files.copy(image.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
				storedPaths.add("/uploads/tickets/" + fileName);
			}
			return storedPaths;
		} catch (IOException ex) {
			throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store uploaded images");
		}
	}
}
