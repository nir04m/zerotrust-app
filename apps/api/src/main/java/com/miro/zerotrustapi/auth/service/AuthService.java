package com.miro.zerotrustapi.auth.service;

import com.miro.zerotrustapi.auth.dto.AuthResponse;
import com.miro.zerotrustapi.auth.dto.LoginRequest;
import com.miro.zerotrustapi.auth.dto.LoginResponse;
import com.miro.zerotrustapi.auth.dto.MfaLoginRequest;
import com.miro.zerotrustapi.auth.dto.RefreshTokenRequest;
import com.miro.zerotrustapi.auth.dto.RegisterRequest;
import com.miro.zerotrustapi.auth.entity.RefreshToken;
import com.miro.zerotrustapi.user.entity.User;
import com.miro.zerotrustapi.user.enums.Role;
import com.miro.zerotrustapi.user.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final MfaService mfaService;
    private final MfaChallengeService mfaChallengeService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            MfaService mfaService,
            MfaChallengeService mfaChallengeService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.mfaService = mfaService;
        this.mfaChallengeService = mfaChallengeService;
    }

    public String register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setMfaEnabled(false);
        user.setRole(Role.USER);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        return "User registered successfully";
    }

    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (user.isMfaEnabled()) {
            String mfaToken = mfaChallengeService.createChallenge(user.getId());
            return new LoginResponse(true, null, null, mfaToken);
        }

        String accessToken = jwtService.generateAccessToken(user.getId());
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return new LoginResponse(false, accessToken, refreshToken, null);
    }

    public AuthResponse loginWithMfa(MfaLoginRequest request) {
        UUID userId = mfaChallengeService.validateAndConsume(request.getMfaToken());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isMfaEnabled()) {
            throw new IllegalArgumentException("MFA is not enabled for this account");
        }

        if (!mfaService.verifyCode(user, request.getCode())) {
            throw new IllegalArgumentException("Invalid MFA code");
        }

        String accessToken = jwtService.generateAccessToken(user.getId());
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenService.findValidToken(request.getRefreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired refresh token"));

        User user = storedToken.getUser();

        refreshTokenService.revokeToken(request.getRefreshToken());

        String newAccessToken = jwtService.generateAccessToken(user.getId());
        String newRefreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(newAccessToken, newRefreshToken);
    }

    public String logout(String refreshToken) {
        refreshTokenService.revokeToken(refreshToken);
        return "Logged out successfully";
    }
}