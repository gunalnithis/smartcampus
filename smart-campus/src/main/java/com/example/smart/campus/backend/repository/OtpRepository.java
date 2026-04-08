package com.example.smart.campus.backend.repository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.example.smart.campus.backend.model.Otp;

@Repository
public interface OtpRepository extends MongoRepository<Otp, String> {
    Optional<Otp> findByEmailAndVerifiedFalse(String email);
    Optional<Otp> findByEmail(String email);
    void deleteByEmail(String email);
}
