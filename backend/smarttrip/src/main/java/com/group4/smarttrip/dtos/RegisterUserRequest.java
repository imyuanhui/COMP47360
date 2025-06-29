package com.group4.smarttrip.dtos;

import lombok.Data;

@Data
public class RegisterUserRequest {
    private String username;
    private String email;
    private String password;
}
