package com.group4.smarttrip.repositories;

import com.group4.smarttrip.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    Optional<User> findByEmail(String email);
    Optional<User> findByEmailOrUsername(String email, String username);
    Optional<User> findByProviderAndProviderUserId(String provider, String providerUserId);
}
