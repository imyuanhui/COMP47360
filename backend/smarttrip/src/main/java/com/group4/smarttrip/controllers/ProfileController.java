package com.group4.smarttrip.controllers;

import com.group4.smarttrip.dtos.ChangePasswordRequest;
import com.group4.smarttrip.dtos.UpdateUserRequest;
import com.group4.smarttrip.dtos.UserDto;
import com.group4.smarttrip.security.JwtUtil;
import com.group4.smarttrip.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/profile")
public class ProfileController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new IllegalArgumentException("Authorization token is missing or invalid");
    }

    @GetMapping
    private ResponseEntity<?> viewProfile(HttpServletRequest request) {
        try {
            Long id = extractUserId(request);
            UserDto userDto = userService.getUser(id);
            return ResponseEntity.ok(userDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping
    private ResponseEntity<?> editProfile(@RequestBody UpdateUserRequest updateRequest,
                                          HttpServletRequest request) {
        try {
            Long id = extractUserId(request);
            UserDto updatedUser = userService.updateUser(id, updateRequest);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping
    private ResponseEntity<?> deleteUser(HttpServletRequest request) {
        try {
            Long id = extractUserId(request);
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/change-password")
    private ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest passwordRequest,
                                             HttpServletRequest request) {
        try {
            Long id = extractUserId(request);
            userService.changePassword(id, passwordRequest);
            return ResponseEntity.ok(Map.of("Success", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
