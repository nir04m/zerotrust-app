package com.miro.zerotrustapi.auth.controller;

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
import com.miro.zerotrustapi.user.entity.User;
import com.miro.zerotrustapi.user.repository.UserRepository;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final MfaService mfaService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, MfaService mfaService, UserRepository userRepository) {
        this.authService = authService;
        this.mfaService = mfaService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> register(@Valid @RequestBody RegisterRequest request) {
        return Map.of("message", authService.register(request));
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/login/mfa")
    public AuthResponse loginWithMfa(@Valid @RequestBody MfaLoginRequest request) {
        return authService.loginWithMfa(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    public Map<String, String> logout(@Valid @RequestBody LogoutRequest request) {
        return Map.of("message", authService.logout(request.getRefreshToken()));
    }

    @PostMapping("/mfa/setup")
    public MfaSetupResponse setupMfa(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return mfaService.setupMfa(userId, user.getEmail());
    }

    @PostMapping("/mfa/verify")
    public Map<String, String> verifyMfa(
            Principal principal,
            @Valid @RequestBody MfaVerifyRequest request
    ) {
        UUID userId = UUID.fromString(principal.getName());
        mfaService.enableMfa(userId, request.getCode());
        return Map.of("message", "MFA enabled successfully");
    }

    @PostMapping("/mfa/disable")
    public Map<String, String> disableMfa(
            Principal principal,
            @Valid @RequestBody DisableMfaRequest request
    ) {
        UUID userId = UUID.fromString(principal.getName());
        mfaService.disableMfa(userId, request.getCode());
        return Map.of("message", "MFA disabled successfully");
    }
}