package com.wastenot.marketplace.controller;

import com.wastenot.marketplace.model.Order;
import com.wastenot.marketplace.model.Order.OrderStatus;
import com.wastenot.marketplace.model.Product;
import com.wastenot.marketplace.repository.OrderRepository;
import com.wastenot.marketplace.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(order -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", order);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Order not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<Map<String, Object>> getOrderByNumber(@PathVariable String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .map(order -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", order);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Order not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @GetMapping("/consumer/{consumerId}")
    public ResponseEntity<Map<String, Object>> getOrdersByConsumer(@PathVariable Long consumerId) {
        List<Order> orders = orderRepository.findByConsumerIdOrderByCreatedAtDesc(consumerId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", orders);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<Map<String, Object>> getOrdersByPartner(@PathVariable Long partnerId) {
        List<Order> orders = orderRepository.findByPartnerIdOrderByCreatedAtDesc(partnerId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", orders);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(@Valid @RequestBody Order order) {
        // Generate order number
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        
        // Validate product availability
        Product product = productRepository.findById(order.getProductId()).orElse(null);
        if (product == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Product not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        if (product.getQuantity() < order.getQuantity()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Insufficient product quantity");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Update product quantity
        product.setQuantity(product.getQuantity() - order.getQuantity());
        if (product.getQuantity() == 0) {
            product.setStatus(Product.ProductStatus.SOLD);
        }
        productRepository.save(product);

        Order savedOrder = orderRepository.save(order);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order created successfully");
        response.put("data", savedOrder);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
