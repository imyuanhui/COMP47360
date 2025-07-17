package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.UserDto;
import com.group4.smarttrip.entities.User;
import com.group4.smarttrip.mappers.UserMapper;
import com.group4.smarttrip.repositories.UserRepository;
import com.group4.smarttrip.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserDto register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already in use");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userRepository.save(user);
        return userMapper.toDto(user);
    }

    public Map<String, ?> login(String identifier, String password) {

        User user = userRepository
                .findByEmailOrUsername(identifier, identifier)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String accessToken = jwtUtil.generateToken(user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        UserDto userDto = userMapper.toDto(user);

        return Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "user", userDto
        );
    }

    public Map<String, String> refreshToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        Long id = jwtUtil.extractUserId(refreshToken);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String newAccessToken = jwtUtil.generateToken(id);

        return Map.of("accessToken", newAccessToken);
    }

    public Map<String, ?> loginWithGoogle(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String providerUserId = oAuth2User.getAttribute("sub"); // Google's unique user ID
        String picture = oAuth2User.getAttribute("picture");

        User user = userRepository.findByEmail(email)
                .filter(u -> u.getProvider().equals("google") || u.getProvider().equals("local")) // handle re-linking if needed
                .orElseGet(() -> {
                    // Create new user for Google account
                    User newUser = User.builder()
                            .email(email)
                            .username(generateUniqueUsernameFromEmail(email))
                            .provider("google")
                            .providerUserId(providerUserId)
                            .profilePhotoUrl(picture)
                            .emailVerified(true)
                            .build();
                    return userRepository.save(newUser);
                });

        String accessToken = jwtUtil.generateToken(user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        UserDto userDto = userMapper.toDto(user);

        return Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "user", userDto
        );
    }

    private String generateUniqueUsernameFromEmail(String email) {
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int suffix = 1;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + suffix++;
        }
        return username;
    }

    public String generateTokenByEmail(String email) {
    User user = userRepository.findByEmail(email)
                  .orElseThrow(() -> new RuntimeException("User not found"));
    return jwtUtil.generateToken(user.getId());
}
}
