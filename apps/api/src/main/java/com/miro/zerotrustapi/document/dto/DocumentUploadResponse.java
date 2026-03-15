package com.miro.zerotrustapi.document.dto;

import java.util.UUID;

public class DocumentUploadResponse {

    private UUID documentId;
    private String fileName;
    private String objectKey;
    private long sizeBytes;

    public DocumentUploadResponse(UUID documentId, String fileName, String objectKey, long sizeBytes) {
        this.documentId = documentId;
        this.fileName = fileName;
        this.objectKey = objectKey;
        this.sizeBytes = sizeBytes;
    }

    public UUID getDocumentId() {
        return documentId;
    }

    public String getFileName() {
        return fileName;
    }

    public String getObjectKey() {
        return objectKey;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }
}