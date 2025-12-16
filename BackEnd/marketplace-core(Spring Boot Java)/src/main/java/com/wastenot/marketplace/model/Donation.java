package com.wastenot.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "donation_id", nullable = false, unique = true)
    private String donationId;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "provider_name", nullable = false)
    private String providerName;

    @Column(nullable = false)
    private String quantity;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationStatus status = DonationStatus.ACTIVE;

    @Column(name = "claimed_by_ngo_id")
    private Long claimedByNgoId;

    @Column(name = "claimed_by_ngo_name")
    private String claimedByNgoName;

    @Column(name = "claimed_at")
    private LocalDateTime claimedAt;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum DonationStatus {
        ACTIVE, CLAIMED, EXPIRED
    }
}
