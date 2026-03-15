package com.miro.zerotrustapi.audit.service;

import com.miro.zerotrustapi.audit.entity.AuditLog;
import com.miro.zerotrustapi.audit.repository.AuditLogRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(UUID userId, String action, String ipAddress, String userAgent, String details) {
        AuditLog log = new AuditLog();
        log.setId(UUID.randomUUID());
        log.setUserId(userId);
        log.setAction(action);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setDetails(details);
        log.setCreatedAt(LocalDateTime.now());

        auditLogRepository.save(log);
    }
}