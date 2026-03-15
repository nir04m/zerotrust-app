package com.miro.zerotrustapi.document.controller;

import com.miro.zerotrustapi.document.dto.DocumentDownloadResponse;
import com.miro.zerotrustapi.document.dto.DocumentResponse;
import com.miro.zerotrustapi.document.dto.DocumentUploadResponse;
import com.miro.zerotrustapi.document.service.DocumentService;
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
            @RequestPart("file") MultipartFile file
    ) {
        UUID userId = UUID.fromString(principal.getName());
        return documentService.uploadDocument(userId, file);
    }

    @GetMapping
    public List<DocumentResponse> getMyDocuments(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return documentService.getMyDocuments(userId);
    }

    @GetMapping("/{documentId}/download")
    public ResponseEntity<byte[]> downloadDocument(
            Principal principal,
            @PathVariable UUID documentId
    ) {
        UUID userId = UUID.fromString(principal.getName());
        DocumentDownloadResponse document = documentService.downloadDocument(userId, documentId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .body(document.getContent());
    }

    @DeleteMapping("/{documentId}")
    public Map<String, String> deleteDocument(
            Principal principal,
            @PathVariable UUID documentId
    ) {
        UUID userId = UUID.fromString(principal.getName());
        return Map.of("message", documentService.deleteDocument(userId, documentId));
    }
}