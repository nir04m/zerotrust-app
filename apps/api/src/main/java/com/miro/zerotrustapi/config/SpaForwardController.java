package com.miro.zerotrustapi.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping(value = {
            "/",
            "/login",
            "/register",
            "/mfa-login",
            "/dashboard",
            "/documents",
            "/audit",
            "/settings"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}