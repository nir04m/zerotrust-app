package com.miro.zerotrustapi.crypto.dto;

public class EncryptionResult {

    private final byte[] encryptedBytes;
    private final String metadataJson;

    public EncryptionResult(byte[] encryptedBytes, String metadataJson) {
        this.encryptedBytes = encryptedBytes;
        this.metadataJson = metadataJson;
    }

    public byte[] getEncryptedBytes() {
        return encryptedBytes;
    }

    public String getMetadataJson() {
        return metadataJson;
    }
}