package com.miro.zerotrustapi.auth.controller;

import com.miro.zerotrustapi.auth.dto.AuthResponse;
import com.miro.zerotrustapi.auth.dto.LoginRequest;
import com.miro.zerotrustapi.auth.dto.RegisterRequest;
import com.miro.zerotrustapi.auth.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> register(@Valid @RequestBody RegisterRequest request) {
        return Map.of("message", authService.register(request));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request);
        return new AuthResponse(token);
    }
}