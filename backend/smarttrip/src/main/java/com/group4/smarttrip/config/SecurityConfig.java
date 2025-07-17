package com.group4.smarttrip.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for REST API
                .authorizeHttpRequests(auth -> auth
                                .anyRequest().permitAll()
//                        .requestMatchers("/api/auth/register", "/api/auth/login", "/").permitAll()
//                        .anyRequest().authenticated()
                )
                // .httpBasic(Customizer.withDefaults()); // Optional: if you're not using JWT filter yet
                .httpBasic(Customizer.withDefaults())
                .oauth2Login(oauth -> oauth
            .defaultSuccessUrl("/api/oauth2/callback/google", true)); // Optional: if you're not using JWT filter yet
        return http.build();
    }
}
