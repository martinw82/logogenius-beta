-- Migration: Change svg_data column to LONGTEXT to support large base64 images
-- The base64 images from Together AI can be ~200KB which exceeds TEXT (64KB) limit

ALTER TABLE logo_variants MODIFY COLUMN svg_data LONGTEXT;

-- Also ensure mockup_paths can hold large data
ALTER TABLE logo_variants MODIFY COLUMN mockup_paths LONGTEXT;

-- Ensure order_details fieldValue is also LONGTEXT (it should already be)
ALTER TABLE order_details MODIFY COLUMN field_value LONGTEXT;
