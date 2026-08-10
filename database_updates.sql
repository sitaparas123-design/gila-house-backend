-- Run this query to create the audit logs table for the Full Audit feature
CREATE TABLE IF NOT EXISTS order_status_logs (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    order_id INT NOT NULL, 
    status VARCHAR(50) NOT NULL, 
    action VARCHAR(100) NOT NULL, 
    user_name VARCHAR(100) DEFAULT 'System', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Run this query to create the activity_logs table for the Live Operational Log feature
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(500) NOT NULL,
    type ENUM('order', 'table', 'reservation', 'payment', 'staff', 'system') DEFAULT 'system',
    entity_type VARCHAR(50) DEFAULT NULL,
    entity_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
