package com.group4.smarttrip.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = {"provider", "providerUserId"})
})
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, nullable = false)
    private String username;

    @Column(nullable = false)
    private String email;

    @Column(length = 20, nullable = false)
    private String provider; // e.g. "local", "google", "facebook"

    @Column(length = 100)
    private String providerUserId;

    private String password; // nullable for OAuth-only users

    @Column(columnDefinition = "TEXT")
    private String profilePhotoUrl;

    @Column(nullable = false)
    private boolean emailVerified = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (provider == null) {
            provider = "local";
        }
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "(id: " + id + ", username: " + username + "email: " + email + ")";
    }
}
