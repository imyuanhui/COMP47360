package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.ChangePasswordRequest;
import com.group4.smarttrip.dtos.UpdateUserRequest;
import com.group4.smarttrip.dtos.UserDto;
import com.group4.smarttrip.entities.User;
import com.group4.smarttrip.mappers.UserMapper;
import com.group4.smarttrip.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserDto getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return userMapper.toDto(user);
    }

    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String newEmail = request.getEmail();
        String newUsername = request.getUsername();

        if (newEmail != null && userRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("Email already in use");
        }

        if (newUsername != null && userRepository.existsByUsername(newUsername)) {
            throw new IllegalArgumentException("Username already in use");
        }

        userMapper.update(request, user);

        User updatedUser = userRepository.save(user);

        return userMapper.toDto(updatedUser);
    }

    public void changePassword(Long id, ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.deleteById(id);
    }
}
