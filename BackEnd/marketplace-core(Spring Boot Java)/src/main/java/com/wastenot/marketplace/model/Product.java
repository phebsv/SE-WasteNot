package com.wastenot.marketplace.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "old_price", precision = 10, scale = 2)
    private BigDecimal oldPrice;

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

    public enum ProductStatus {
        ACTIVE, SOLD, EXPIRED, REMOVED
    }
}
