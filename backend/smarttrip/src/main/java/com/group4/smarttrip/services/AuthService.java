package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.UserDto;
import com.group4.smarttrip.entities.User;
import com.group4.smarttrip.mappers.UserMapper;
import com.group4.smarttrip.repositories.UserRepository;
import com.group4.smarttrip.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
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
        if (userRepository.existsByEmail(user.getEmail()) || userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Email or username already in use");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    public Map<String, ?> login(String identifier, String password) {
        User user = userRepository
                .findByUsernameOrEmail(identifier, identifier)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String accessToken = jwtUtil.generateToken(user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        UserDto userDto = userMapper.toDto(user);

        return Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "user", userDto
        );
    }
}
