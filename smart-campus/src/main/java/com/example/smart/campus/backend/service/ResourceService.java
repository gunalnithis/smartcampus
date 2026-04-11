package com.example.smart.campus.backend.service;


import java.time.LocalTime;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.example.smart.campus.backend.dto.ResourceRequest;
import com.example.smart.campus.backend.exception.ApiException;
import com.example.smart.campus.backend.model.Resource;
import com.example.smart.campus.backend.repository.ResourceRepository;
import com.example.smart.campus.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public List<Resource> searchResources(String type, Integer capacity, String location, String status, String building) {
        return resourceRepository.findAll().stream()
            .filter(r -> type == null || type.isBlank() || r.getType().name().equalsIgnoreCase(type))
            .filter(r -> capacity == null || r.getCapacity() >= capacity)
            .filter(r -> location == null || location.isBlank() || r.getLocation().toLowerCase(Locale.ROOT).contains(location.toLowerCase(Locale.ROOT)))
            .filter(r -> status == null || status.isBlank() || r.getStatus().name().equalsIgnoreCase(status))
            .filter(r -> building == null || building.isBlank() || (r.getBuilding() != null && r.getBuilding().equalsIgnoreCase(building)))
            .toList();
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resource not found"));
    }

    public Resource createResource(ResourceRequest request, String actingUserId) {
        validateActingUser(actingUserId);
        Resource resource = new Resource();
        mapResource(resource, request);
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, ResourceRequest request, String actingUserId) {
        validateActingUser(actingUserId);
        Resource existing = getResourceById(id);
        mapResource(existing, request);
        return resourceRepository.save(existing);
    }

    public void deleteResource(String id, String actingUserId) {
        validateActingUser(actingUserId);
        Resource existing = getResourceById(id);
        resourceRepository.deleteById(existing.getId());
    }

    private void validateActingUser(String actingUserId) {
        if (actingUserId == null || actingUserId.isBlank()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "User ID is required");
        }

        userRepository.findById(actingUserId)
            .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "User not found"));
    }

    private void mapResource(Resource target, ResourceRequest request) {
        target.setName(request.getName().trim());
        target.setType(request.getType());
        target.setCapacity(request.getCapacity());
        target.setBuilding(request.getBuilding().trim());
        target.setLocation(request.getLocation().trim());
        target.setStatus(request.getStatus());
        target.setDescription(request.getDescription());
        target.setImageUrl(
            request.getImageUrl() == null || request.getImageUrl().isBlank()
                ? null
                : request.getImageUrl().trim()
        );

        if (request.getAvailableFrom() != null && !request.getAvailableFrom().isBlank()) {
            target.setAvailableFrom(LocalTime.parse(request.getAvailableFrom()));
        }
        if (request.getAvailableTo() != null && !request.getAvailableTo().isBlank()) {
            target.setAvailableTo(LocalTime.parse(request.getAvailableTo()));
        }

        if (target.getAvailableFrom() != null && target.getAvailableTo() != null
            && !target.getAvailableTo().isAfter(target.getAvailableFrom())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Available end time must be after start time");
        }
    }
}
