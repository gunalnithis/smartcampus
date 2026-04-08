package com.example.smart.campus.backend.dto;

import com.example.smart.campus.backend.model.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BootstrapUserRequest {
    private String id;

    @NotBlank
    private String name;

    @NotBlank
    private String password;

    private String itNumber;

    @NotBlank
    @Email
    private String email;

    private String phoneNumber;

    private User.CampusType campusType;

    private User.Role role;
}
