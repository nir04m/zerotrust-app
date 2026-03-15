package com.miro.zerotrustapi.common.controller;

import java.security.Principal;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test/secure")
    public Map<String, String> secure(Principal principal) {
        return Map.of(
                "message", "You accessed a protected route",
                "principal", principal.getName()
        );
    }
}