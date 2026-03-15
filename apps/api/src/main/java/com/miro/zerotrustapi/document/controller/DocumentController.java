package com.miro.zerotrustapi.document.controller;

import com.miro.zerotrustapi.document.dto.DocumentDownloadResponse;
import com.miro.zerotrustapi.document.dto.DocumentResponse;
import com.miro.zerotrustapi.document.dto.DocumentUploadResponse;
import com.miro.zerotrustapi.document.service.DocumentService;
import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentUploadResponse uploadDocument(
            Principal principal,
            @RequestPart("file") MultipartFile file,
            HttpServletRequest request
    ) {
        UUID userId = UUID.fromString(principal.getName());
        return documentService.uploadDocument(
                userId,
                file,
                getClientIp(request),
                request.getHeader("User-Agent")
        );
    }

    @GetMapping
    public List<DocumentResponse> getMyDocuments(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return documentService.getMyDocuments(userId);
    }

    @GetMapping("/{documentId}/download")
    public ResponseEntity<byte[]> downloadDocument(
            Principal principal,
            @PathVariable UUID documentId,
            HttpServletRequest request
    ) {
        UUID userId = UUID.fromString(principal.getName());

        DocumentDownloadResponse document = documentService.downloadDocument(
                userId,
                documentId,
                getClientIp(request),
                request.getHeader("User-Agent")
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .header("X-Content-Type-Options", "nosniff")
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .body(document.getContent());
    }

    @DeleteMapping("/{documentId}")
    public Map<String, String> deleteDocument(
            Principal principal,
            @PathVariable UUID documentId,
            HttpServletRequest request
    ) {
        UUID userId = UUID.fromString(principal.getName());
        return Map.of(
                "message",
                documentService.deleteDocument(
                        userId,
                        documentId,
                        getClientIp(request),
                        request.getHeader("User-Agent")
                )
        );
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}