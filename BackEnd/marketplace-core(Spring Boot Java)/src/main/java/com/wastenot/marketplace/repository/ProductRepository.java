package com.wastenot.marketplace.repository;

import com.wastenot.marketplace.model.Product;
import com.wastenot.marketplace.model.Product.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByStatus(ProductStatus status);

    List<Product> findByCategory(String category);

    List<Product> findByPartnerIdAndStatus(Long partnerId, ProductStatus status);

    List<Product> findByStatusOrderByCreatedAtDesc(ProductStatus status);

    @Query("SELECT p FROM Product p WHERE p.status = :status AND p.category = :category ORDER BY p.createdAt DESC")
    List<Product> findByCategoryAndStatus(@Param("category") String category, @Param("status") ProductStatus status);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND p.isFeatured = true ORDER BY p.createdAt DESC")
    List<Product> findFeaturedProducts();

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.partnerName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Product> searchProducts(@Param("keyword") String keyword);
}
