package com.wastenot.marketplace.repository;

import com.wastenot.marketplace.model.Order;
import com.wastenot.marketplace.model.Order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByConsumerIdOrderByCreatedAtDesc(Long consumerId);

    List<Order> findByPartnerIdOrderByCreatedAtDesc(Long partnerId);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByConsumerIdAndStatus(Long consumerId, OrderStatus status);

    Long countByStatus(OrderStatus status);

    Long countByConsumerId(Long consumerId);
}
