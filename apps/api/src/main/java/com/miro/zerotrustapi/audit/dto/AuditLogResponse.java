package com.miro.zerotrustapi.audit.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class AuditLogResponse {

    private UUID id;
    private String action;
    private String ipAddress;
    private String userAgent;
    private String details;
    private LocalDateTime createdAt;

    public AuditLogResponse(UUID id, String action, String ipAddress, String userAgent, String details, LocalDateTime createdAt) {
        this.id = id;
        this.action = action;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.details = details;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getAction() {
        return action;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public String getDetails() {
        return details;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}