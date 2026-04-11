package com.example.smart.campus.backend.repository;

// ResourceRepository.java


import com.example.smart.campus.backend.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByType(Resource.ResourceType type);
    List<Resource> findByLocation(String location);
    List<Resource> findByCapacityGreaterThanEqual(int capacity);
    List<Resource> findByTypeAndStatus(Resource.ResourceType type, Resource.ResourceStatus status);
    long countByStatus(Resource.ResourceStatus status);
}