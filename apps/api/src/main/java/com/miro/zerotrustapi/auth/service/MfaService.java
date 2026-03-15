package com.miro.zerotrustapi.auth.service;

import static dev.samstevens.totp.util.Utils.getDataUriForImage;

import com.miro.zerotrustapi.auth.dto.MfaSetupResponse;
import com.miro.zerotrustapi.user.entity.User;
import com.miro.zerotrustapi.user.repository.UserRepository;
import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class MfaService {

    private final UserRepository userRepository;

    public MfaService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public MfaSetupResponse setupMfa(UUID userId, String email) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        SecretGenerator secretGenerator = new DefaultSecretGenerator();
        String secret = secretGenerator.generate();

        user.setMfaSecret(secret);
        userRepository.save(user);

        QrData data = new QrData.Builder()
                .label(email)
                .secret(secret)
                .issuer("ZeroTrustVault")
                .build();

        try {
            QrGenerator generator = new ZxingPngQrGenerator();
            byte[] imageData = generator.generate(data);
            String mimeType = generator.getImageMimeType();
            String qrCodeImageUri = getDataUriForImage(imageData, mimeType);

            return new MfaSetupResponse(secret, qrCodeImageUri);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate MFA QR code", e);
        }
    }

    public boolean verifyCode(User user, String code) {
        CodeGenerator codeGenerator = new DefaultCodeGenerator();
        CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, new SystemTimeProvider());
        return verifier.isValidCode(user.getMfaSecret(), code);
    }

    public void enableMfa(UUID userId, String code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getMfaSecret() == null || user.getMfaSecret().isBlank()) {
            throw new IllegalArgumentException("MFA is not set up");
        }

        if (!verifyCode(user, code)) {
            throw new IllegalArgumentException("Invalid MFA code");
        }

        user.setMfaEnabled(true);
        userRepository.save(user);
    }

    public void disableMfa(UUID userId, String code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isMfaEnabled()) {
            throw new IllegalArgumentException("MFA is not enabled");
        }

        if (user.getMfaSecret() == null || user.getMfaSecret().isBlank()) {
            throw new IllegalArgumentException("MFA secret is missing");
        }

        if (!verifyCode(user, code)) {
            throw new IllegalArgumentException("Invalid MFA code");
        }

        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        userRepository.save(user);
    }
}