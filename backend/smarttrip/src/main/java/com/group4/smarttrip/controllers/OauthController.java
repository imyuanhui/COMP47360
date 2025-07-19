package com.group4.smarttrip.controllers;

import com.group4.smarttrip.services.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class OauthController {

    private static final Logger log = LoggerFactory.getLogger(OauthController.class);

    private final AuthService authService;

    @GetMapping("/oauth2/code/google")
    public void handleGoogleOAuthRedirect(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            HttpServletResponse response) throws IOException {

        log.info("Reached /oauth2/code/google controller");

        if (oAuth2User == null) {
            log.error("OAuth2User is null — Google login failed or not processed by Spring Security");
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Google login failed");
            return;
        }

        Map<String, ?> result = authService.loginWithGoogle(oAuth2User);
        String accessToken = (String) result.get("accessToken");
        String refreshToken = (String) result.get("refreshToken");

        // Redirect to frontend with tokens as query params
        String redirectUrl = "https://smarttrip.duckdns.org/oauth-success"
                + "?accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                + "&refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }

    @GetMapping("/login")
    public String loginError(@RequestParam(required = false) String error) {
        return "Login failed: " + (error != null ? error : "Unknown error");
    }

}
