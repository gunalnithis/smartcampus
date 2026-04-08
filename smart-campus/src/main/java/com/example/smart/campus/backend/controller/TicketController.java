package com.example.smart.campus.backend.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.smart.campus.backend.dto.TicketAssignmentRequest;
import com.example.smart.campus.backend.dto.TicketCommentRequest;
import com.example.smart.campus.backend.dto.TicketRequest;
import com.example.smart.campus.backend.dto.TicketStatusUpdateRequest;
import com.example.smart.campus.backend.model.Ticket;
import com.example.smart.campus.backend.service.TicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = {"http://localhost:*"})
public class TicketController {

	private final TicketService ticketService;

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Ticket> createTicket(
		@Valid @RequestPart("ticket") TicketRequest request,
		@RequestPart(value = "images", required = false) MultipartFile[] images
	) {
		List<MultipartFile> files = images == null ? List.of() : Arrays.stream(images).toList();
		return ResponseEntity.ok(ticketService.createTicket(request, files));
	}

	@GetMapping
	public ResponseEntity<List<Ticket>> listTickets(
		@RequestParam(required = false) String status,
		@RequestParam(required = false) String reportedBy,
		@RequestParam(required = false) String assignedTo
	) {
		return ResponseEntity.ok(ticketService.listTickets(status, reportedBy, assignedTo));
	}

	@GetMapping("/{id}")
	public ResponseEntity<Ticket> getTicket(@PathVariable String id) {
		return ResponseEntity.ok(ticketService.getTicketById(id));
	}

	@PutMapping("/{id}/status")
	public ResponseEntity<Ticket> updateStatus(
		@PathVariable String id,
		@Valid @RequestBody TicketStatusUpdateRequest request
	) {
		return ResponseEntity.ok(ticketService.updateStatus(id, request));
	}

	@PutMapping("/{id}/assign")
	public ResponseEntity<Ticket> assignTechnician(
		@PathVariable String id,
		@Valid @RequestBody TicketAssignmentRequest request
	) {
		return ResponseEntity.ok(ticketService.assignTechnician(
			id,
			request.getAdminUserId(),
			request.getTechnicianUserId()
		));
	}

	@PostMapping("/{id}/comments")
	public ResponseEntity<Ticket> addComment(
		@PathVariable String id,
		@Valid @RequestBody TicketCommentRequest request
	) {
		return ResponseEntity.ok(ticketService.addComment(id, request));
	}
}
