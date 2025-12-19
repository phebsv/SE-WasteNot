package com.wastenot.marketplace.controller;

import com.wastenot.marketplace.model.Product;
import com.wastenot.marketplace.model.Product.ProductStatus;
import com.wastenot.marketplace.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts() {
        List<Product> products = productRepository.findByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE);
        // Calculate dynamic discounts based on expiry date
        products.forEach(Product::calculateDynamicDiscount);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", products);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    // Calculate dynamic discount
                    product.calculateDynamicDiscount();
                    // Increment view count
                    product.setViewsCount(product.getViewsCount() + 1);
                    productRepository.save(product);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", product);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Product not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<Map<String, Object>> getProductsByCategory(@PathVariable String category) {
        List<Product> products = productRepository.findByCategoryAndStatus(category, ProductStatus.ACTIVE);
        products.forEach(Product::calculateDynamicDiscount);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", products);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<Map<String, Object>> getProductsByPartner(@PathVariable Long partnerId) {
        List<Product> products = productRepository.findByPartnerIdAndStatus(partnerId, ProductStatus.ACTIVE);
        products.forEach(Product::calculateDynamicDiscount);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", products);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/featured")
    public ResponseEntity<Map<String, Object>> getFeaturedProducts() {
        List<Product> products = productRepository.findFeaturedProducts();
        products.forEach(Product::calculateDynamicDiscount);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", products);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchProducts(@RequestParam String keyword) {
        List<Product> products = productRepository.searchProducts(keyword);
        products.forEach(Product::calculateDynamicDiscount);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", products);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createProduct(@Valid @RequestBody Product product) {
        Product savedProduct = productRepository.save(product);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Product created successfully");
        response.put("data", savedProduct);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateProduct(@PathVariable Long id, @Valid @RequestBody Product productDetails) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(productDetails.getName());
                    product.setPrice(productDetails.getPrice());
                    product.setOldPrice(productDetails.getOldPrice());
                    product.setDiscountPercent(productDetails.getDiscountPercent());
                    product.setCategory(productDetails.getCategory());
                    product.setDescription(productDetails.getDescription());
                    product.setImageUrl(productDetails.getImageUrl());
                    product.setExpiryDate(productDetails.getExpiryDate());
                    product.setExpiryDisplay(productDetails.getExpiryDisplay());
                    product.setPickupWindow(productDetails.getPickupWindow());
                    product.setQuantity(productDetails.getQuantity());
                    product.setIsFeatured(productDetails.getIsFeatured());

                    Product updatedProduct = productRepository.save(product);
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Product updated successfully");
                    response.put("data", updatedProduct);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Product not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setStatus(ProductStatus.REMOVED);
                    productRepository.save(product);
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Product removed successfully");
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Product not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }
}
