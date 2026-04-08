package com.example.smart.campus.backend.dto;

import com.example.smart.campus.backend.model.User;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserSummaryResponse {
    private String id;
    private String name;
    private String itNumber;
    private String email;
    private String phoneNumber;
    private User.CampusType campusType;
    private User.Role role;
}
