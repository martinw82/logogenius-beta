-- LogoGenius Database Schema Migration
-- Run this SQL in TiDB Cloud console to set up your empty database

-- Use the test database
USE test;

-- ============================================
-- Table: BrandArchetype
-- Predefined brand personality types
-- ============================================
CREATE TABLE IF NOT EXISTS `BrandArchetype` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `traits` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `BrandArchetype_name_key` (`name`),
  KEY `BrandArchetype_name_idx` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: Order
-- Master orders table
-- ============================================
CREATE TABLE IF NOT EXISTS `Order` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tier` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
  `customerEmail` VARCHAR(191) NULL,
  `selectedLogoId` INT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Order_status_idx` (`status`),
  KEY `Order_tier_idx` (`tier`),
  KEY `Order_customerEmail_idx` (`customerEmail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: OrderDetail
-- Flexible key-value storage for order data
-- ============================================
CREATE TABLE IF NOT EXISTS `OrderDetail` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `orderId` INT NOT NULL,
  `fieldName` VARCHAR(191) NOT NULL,
  `fieldValue` LONGTEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `OrderDetail_orderId_fieldName_key` (`orderId`, `fieldName`),
  KEY `OrderDetail_orderId_idx` (`orderId`),
  KEY `OrderDetail_fieldName_idx` (`fieldName`),
  CONSTRAINT `OrderDetail_orderId_fkey` 
    FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: AdminSession
-- JWT token management for admin auth
-- ============================================
CREATE TABLE IF NOT EXISTS `AdminSession` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `adminId` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `AdminSession_token_key` (`token`),
  KEY `AdminSession_adminId_idx` (`adminId`),
  KEY `AdminSession_token_idx` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: LogoVariant
-- Generated logo variants
-- ============================================
CREATE TABLE IF NOT EXISTS `LogoVariant` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `orderId` INT NOT NULL,
  `variantNum` INT NOT NULL,
  `svgData` LONGTEXT NOT NULL,
  `svgPath` VARCHAR(191) NULL,
  `selected` BOOLEAN NOT NULL DEFAULT false,
  `mockupPaths` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `LogoVariant_orderId_variantNum_key` (`orderId`, `variantNum`),
  KEY `LogoVariant_orderId_idx` (`orderId`),
  KEY `LogoVariant_variantNum_idx` (`variantNum`),
  CONSTRAINT `LogoVariant_orderId_fkey` 
    FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Seed Data: Brand Archetypes
-- ============================================
INSERT INTO `BrandArchetype` (`name`, `description`, `traits`, `createdAt`, `updatedAt`) VALUES
('The Innocent', 'Values safety, optimism, and simplicity. Seeks to be happy and spread happiness.', '["Optimistic", "Simple", "Honest", "Happy"]', NOW(), NOW()),
('The Everyman', 'Belongs to everyone, wants to connect with others. Values equality and community.', '["Relatable", "Humble", "Friendly", "Authentic"]', NOW(), NOW()),
('The Hero', 'Overcomes obstacles and proves worth through courageous acts. Values mastery and achievement.', '["Brave", "Determined", "Competent", "Inspiring"]', NOW(), NOW()),
('The Outlaw', 'Rules are made to be broken. Values revolution and disruption.', '["Rebellious", "Disruptive", "Free", "Revolutionary"]', NOW(), NOW()),
('The Explorer', 'Finds fulfillment through discovery and new experiences. Values freedom and authenticity.', '["Adventurous", "Curious", "Independent", "Pioneering"]', NOW(), NOW()),
('The Creator', 'Creates things of enduring value. Values imagination and innovation.', '["Innovative", "Imaginative", "Visionary", "Artistic"]', NOW(), NOW()),
('The Ruler', 'Exerts control and creates prosperity. Values power and leadership.', '["Leader", "Responsible", "Organized", "Authoritative"]', NOW(), NOW()),
('The Magician', 'Makes dreams come true. Values knowledge and transformation.', '["Charismatic", "Transformative", "Knowledgeable", "Visionary"]', NOW(), NOW()),
('The Lover', 'Creates intimate moments and inspires love. Values passion and pleasure.', '["Passionate", "Sensual", "Intimate", "Romantic"]', NOW(), NOW()),
('The Caregiver', 'Protects and cares for others. Values compassion and service.', '["Compassionate", "Nurturing", "Generous", "Protective"]', NOW(), NOW()),
('The Jester', 'Brings joy to the world through fun and humor. Values enjoyment and spontaneity.', '["Playful", "Humorous", "Spontaneous", "Optimistic"]', NOW(), NOW()),
('The Sage', 'Uses intelligence and analysis to understand the world. Values truth and knowledge.', '["Wise", "Knowledgeable", "Analytical", "Thoughtful"]', NOW(), NOW());

-- ============================================
-- Verification
-- ============================================
SELECT 'Tables created:' as message;
SHOW TABLES;

SELECT 'Brand Archetypes seeded:' as message;
SELECT COUNT(*) as count FROM BrandArchetype;
