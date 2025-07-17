package com.group4.smarttrip.controllers;


import com.group4.smarttrip.dtos.LoginUserRequest;
import com.group4.smarttrip.dtos.RegisterUserRequest;
import com.group4.smarttrip.mappers.UserMapper;
import com.group4.smarttrip.services.AuthService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("api")
public class AuthController {

    private final AuthService authService;
    private final UserMapper userMapper;

    @PostMapping("/signup")
    public ResponseEntity<?> register(
            @RequestBody RegisterUserRequest request,
            UriComponentsBuilder uriBuilder) {

        try {
            var userDto = authService.register(userMapper.toEntity(request));
            var uri = uriBuilder.path("/user/{id}").buildAndExpand(userDto.getId()).toUri();
            return ResponseEntity.created(uri).body(userDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginUserRequest request) {

        try {
            var response = authService.login(request.getIdentifier(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/token/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {

        try {
            var response = authService.refreshToken(request.get("refreshToken"));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Google OAuth callback
    // @GetMapping("/oauth2/callback/google")
    // public ResponseEntity<?> handleGoogleLogin(@AuthenticationPrincipal OAuth2User oAuth2User) {
    //     try {
    //         var response = authService.loginWithGoogle(oAuth2User);
    //         return ResponseEntity.ok(response);
    //     } catch (RuntimeException e) {
    //         return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
    //                 .body(Map.of("error", e.getMessage()));
    //     }
    // }
    @GetMapping("/oauth2/callback/google")
    public void handleGoogleLogin(@AuthenticationPrincipal OAuth2User oAuth2User,
                              HttpServletResponse response) throws IOException {
    try {
        var loginResult = authService.loginWithGoogle(oAuth2User);
        String accessToken = (String) loginResult.get("accessToken");

        
        String frontendRedirectUrl = "https://smarttrip.duckdns.org/oauth2/redirect?token=" + accessToken;
        response.sendRedirect(frontendRedirectUrl);
    } catch (RuntimeException e) {
        response.sendRedirect("https://smarttrip.duckdns.org/oauth2/redirect?error=oauth");
    }
}

}
