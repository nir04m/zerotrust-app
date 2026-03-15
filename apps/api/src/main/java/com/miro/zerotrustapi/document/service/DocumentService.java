package com.miro.zerotrustapi.document.service;

import com.miro.zerotrustapi.audit.service.AuditService;
import com.miro.zerotrustapi.common.util.FileNameSanitizer;
import com.miro.zerotrustapi.crypto.dto.EncryptionResult;
import com.miro.zerotrustapi.crypto.service.DocumentEncryptionService;
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
    private final DocumentEncryptionService documentEncryptionService;

    @Value("${storage.s3.bucket}")
    private String bucketName;

    @Value("${file.max-size-bytes}")
    private long maxFileSizeBytes;

    public DocumentService(
            S3Client s3Client,
            DocumentRepository documentRepository,
            UserRepository userRepository,
            AuditService auditService,
            DocumentEncryptionService documentEncryptionService
    ) {
        this.s3Client = s3Client;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.documentEncryptionService = documentEncryptionService;
    }

    public DocumentUploadResponse uploadDocument(UUID userId, MultipartFile file) {
        User user = getUserOrThrow(userId);

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException("File exceeds maximum allowed size");
        }

        UUID documentId = UUID.randomUUID();
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String safeFileName = FileNameSanitizer.sanitize(originalFilename);
        String objectKey = "documents/" + userId + "/" + documentId + "/" + safeFileName;

        EncryptionResult encryptionResult;

        try {
            encryptionResult = documentEncryptionService.encrypt(file.getBytes());

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType("application/octet-stream")
                    .build();

            s3Client.putObject(
                    putObjectRequest,
                    RequestBody.fromBytes(encryptionResult.getEncryptedBytes())
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }

        Document document = new Document();
        document.setId(documentId);
        document.setUser(user);
        document.setOriginalFilename(safeFileName);
        document.setStoredObjectKey(objectKey);
        document.setContentType(file.getContentType());
        document.setSizeBytes(file.getSize());
        document.setEncryptionMetadata(encryptionResult.getMetadataJson());
        document.setCreatedAt(LocalDateTime.now());
        document.setUpdatedAt(LocalDateTime.now());

        documentRepository.save(document);

        auditService.log(
                userId,
                "DOCUMENT_UPLOADED",
                null,
                null,
                "Uploaded encrypted document: " + safeFileName
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

    public DocumentDownloadResponse downloadDocument(UUID userId, UUID documentId) {
        User user = getUserOrThrow(userId);

        Document document = documentRepository.findByIdAndUser(documentId, user)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(document.getStoredObjectKey())
                .build();

        ResponseBytes<GetObjectResponse> response = s3Client.getObjectAsBytes(getObjectRequest);

        byte[] decryptedBytes = documentEncryptionService.decrypt(
                response.asByteArray(),
                document.getEncryptionMetadata()
        );

        String contentType = document.getContentType() != null && !document.getContentType().isBlank()
                ? document.getContentType()
                : "application/octet-stream";

        auditService.log(
                userId,
                "DOCUMENT_DOWNLOADED",
                null,
                null,
                "Downloaded encrypted document: " + document.getOriginalFilename()
        );

        return new DocumentDownloadResponse(
                decryptedBytes,
                document.getOriginalFilename(),
                contentType
        );
    }

    public String deleteDocument(UUID userId, UUID documentId) {
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
                null,
                null,
                "Deleted encrypted document: " + document.getOriginalFilename()
        );

        return "Document deleted successfully";
    }

    private User getUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}