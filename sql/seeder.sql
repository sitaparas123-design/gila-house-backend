-- Default Roles and Users Seeder
-- Database: restaurantpos

SET FOREIGN_KEY_CHECKS = 0;

-- Insert Roles
INSERT INTO roles (role_name, description) VALUES
('admin', 'Full System Access'),
('manager', 'Operational Control'),
('waiter', 'Order Handling'),
('chef', 'Kitchen Operations'),
('cashier', 'Billing & Payments'),
('customer', 'QR Ordering & Guest Access');

-- Insert Default Users
-- Note: Passwords are hashed in production. For this seeder, we will use plain text for now if the app supports it or placeholder.
-- Actually, I should use bcrypt hashes for the requested credentials.
-- admin123 -> $2a$10$wE0v7M0T9t.1K1J.1K1J.OeJ0v7M0T9t.1K1J.1K1J.Oe (placeholder, I'll generate real ones later in code seeder)
-- For SQL, I'll just use the placeholder and let the app handle it, or use real hashes.

-- I will use real bcrypt hashes for the provided passwords:
-- admin123: $2a$10$Xm3t9Xm3t9Xm3t9Xm3t9Xu (just examples, I will use a Node.js seeder script instead for better control over bcrypt)

-- However, for the sake of completeness in SQL:
INSERT INTO users (full_name, email, password, role_id, status) VALUES
('System Admin', 'admin@gilahouse.com', '$2b$10$X.fM/9Wz3.D3v6vG.v8v.OeU8lQ5eX.fM/9Wz3.D3v6vG.v8v.O', 1, 'active'), -- admin123
('Kitchen Manager', 'manager@gilahouse.com', '$2b$10$X.fM/9Wz3.D3v6vG.v8v.OeU8lQ5eX.fM/9Wz3.D3v6vG.v8v.O', 2, 'active'), -- manager123
('Service Waiter', 'waiter@gilahouse.com', '$2b$10$X.fM/9Wz3.D3v6vG.v8v.OeU8lQ5eX.fM/9Wz3.D3v6vG.v8v.O', 3, 'active'), -- waiter123
('Head Chef', 'chef@gilahouse.com', '$2b$10$X.fM/9Wz3.D3v6vG.v8v.OeU8lQ5eX.fM/9Wz3.D3v6vG.v8v.O', 4, 'active'), -- chef123
('Billing Cashier', 'cashier@gilahouse.com', '$2b$10$X.fM/9Wz3.D3v6vG.v8v.OeU8lQ5eX.fM/9Wz3.D3v6vG.v8v.O', 5, 'active'), -- cashier123
('Guest Customer', 'customer@gilahouse.com', '$2b$10$X.fM/9Wz3.D3v6vG.v8v.OeU8lQ5eX.fM/9Wz3.D3v6vG.v8v.O', 6, 'active'); -- customer123

-- Note: The hashes above are placeholders. I will provide a Node.js script to seed correctly with bcrypt.

SET FOREIGN_KEY_CHECKS = 1;
