package com.wastenot.marketplace.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Column(nullable = false)
    private String name;

    @Column(name = "partner_id", nullable = false)
    private Long partnerId;

    @NotBlank(message = "Partner name is required")
    @Column(name = "partner_name", nullable = false)
    private String partnerName;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "old_price", precision = 10, scale = 2)
    private BigDecimal oldPrice;

    @Column(name = "listing_type")
    private String listingType;

    @Min(0)
    @Max(100)
    @Column(name = "discount_percent")
    private Integer discountPercent;

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "expiry_display")
    private String expiryDisplay;

    @Column(name = "pickup_window")
    private String pickupWindow;

    @Column(name = "pickup_address")
    private String pickupAddress;

    @Column(name = "pickup_city")
    private String pickupCity;

    @Column(name = "pickup_coordinates")
    private String pickupCoordinates;

    @Min(0)
    @Column(nullable = false)
    private Integer quantity = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(name = "views_count")
    private Integer viewsCount = 0;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public enum ProductStatus {
        ACTIVE, SOLD, EXPIRED, REMOVED
    }

    /**
     * Calculate dynamic discount based on expiry date and quantity
     * More urgent discounts for items expiring sooner
     */
    @Transient
    public void calculateDynamicDiscount() {
        if (expiryDate == null) return;
        
        long daysUntilExpiry = java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), expiryDate);
        
        // Higher discount for items expiring soon
        if (daysUntilExpiry <= 1) {
            this.discountPercent = 70; // 70% off - expires today/tomorrow
        } else if (daysUntilExpiry <= 2) {
            this.discountPercent = 50; // 50% off - expires in 2 days
        } else if (daysUntilExpiry <= 3) {
            this.discountPercent = 35; // 35% off - expires in 3 days
        } else if (daysUntilExpiry <= 7) {
            this.discountPercent = 25; // 25% off - expires in a week
        } else {
            // For items with longer shelf life, use minimal discount
            int current = this.discountPercent == null ? 0 : this.discountPercent;
            this.discountPercent = Math.max(10, current); // At least 10%
        }
    }

    /**
     * Get discounted price based on discount percentage
     */
    @Transient
    public BigDecimal getDiscountedPrice() {
        if (discountPercent == null || discountPercent == 0) {
            return price;
        }
        BigDecimal discountAmount = price.multiply(BigDecimal.valueOf(discountPercent)).divide(BigDecimal.valueOf(100));
        return price.subtract(discountAmount);
    }
}
