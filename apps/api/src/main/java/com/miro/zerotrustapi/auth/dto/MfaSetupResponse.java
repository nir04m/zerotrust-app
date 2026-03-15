package com.miro.zerotrustapi.auth.dto;

public class MfaSetupResponse {

    private String secret;
    private String qrCodeImageUri;

    public MfaSetupResponse(String secret, String qrCodeImageUri) {
        this.secret = secret;
        this.qrCodeImageUri = qrCodeImageUri;
    }

    public String getSecret() {
        return secret;
    }

    public String getQrCodeImageUri() {
        return qrCodeImageUri;
    }
}