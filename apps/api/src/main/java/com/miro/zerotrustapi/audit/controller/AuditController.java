package com.miro.zerotrustapi.audit.controller;

import com.miro.zerotrustapi.audit.dto.AuditLogResponse;
import com.miro.zerotrustapi.audit.repository.AuditLogRepository;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    public AuditController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/me")
    public List<AuditLogResponse> getMyAuditLogs(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());

        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(log -> new AuditLogResponse(
                        log.getId(),
                        log.getAction(),
                        log.getIpAddress(),
                        log.getUserAgent(),
                        log.getDetails(),
                        log.getCreatedAt()
                ))
                .toList();
    }
}