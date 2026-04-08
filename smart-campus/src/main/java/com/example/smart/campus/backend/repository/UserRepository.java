package com.example.smart.campus.backend.repository;

import com.example.smart.campus.backend.model.User;
import java.util.Optional;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    List<User> findByRole(User.Role role);
}
