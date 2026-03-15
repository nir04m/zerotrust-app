package com.miro.zerotrustapi.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class MfaLoginRequest {

    @NotBlank
    private String mfaToken;

    @NotBlank
    private String code;

    public MfaLoginRequest() {}

    public String getMfaToken() {
        return mfaToken;
    }

    public void setMfaToken(String mfaToken) {
        this.mfaToken = mfaToken;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}