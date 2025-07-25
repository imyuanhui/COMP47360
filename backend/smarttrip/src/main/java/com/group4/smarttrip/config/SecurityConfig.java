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

//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(csrf -> csrf.disable()) // Disable CSRF for REST API
//                .authorizeHttpRequests(auth -> auth
//                                .anyRequest().permitAll()
////                        .requestMatchers("/api/auth/register", "/api/auth/login", "/").permitAll()
////                        .anyRequest().authenticated()
//                )
//                .httpBasic(Customizer.withDefaults())
//                .oauth2Login(Customizer.withDefaults()); // Optional: if you're not using JWT filter yet
//
//        return http.build();
//    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/**",
                                "/oauth2/**",
                                "/api/oauth2/**",
                                "/login/**",
                                "/error"
                        ).permitAll()
                        .anyRequest().authenticated()
                )

                .httpBasic(Customizer.withDefaults())

                // Enable OAuth2 login (DO NOT set defaultSuccessUrl here!)
                // debugging on service
                .oauth2Login(oauth -> oauth
                        // Let Spring use the redirect-uri from application.properties
                        .successHandler((request, response, authentication) -> {
                            System.out.println("[OAuth2Login Success] Authentication complete. Redirecting to: /oauth2/code/google");
                            // Instead of redirecting here, delegate to your controller
                            response.sendRedirect("/oauth2/code/google");
                        })
                        .failureHandler((request, response, exception) -> {
                            System.err.println("[OAuth2Login Failure] " + exception.getMessage());
                            response.sendRedirect("/login?oauth2Error=true");
                        })
                );

        return http.build();
    }

}

