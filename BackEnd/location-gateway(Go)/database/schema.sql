-- WasteNot Location Service Database Schema
-- MySQL/MariaDB

-- Create database
CREATE DATABASE IF NOT EXISTS wastenot_location CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE wastenot_location;

-- User locations table
CREATE TABLE IF NOT EXISTS user_locations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_coordinates (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Provider locations table
CREATE TABLE IF NOT EXISTS provider_locations (
    provider_id BIGINT UNSIGNED PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    business_hours VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_coordinates (latitude, longitude),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Location history table (for tracking user movement)
CREATE TABLE IF NOT EXISTS location_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample provider locations (Philippines-based)
INSERT INTO provider_locations (provider_id, name, latitude, longitude, address, is_active, business_hours) VALUES
(1, 'BreadTalk Manila', 14.599512, 120.984222, 'SM Mall of Asia, Pasay City', TRUE, '10:00 AM - 9:00 PM'),
(2, 'Goldilocks Makati', 14.554729, 121.024445, 'Greenbelt 1, Makati City', TRUE, '8:00 AM - 8:00 PM'),
(3, 'Stop N Shop QC', 14.676041, 121.043701, 'Quezon Avenue, Quezon City', TRUE, '24 hours'),
(4, 'Jollibee BGC', 14.551890, 121.047344, 'Bonifacio Global City, Taguig', TRUE, '7:00 AM - 11:00 PM'),
(5, 'SM Supermarket Manila', 14.599512, 120.984222, 'SM City Manila', TRUE, '10:00 AM - 10:00 PM');

-- Insert sample user locations
INSERT INTO user_locations (user_id, latitude, longitude, address) VALUES
(1, 14.599512, 120.984222, 'Pasay City, Metro Manila'),
(2, 14.554729, 121.024445, 'Makati City, Metro Manila'),
(3, 14.676041, 121.043701, 'Quezon City, Metro Manila');
