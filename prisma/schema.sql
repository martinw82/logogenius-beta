-- LogoGenius Database Schema
-- Run this SQL to create all required tables

-- Brand Archetypes table
CREATE TABLE IF NOT EXISTS brand_archetypes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  traits TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tier VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  customer_email VARCHAR(255),
  selected_logo_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_tier (tier),
  INDEX idx_customer_email (customer_email)
);

-- Order Details table (key-value store for flexible fields)
CREATE TABLE IF NOT EXISTS order_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  field_name VARCHAR(255) NOT NULL,
  field_value LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_field_name (field_name),
  UNIQUE KEY unique_order_field (order_id, field_name)
);

-- Logo Variants table
CREATE TABLE IF NOT EXISTS logo_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  variant_num INT NOT NULL,
  svg_data LONGTEXT NOT NULL,
  svg_path VARCHAR(500),
  selected BOOLEAN DEFAULT FALSE,
  mockup_paths TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_variant_num (variant_num),
  UNIQUE KEY unique_order_variant (order_id, variant_num)
);

-- Admin Sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id VARCHAR(255) NOT NULL,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_id (admin_id),
  INDEX idx_token (token)
);

-- Insert default brand archetypes
INSERT INTO brand_archetypes (name, description, traits) VALUES
('The Innovator', 'Pioneers who challenge the status quo and create new possibilities. They are visionaries who see what others cannot.', 'Creative, Risk-taking, Visionary, Forward-thinking, Disruptive'),
('The Caregiver', 'Protects and cares for others. They are driven by compassion and a desire to help those in need.', 'Compassionate, Nurturing, Supportive, Selfless, Empathetic'),
('The Hero', 'Overcomes challenges and inspires others to do the same. They are courageous and determined.', 'Courageous, Strong, Determined, Confident, Inspirational'),
('The Explorer', 'Discovers new experiences and pushes boundaries. They crave freedom and authenticity.', 'Adventurous, Curious, Independent, Authentic, Freedom-loving'),
('The Creator', 'Brings imagination to life through innovation and artistry. They value originality.', 'Artistic, Original, Inventive, Imaginative, Expressive'),
('The Ruler', 'Creates order and structure. They take control and provide leadership.', 'Authoritative, Responsible, Organized, Commanding, Decisive'),
('The Magician', 'Makes dreams come true and transforms reality. They bring about change.', 'Transformative, Charismatic, Visionary, Mystical, Powerful'),
('The Lover', 'Creates intimacy and inspires love. They value relationships and connection.', 'Passionate, Committed, Sensual, Appreciative, Connected'),
('The Jester', 'Brings joy and humor to the world. They live in the moment and enjoy life.', 'Playful, Humorous, Lighthearted, Fun-loving, Spontaneous'),
('The Sage', 'Seeks truth and understanding. They value knowledge and wisdom.', 'Wise, Knowledgeable, Analytical, Truthful, Thoughtful'),
('The Outlaw', 'Challenges the status quo and breaks rules. They fight for change.', 'Rebellious, Disruptive, Free-spirited, Brave, Revolutionary'),
('The Innocent', 'Seeks happiness and simplicity. They are optimistic and pure.', 'Optimistic, Honest, Pure, Simple, Wholesome')
ON DUPLICATE KEY UPDATE 
  description = VALUES(description),
  traits = VALUES(traits);
