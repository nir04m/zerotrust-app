package com.miro.zerotrustapi.auth.dto;

public class LoginResponse {

    private boolean mfaRequired;
    private String accessToken;
    private String refreshToken;
    private String mfaToken;

    public LoginResponse(boolean mfaRequired, String accessToken, String refreshToken, String mfaToken) {
        this.mfaRequired = mfaRequired;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.mfaToken = mfaToken;
    }

    public boolean isMfaRequired() {
        return mfaRequired;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getMfaToken() {
        return mfaToken;
    }
}