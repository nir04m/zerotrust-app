package com.miro.zerotrustapi.crypto.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.miro.zerotrustapi.crypto.dto.EncryptionResult;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class DocumentEncryptionService {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int IV_LENGTH_BYTES = 12;
    private static final int TAG_LENGTH_BITS = 128;

    @Value("${crypto.document-key}")
    private String documentEncryptionKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private SecretKeySpec secretKeySpec;

    @PostConstruct
    public void init() {
        byte[] keyBytes = documentEncryptionKey.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length != 32) {
            throw new IllegalStateException("DOCUMENT_ENCRYPTION_KEY must be exactly 32 bytes for AES-256");
        }

        this.secretKeySpec = new SecretKeySpec(keyBytes, ALGORITHM);
    }

    public EncryptionResult encrypt(byte[] plainBytes) {
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec, gcmSpec);

            byte[] encryptedBytes = cipher.doFinal(plainBytes);

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("algorithm", "AES-256-GCM");
            metadata.put("iv", Base64.getEncoder().encodeToString(iv));
            metadata.put("tagLengthBits", TAG_LENGTH_BITS);

            String metadataJson = objectMapper.writeValueAsString(metadata);

            return new EncryptionResult(encryptedBytes, metadataJson);
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt document", e);
        }
    }

    public byte[] decrypt(byte[] encryptedBytes, String metadataJson) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> metadata = objectMapper.readValue(metadataJson, Map.class);

            String ivBase64 = (String) metadata.get("iv");
            byte[] iv = Base64.getDecoder().decode(ivBase64);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, gcmSpec);

            return cipher.doFinal(encryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decrypt document", e);
        }
    }
}