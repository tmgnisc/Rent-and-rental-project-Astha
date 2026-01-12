package com.rentalapp.repository;

import com.rentalapp.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {
    
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
    
    List<PasswordResetToken> findByUserId(String userId);
    
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}

