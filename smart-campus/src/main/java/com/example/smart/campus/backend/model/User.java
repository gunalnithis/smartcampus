package com.example.smart.campus.backend.model;


import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String name;
    private String itNumber;
    private CampusType campusType;
    private String phoneNumber;
    private String passwordHash;
    private String profilePicture;
    private String googleId;
    private Role role = Role.USER;
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum CampusType {
        COLOMBO, KANDY, JAFFNA
    }

    public enum Role {
        USER, ADMIN, TECHNICIAN
    }
}