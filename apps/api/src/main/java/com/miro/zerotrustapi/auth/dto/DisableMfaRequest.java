package com.miro.zerotrustapi.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class DisableMfaRequest {

    @NotBlank
    private String code;

    public DisableMfaRequest() {}

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}