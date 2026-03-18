package com.miro.zerotrustapi.document.dto;

public class EncryptedUploadMetadata {

    private String originalFilename;
    private String contentType;
    private String encryptionMetadata;

    public EncryptedUploadMetadata() {}

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getEncryptionMetadata() {
        return encryptionMetadata;
    }

    public void setEncryptionMetadata(String encryptionMetadata) {
        this.encryptionMetadata = encryptionMetadata;
    }
}