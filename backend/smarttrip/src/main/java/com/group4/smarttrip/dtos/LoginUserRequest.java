package com.group4.smarttrip.dtos;

import lombok.Data;

@Data
public class LoginUserRequest {
    private String identifier;
    private String password;
}
