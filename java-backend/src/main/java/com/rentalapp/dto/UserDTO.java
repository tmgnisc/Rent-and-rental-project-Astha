package com.rentalapp.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private String id;
    private String name;
    private String email;
    private String role;
    private Boolean isVerified;
    private String vendorDocumentUrl;
    private String verificationStatus;
    private String documentVerifiedBy;
    private String kycDocumentUrl;
    private String kycStatus;
    private String kycVerifiedBy;
    private String profileImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

