package com.miro.zerotrustapi.auth.repository;

import com.miro.zerotrustapi.auth.entity.RefreshToken;
import com.miro.zerotrustapi.user.entity.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    List<RefreshToken> findByUserAndRevokedFalse(User user);
}