package com.miro.zerotrustapi.auth.controller;

import com.miro.zerotrustapi.audit.service.AuditService;
import com.miro.zerotrustapi.auth.dto.AuthResponse;
import com.miro.zerotrustapi.auth.dto.DisableMfaRequest;
import com.miro.zerotrustapi.auth.dto.LoginRequest;
import com.miro.zerotrustapi.auth.dto.LoginResponse;
import com.miro.zerotrustapi.auth.dto.LogoutRequest;
import com.miro.zerotrustapi.auth.dto.MfaLoginRequest;
import com.miro.zerotrustapi.auth.dto.MfaSetupResponse;
import com.miro.zerotrustapi.auth.dto.MfaVerifyRequest;
import com.miro.zerotrustapi.auth.dto.RefreshTokenRequest;
import com.miro.zerotrustapi.auth.dto.RegisterRequest;
import com.miro.zerotrustapi.auth.service.AuthService;
import com.miro.zerotrustapi.auth.service.MfaService;
import com.miro.zerotrustapi.security.RateLimitExceededException;
import com.miro.zerotrustapi.security.RateLimitService;
import com.miro.zerotrustapi.user.entity.User;
import com.miro.zerotrustapi.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final MfaService mfaService;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final RateLimitService rateLimitService;

    @Value("${security.rate-limit.login.max-attempts}")
    private int loginMaxAttempts;

    @Value("${security.rate-limit.login.window-seconds}")
    private int loginWindowSeconds;

    @Value("${security.rate-limit.mfa.max-attempts}")
    private int mfaMaxAttempts;

    @Value("${security.rate-limit.mfa.window-seconds}")
    private int mfaWindowSeconds;

    public AuthController(
            AuthService authService,
            MfaService mfaService,
            UserRepository userRepository,
            AuditService auditService,
            RateLimitService rateLimitService
    ) {
        this.authService = authService;
        this.mfaService = mfaService;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.rateLimitService = rateLimitService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> register(@Valid @RequestBody RegisterRequest request) {
        return Map.of("message", authService.register(request));
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        String rateKey = "login:" + clientIp;

        if (!rateLimitService.isAllowed(rateKey, loginMaxAttempts, loginWindowSeconds)) {
            auditService.log(
                    null,
                    "LOGIN_RATE_LIMIT_EXCEEDED",
                    clientIp,
                    httpRequest.getHeader("User-Agent"),
                    "Too many login attempts"
            );
            throw new RateLimitExceededException("Too many login attempts. Please try again later.");
        }

        try {
            LoginResponse response = authService.login(request);

            String normalizedEmail = request.getEmail().trim().toLowerCase();
            userRepository.findByEmail(normalizedEmail).ifPresent(user ->
                    auditService.log(
                            user.getId(),
                            response.isMfaRequired() ? "LOGIN_PASSWORD_VERIFIED_MFA_REQUIRED" : "LOGIN_SUCCESS",
                            clientIp,
                            httpRequest.getHeader("User-Agent"),
                            "Email login attempted"
                    )
            );

            return response;
        } catch (RuntimeException ex) {
            auditService.log(
                    null,
                    "LOGIN_FAILED",
                    clientIp,
                    httpRequest.getHeader("User-Agent"),
                    "Failed login for email: " + request.getEmail()
            );
            throw ex;
        }
    }

    @PostMapping("/login/mfa")
    public AuthResponse loginWithMfa(@Valid @RequestBody MfaLoginRequest request, HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        String rateKey = "mfa-login:" + clientIp;

        if (!rateLimitService.isAllowed(rateKey, mfaMaxAttempts, mfaWindowSeconds)) {
            auditService.log(
                    null,
                    "MFA_LOGIN_RATE_LIMIT_EXCEEDED",
                    clientIp,
                    httpRequest.getHeader("User-Agent"),
                    "Too many MFA login attempts"
            );
            throw new RateLimitExceededException("Too many MFA attempts. Please try again later.");
        }

        AuthResponse response = authService.loginWithMfa(request);

        auditService.log(
                null,
                "LOGIN_MFA_SUCCESS",
                clientIp,
                httpRequest.getHeader("User-Agent"),
                "MFA login completed successfully"
        );

        return response;
    }

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "mfaEnabled", user.isMfaEnabled()
        );
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    public Map<String, String> logout(@Valid @RequestBody LogoutRequest request, Principal principal, HttpServletRequest httpRequest) {
        UUID userId = principal != null ? UUID.fromString(principal.getName()) : null;

        String message = authService.logout(request.getRefreshToken());

        auditService.log(
                userId,
                "LOGOUT_SUCCESS",
                getClientIp(httpRequest),
                httpRequest.getHeader("User-Agent"),
                "Refresh token revoked on logout"
        );

        return Map.of("message", message);
    }

    @PostMapping("/mfa/setup")
    public MfaSetupResponse setupMfa(Principal principal, HttpServletRequest httpRequest) {
        UUID userId = UUID.fromString(principal.getName());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        MfaSetupResponse response = mfaService.setupMfa(userId, user.getEmail());

        auditService.log(
                userId,
                "MFA_SETUP_STARTED",
                getClientIp(httpRequest),
                httpRequest.getHeader("User-Agent"),
                "MFA secret generated"
        );

        return response;
    }

    @PostMapping("/mfa/verify")
    public Map<String, String> verifyMfa(
            Principal principal,
            @Valid @RequestBody MfaVerifyRequest request,
            HttpServletRequest httpRequest
    ) {
        UUID userId = UUID.fromString(principal.getName());
        mfaService.enableMfa(userId, request.getCode());

        auditService.log(
                userId,
                "MFA_ENABLED",
                getClientIp(httpRequest),
                httpRequest.getHeader("User-Agent"),
                "MFA enabled successfully"
        );

        return Map.of("message", "MFA enabled successfully");
    }

    @PostMapping("/mfa/disable")
    public Map<String, String> disableMfa(
            Principal principal,
            @Valid @RequestBody DisableMfaRequest request,
            HttpServletRequest httpRequest
    ) {
        UUID userId = UUID.fromString(principal.getName());
        mfaService.disableMfa(userId, request.getCode());

        auditService.log(
                userId,
                "MFA_DISABLED",
                getClientIp(httpRequest),
                httpRequest.getHeader("User-Agent"),
                "MFA disabled successfully"
        );

        return Map.of("message", "MFA disabled successfully");
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}