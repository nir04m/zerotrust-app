package com.miro.zerotrustapi.document.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class DocumentResponse {

    private UUID id;
    private String originalFilename;
    private String contentType;
    private long sizeBytes;
    private LocalDateTime createdAt;

    public DocumentResponse(UUID id, String originalFilename, String contentType, long sizeBytes, LocalDateTime createdAt) {
        this.id = id;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public String getContentType() {
        return contentType;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}