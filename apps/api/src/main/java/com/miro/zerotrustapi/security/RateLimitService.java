package com.miro.zerotrustapi.security;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class RateLimitService {

    private static class RateLimitEntry {
        private int count;
        private Instant windowStart;

        private RateLimitEntry(int count, Instant windowStart) {
            this.count = count;
            this.windowStart = windowStart;
        }
    }

    private final Map<String, RateLimitEntry> attempts = new ConcurrentHashMap<>();

    public synchronized boolean isAllowed(String key, int maxAttempts, int windowSeconds) {
        Instant now = Instant.now();
        RateLimitEntry entry = attempts.get(key);

        if (entry == null) {
            attempts.put(key, new RateLimitEntry(1, now));
            return true;
        }

        if (now.isAfter(entry.windowStart.plusSeconds(windowSeconds))) {
            entry.count = 1;
            entry.windowStart = now;
            return true;
        }

        if (entry.count >= maxAttempts) {
            return false;
        }

        entry.count++;
        return true;
    }

    public synchronized void clear(String key) {
        attempts.remove(key);
    }
}