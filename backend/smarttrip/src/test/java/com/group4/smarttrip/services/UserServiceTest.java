package com.group4.smarttrip.services;


import com.group4.smarttrip.dtos.UpdateUserRequest;
import com.group4.smarttrip.dtos.UserDto;
import com.group4.smarttrip.entities.User;
import com.group4.smarttrip.repositories.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
public class UserServiceTest {
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    private final List<Long> createdUserIds = new ArrayList<>();

    private Long createTestUser(String username, String email) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword("password"); // hashed in real cases
        User saved = userRepository.save(user);
        createdUserIds.add(saved.getId());
        return saved.getId();
    }

    @AfterEach
    public void cleanUp() {
        for (Long id : createdUserIds) {
            userRepository.deleteById(id);
        }
        createdUserIds.clear();
    }

    @Test
    public void testGetUser_Success() {
        Long id = createTestUser("smartUser", "smart@mail.com");
        UserDto userDto = userService.getUser(id);
        assertEquals("smartUser", userDto.getUsername());
        assertEquals("smart@mail.com", userDto.getEmail());
    }

    @Test
    public void testGetUser_NotFound() {
        Long id = createTestUser("testUser", "test@mail.com");
        Long wrongId = id + 999;
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.getUser(wrongId));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    public void testUpdateUser_Success() {
        Long id = createTestUser("user1", "user1@mail.com");
        UpdateUserRequest request = new UpdateUserRequest();
        request.setEmail("updated@mail.com");

        UserDto updated = userService.updateUser(id, request);
        assertEquals("updated@mail.com", updated.getEmail());
        assertEquals("user1", updated.getUsername());
    }

    @Test
    public void testUpdateUser_DuplicateEmail() {
        Long id1 = createTestUser("user1", "user1@mail.com");
        Long id2 = createTestUser("user2", "user2@mail.com");

        UpdateUserRequest request = new UpdateUserRequest();
        request.setEmail("user1@mail.com");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.updateUser(id2, request));

        assertEquals("Email already in use", ex.getMessage());
    }

    @Test
    public void testUpdateUser_DuplicateUsername() {
        Long id1 = createTestUser("userA", "a@mail.com");
        Long id2 = createTestUser("userB", "b@mail.com");

        UpdateUserRequest request = new UpdateUserRequest();
        request.setUsername("userA");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.updateUser(id2, request));

        assertEquals("Username already in use", ex.getMessage());
    }
}
