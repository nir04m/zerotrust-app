package com.miro.zerotrustapi.document.service;

import com.miro.zerotrustapi.audit.service.AuditService;
import com.miro.zerotrustapi.common.util.FileNameSanitizer;
import com.miro.zerotrustapi.document.dto.DocumentDownloadResponse;
import com.miro.zerotrustapi.document.dto.DocumentResponse;
import com.miro.zerotrustapi.document.dto.DocumentUploadResponse;
import com.miro.zerotrustapi.document.entity.Document;
import com.miro.zerotrustapi.document.repository.DocumentRepository;
import com.miro.zerotrustapi.user.entity.User;
import com.miro.zerotrustapi.user.repository.UserRepository;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class DocumentService {

    private final S3Client s3Client;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Value("${storage.s3.bucket}")
    private String bucketName;

    @Value("${file.max-size-bytes}")
    private long maxFileSizeBytes;

    public DocumentService(
            S3Client s3Client,
            DocumentRepository documentRepository,
            UserRepository userRepository,
            AuditService auditService
    ) {
        this.s3Client = s3Client;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public DocumentUploadResponse uploadEncryptedDocument(
            UUID userId,
            MultipartFile file,
            String originalFilename,
            String contentType,
            String encryptionMetadata,
            String ipAddress,
            String userAgent
    ) {
        User user = getUserOrThrow(userId);

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException("File exceeds maximum allowed size");
        }

        if (encryptionMetadata == null || encryptionMetadata.isBlank()) {
            throw new IllegalArgumentException("Encryption metadata is required");
        }

        UUID documentId = UUID.randomUUID();
        String safeFileName = FileNameSanitizer.sanitize(
                originalFilename != null ? originalFilename : "file"
        );
        String objectKey = "documents/" + userId + "/" + documentId + "/" + safeFileName;

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType("application/octet-stream")
                    .build();

            s3Client.putObject(
                    putObjectRequest,
                    RequestBody.fromBytes(file.getBytes())
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload encrypted file", e);
        }

        Document document = new Document();
        document.setId(documentId);
        document.setUser(user);
        document.setOriginalFilename(safeFileName);
        document.setStoredObjectKey(objectKey);
        document.setContentType(contentType);
        document.setSizeBytes(file.getSize());
        document.setEncryptionMetadata(encryptionMetadata);
        document.setCreatedAt(LocalDateTime.now());
        document.setUpdatedAt(LocalDateTime.now());

        documentRepository.save(document);

        auditService.log(
                userId,
                "DOCUMENT_UPLOADED",
                ipAddress,
                userAgent,
                "Uploaded E2EE document: " + safeFileName
        );

        return new DocumentUploadResponse(
                document.getId(),
                document.getOriginalFilename(),
                document.getStoredObjectKey(),
                document.getSizeBytes()
        );
    }

    public List<DocumentResponse> getMyDocuments(UUID userId) {
        User user = getUserOrThrow(userId);

        return documentRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(doc -> new DocumentResponse(
                        doc.getId(),
                        doc.getOriginalFilename(),
                        doc.getContentType(),
                        doc.getSizeBytes(),
                        doc.getCreatedAt()
                ))
                .toList();
    }

    public DocumentDownloadResponse downloadEncryptedDocument(
            UUID userId,
            UUID documentId,
            String ipAddress,
            String userAgent
    ) {
        User user = getUserOrThrow(userId);

        Document document = documentRepository.findByIdAndUser(documentId, user)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(document.getStoredObjectKey())
                .build();

        ResponseBytes<GetObjectResponse> response = s3Client.getObjectAsBytes(getObjectRequest);

        auditService.log(
                userId,
                "DOCUMENT_DOWNLOADED",
                ipAddress,
                userAgent,
                "Downloaded E2EE document: " + document.getOriginalFilename()
        );

        return new DocumentDownloadResponse(
                response.asByteArray(),
                document.getOriginalFilename(),
                document.getContentType() != null ? document.getContentType() : "application/octet-stream"
        );
    }

    public String deleteDocument(
            UUID userId,
            UUID documentId,
            String ipAddress,
            String userAgent
    ) {
        User user = getUserOrThrow(userId);

        Document document = documentRepository.findByIdAndUser(documentId, user)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(document.getStoredObjectKey())
                .build();

        s3Client.deleteObject(deleteObjectRequest);
        documentRepository.delete(document);

        auditService.log(
                userId,
                "DOCUMENT_DELETED",
                ipAddress,
                userAgent,
                "Deleted document: " + document.getOriginalFilename()
        );

        return "Document deleted successfully";
    }

    public String getEncryptionMetadata(UUID userId, UUID documentId) {
        User user = getUserOrThrow(userId);

        Document document = documentRepository.findByIdAndUser(documentId, user)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        return document.getEncryptionMetadata();
    }

    private User getUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}