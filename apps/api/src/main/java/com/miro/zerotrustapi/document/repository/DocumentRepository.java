package com.miro.zerotrustapi.document.repository;

import com.miro.zerotrustapi.document.entity.Document;
import com.miro.zerotrustapi.user.entity.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByUserOrderByCreatedAtDesc(User user);
    Optional<Document> findByIdAndUser(UUID id, User user);
}