package com.rentalapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rentals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Rental {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "product_id", nullable = false, length = 36)
    private String productId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RentalStatus status = RentalStatus.PENDING;

    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "payment_intent_id", length = 255)
    private String paymentIntentId;

    @Column(name = "delivery_address", nullable = false)
    private String deliveryAddress;

    @Column(name = "contact_phone", length = 20, nullable = false)
    private String contactPhone;

    @Column(name = "delivery_latitude", precision = 10, scale = 8)
    private BigDecimal deliveryLatitude;

    @Column(name = "delivery_longitude", precision = 11, scale = 8)
    private BigDecimal deliveryLongitude;

    @Column(name = "delivery_location_address", columnDefinition = "TEXT")
    private String deliveryLocationAddress;

    @Column(name = "handed_over_at")
    private LocalDateTime handedOverAt;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;

    @Column(name = "fine_amount", precision = 10, scale = 2)
    private BigDecimal fineAmount = BigDecimal.ZERO;

    @Column(name = "daily_fine", precision = 10, scale = 2)
    private BigDecimal dailyFine = new BigDecimal("100.00");

    @Column(name = "return_request_note", columnDefinition = "TEXT")
    private String returnRequestNote;

    @Column(name = "return_request_image", length = 500)
    private String returnRequestImage;

    @Column(name = "return_requested_at")
    private LocalDateTime returnRequestedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "return_request_status", length = 20)
    private ReturnRequestStatus returnRequestStatus = ReturnRequestStatus.NONE;

    @Column(name = "return_rejection_reason", length = 150)
    private String returnRejectionReason;

    @Column(name = "return_rejection_note", columnDefinition = "TEXT")
    private String returnRejectionNote;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum RentalStatus {
        PENDING, ACTIVE, COMPLETED, CANCELLED
    }

    public enum ReturnRequestStatus {
        NONE, PENDING, APPROVED, REJECTED
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }
}

