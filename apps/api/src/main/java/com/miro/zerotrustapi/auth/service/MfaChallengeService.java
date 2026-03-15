package com.miro.zerotrustapi.auth.service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MfaChallengeService {

    private static class ChallengeEntry {
        private final UUID userId;
        private final Instant expiresAt;

        private ChallengeEntry(UUID userId, Instant expiresAt) {
            this.userId = userId;
            this.expiresAt = expiresAt;
        }
    }

    private final Map<String, ChallengeEntry> challenges = new ConcurrentHashMap<>();

    @Value("${mfa.challenge.expiration:300000}")
    private long challengeExpirationMs;

    public String createChallenge(UUID userId) {
        String token = UUID.randomUUID().toString() + "." + UUID.randomUUID();
        Instant expiresAt = Instant.now().plusMillis(challengeExpirationMs);
        challenges.put(token, new ChallengeEntry(userId, expiresAt));
        return token;
    }

    public UUID validateAndConsume(String token) {
        ChallengeEntry entry = challenges.remove(token);

        if (entry == null) {
            throw new IllegalArgumentException("Invalid MFA challenge");
        }

        if (Instant.now().isAfter(entry.expiresAt)) {
            throw new IllegalArgumentException("MFA challenge expired");
        }

        return entry.userId;
    }
}