package com.rentalapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role = UserRole.CUSTOMER;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Column(name = "vendor_document_url", length = 500)
    private String vendorDocumentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 20)
    private VerificationStatus verificationStatus = VerificationStatus.NONE;

    @Column(name = "document_verified_by", length = 36)
    private String documentVerifiedBy;

    @Column(name = "kyc_document_url", length = 500)
    private String kycDocumentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_status", length = 20)
    private KycStatus kycStatus = KycStatus.NONE;

    @Column(name = "kyc_verified_by", length = 36)
    private String kycVerifiedBy;

    @Column(name = "profile_image", length = 500)
    private String profileImage;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum UserRole {
        CUSTOMER, VENDOR, SUPERADMIN
    }

    public enum VerificationStatus {
        NONE, PENDING, APPROVED, REJECTED
    }

    public enum KycStatus {
        NONE, PENDING, APPROVED, REJECTED
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }
}

