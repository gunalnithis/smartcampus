package com.example.smart.campus.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.smart.campus.backend.dto.ResourceRequest;
import com.example.smart.campus.backend.model.Resource;
import com.example.smart.campus.backend.service.ResourceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = {"http://localhost:*"})
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<Resource>> getAll(
        @RequestParam(required = false) String type,
        @RequestParam(required = false) Integer capacity,
        @RequestParam(required = false) String location,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String building
    ) {
        return ResponseEntity.ok(resourceService.searchResources(type, capacity, location, status, building));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PostMapping
    public ResponseEntity<Resource> create(
        @Valid @RequestBody ResourceRequest request,
        @RequestParam("adminId") String adminId
    ) {
        return ResponseEntity.ok(resourceService.createResource(request, adminId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> update(
        @PathVariable String id,
        @Valid @RequestBody ResourceRequest request,
        @RequestParam("adminId") String adminId
    ) {
        return ResponseEntity.ok(resourceService.updateResource(id, request, adminId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable String id,
        @RequestParam("adminId") String adminId
    ) {
        resourceService.deleteResource(id, adminId);
        return ResponseEntity.noContent().build();
    }
}