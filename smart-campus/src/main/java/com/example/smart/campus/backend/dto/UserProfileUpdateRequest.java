package com.example.smart.campus.backend.dto;

import com.example.smart.campus.backend.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String itNumber;

    @NotBlank
    private String email;

    @NotBlank
    private String phoneNumber;

    @NotNull
    private User.CampusType campusType;
}
