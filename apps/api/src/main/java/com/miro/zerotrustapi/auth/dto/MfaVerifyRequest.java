package com.miro.zerotrustapi.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class MfaVerifyRequest {

    @NotBlank
    private String code;

    public MfaVerifyRequest() {}

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}