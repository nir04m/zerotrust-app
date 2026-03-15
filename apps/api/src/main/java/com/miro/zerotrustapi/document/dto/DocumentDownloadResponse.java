package com.miro.zerotrustapi.document.dto;

public class DocumentDownloadResponse {

    private byte[] content;
    private String fileName;
    private String contentType;

    public DocumentDownloadResponse(byte[] content, String fileName, String contentType) {
        this.content = content;
        this.fileName = fileName;
        this.contentType = contentType;
    }

    public byte[] getContent() {
        return content;
    }

    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }
}