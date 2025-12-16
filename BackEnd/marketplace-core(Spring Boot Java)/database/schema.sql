-- WasteNot Marketplace Service Database Schema
-- MySQL/MariaDB

-- Create database
CREATE DATABASE IF NOT EXISTS wastenot_marketplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE wastenot_marketplace;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    partner_id BIGINT UNSIGNED NOT NULL,
    partner_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    old_price DECIMAL(10, 2) DEFAULT NULL,
    discount_percent INT DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    expiry_date DATETIME DEFAULT NULL,
    expiry_display VARCHAR(100) DEFAULT NULL,
    pickup_window VARCHAR(100) DEFAULT NULL,
    quantity INT DEFAULT 1,
    status ENUM('ACTIVE', 'SOLD', 'EXPIRED', 'REMOVED') DEFAULT 'ACTIVE',
    views_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_partner_id (partner_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    consumer_id BIGINT UNSIGNED NOT NULL,
    consumer_name VARCHAR(255) DEFAULT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    product_name VARCHAR(255) DEFAULT NULL,
    partner_id BIGINT UNSIGNED DEFAULT NULL,
    partner_name VARCHAR(255) DEFAULT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    payment_status ENUM('PENDING', 'PAID', 'REFUNDED', 'FAILED') DEFAULT 'PENDING',
    payment_method VARCHAR(50) DEFAULT NULL,
    pickup_date DATETIME DEFAULT NULL,
    pickup_location TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_consumer_id (consumer_id),
    INDEX idx_partner_id (partner_id),
    INDEX idx_product_id (product_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    donation_id VARCHAR(50) NOT NULL UNIQUE,
    item_name VARCHAR(255) NOT NULL,
    provider_id BIGINT UNSIGNED NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    expiry_date DATETIME DEFAULT NULL,
    status ENUM('ACTIVE', 'CLAIMED', 'EXPIRED') DEFAULT 'ACTIVE',
    claimed_by_ngo_id BIGINT UNSIGNED DEFAULT NULL,
    claimed_by_ngo_name VARCHAR(255) DEFAULT NULL,
    claimed_at TIMESTAMP NULL DEFAULT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_provider_id (provider_id),
    INDEX idx_donation_id (donation_id),
    INDEX idx_status (status),
    INDEX idx_ngo_id (claimed_by_ngo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample products
INSERT INTO products (name, partner_id, partner_name, price, old_price, discount_percent, category, description, expiry_display, pickup_window, quantity, is_featured) VALUES
('BreadTalk Croissant', 1, 'BreadTalk', 60.00, 120.00, 50, 'breads', 'Buttery croissant, best consumed within 24 hours.', 'Today • 8 PM', '4:00 PM – 7:30 PM', 10, TRUE),
('Goldilocks Cake Slice', 2, 'Goldilocks', 28.00, 45.00, 35, 'breads', 'Moist cake slice, perfect with coffee.', 'Tomorrow • 10 AM', '3:00 PM – 8:00 PM', 15, FALSE),
('Jollibee Chickenjoy Meal', 3, 'Jollibee', 75.00, 150.00, 50, 'meals', '1pc Chickenjoy with rice.', 'Today • 7 PM', '4:00 PM – 6:30 PM', 8, TRUE),
('Stop N Shop Fruit Cup', 4, 'Stop N Shop', 85.00, 120.00, 30, 'drinks', 'Mixed fruits in syrup.', 'Tomorrow • 6 PM', '2:00 PM – 6:00 PM', 20, FALSE);

-- Insert sample donations
INSERT INTO donations (donation_id, item_name, provider_id, provider_name, quantity, status) VALUES
('D1701001', 'Organic Bread Loaves', 1, 'Bakery Delights', '50 units', 'ACTIVE'),
('D1701002', 'Canned Vegetables (Mix)', 2, 'MegaStore', '300 cans', 'ACTIVE'),
('D1701003', 'Fresh Produce Box', 3, 'Local Fresh Market', '20 kg', 'ACTIVE');
