package com.group4.smarttrip.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.group4.smarttrip.services.AuthService;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthService authService;
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
    .successHandler((request, response, authentication) -> {
        var oauthUser = (org.springframework.security.oauth2.core.user.OAuth2User) authentication.getPrincipal();

        
        var result = authService.loginWithGoogle(oauthUser);
        String accessToken = (String) result.get("accessToken");

        response.sendRedirect("https://smarttrip.duckdns.org/oauth2/redirect?token=" + accessToken);
    }));
        return http.build();
    }
}
