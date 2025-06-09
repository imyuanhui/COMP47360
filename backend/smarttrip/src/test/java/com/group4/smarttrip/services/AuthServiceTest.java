package com.group4.smarttrip.services;


import com.group4.smarttrip.dtos.RegisterUserRequest;
import com.group4.smarttrip.dtos.UserDto;
import com.group4.smarttrip.entities.User;
import com.group4.smarttrip.mappers.UserMapper;
import com.group4.smarttrip.repositories.UserRepository;
import com.group4.smarttrip.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @BeforeEach
    void clearDatabase() {
        userRepository.deleteAll();
    }

    @Test
    void testRegister_success() {

        RegisterUserRequest request = new RegisterUserRequest();
        request.setUsername("test");
        request.setEmail("test@test.com");
        request.setPassword("test1234");

        UserDto userDto = authService.register(userMapper.toEntity(request));

        assertEquals("test", userDto.getUsername());
        assertEquals("test@test.com", userDto.getEmail());

        Optional<User> saved = userRepository.findByEmail("test@test.com");
        assertTrue(saved.isPresent());
        assertTrue(passwordEncoder.matches("test1234", saved.get().getPassword()));
    }

    @Test
    void testRegister_duplicateEmail_throws() {
        RegisterUserRequest request1 = new RegisterUserRequest();
        request1.setUsername("test1");
        request1.setEmail("test1@test.com");
        request1.setPassword("test1234");

        RegisterUserRequest request2 = new RegisterUserRequest();
        request2.setUsername("test2");
        request2.setEmail("test1@test.com");
        request2.setPassword("test1234");

        authService.register(userMapper.toEntity(request1));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.register(userMapper.toEntity(request2)));

        assertEquals("Email already in use", ex.getMessage());
    }

    @Test
    void testRegister_duplicateUsername_throws() {
        RegisterUserRequest request1 = new RegisterUserRequest();
        request1.setUsername("test1");
        request1.setEmail("test1@test.com");
        request1.setPassword("test1234");

        RegisterUserRequest request2 = new RegisterUserRequest();
        request2.setUsername("test1");
        request2.setEmail("test2@test.com");
        request2.setPassword("test1234");

        authService.register(userMapper.toEntity(request1));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.register(userMapper.toEntity(request2))
        );
        assertEquals("Username already in use", ex.getMessage());
    }

    @Test
    void testLogin_success() {
        RegisterUserRequest request = new RegisterUserRequest();
        request.setUsername("test");
        request.setEmail("test@test.com");
        request.setPassword("test1234");

        authService.register(userMapper.toEntity(request));

        Map<String, ?> result = authService.login("test", "test1234");

        assertNotNull(result.get("accessToken"));
        assertNotNull(result.get("refreshToken"));

        UserDto user = (UserDto) result.get("user");
        assertEquals("test", user.getUsername());
        assertEquals("test@test.com", user.getEmail());

        assertTrue(jwtUtil.validateToken((String) result.get("accessToken")));
    }

    @Test
    void testLogin_wrongPassword_throws() {
        RegisterUserRequest request = new RegisterUserRequest();
        request.setUsername("test");
        request.setEmail("test@test.com");
        request.setPassword("test1234");

        authService.register(userMapper.toEntity(request));

        Map<String, ?> result = authService.login("test", "test1234");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.login("test", "wrongpass")
        );

        assertEquals("Invalid credentials", ex.getMessage());
    }

    @Test
    void testLoginLocal_unknownIdentifier_throws() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.login("unknown@example.com", "any")
        );
        assertEquals("Invalid credentials", ex.getMessage());
    }

    @Test
    void testRefreshToken_success() {
        RegisterUserRequest request = new RegisterUserRequest();
        request.setUsername("test");
        request.setEmail("test@test.com");
        request.setPassword("test1234");

        authService.register(userMapper.toEntity(request));

        Map<String, ?> loginResult = authService.login("test@test.com", "test1234");

        String refreshToken = (String) loginResult.get("refreshToken");

        Map<String, ?> refreshed = authService.refreshToken(refreshToken);

        assertNotNull(refreshed.get("accessToken"));
        assertNotNull(refreshed.get("refreshToken"));
        assertNotNull(refreshed.get("user"));

        UserDto user = (UserDto) refreshed.get("user");
        assertEquals("test", user.getUsername());
    }

    @Test
    void testRefreshToken_invalidToken() {
        String badToken = "invalid_token";

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.refreshToken(badToken)
        );

        assertEquals("Invalid refresh token", ex.getMessage());
    }

}
