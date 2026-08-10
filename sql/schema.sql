-- Royal Hospitality ERP & POS Platform - Database Schema
-- Database: restaurantpos

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role_id INT,
    avatar LONGTEXT,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    shift ENUM('morning', 'afternoon', 'evening', 'night') DEFAULT 'morning',
    rating DECIMAL(3, 2) DEFAULT 0.00,
    last_login TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. Table Zones
CREATE TABLE IF NOT EXISTS table_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone_name VARCHAR(50) NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL
);

-- 4. Restaurant Tables
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_code VARCHAR(20) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    zone_id INT,
    status ENUM('available', 'occupied', 'reserved', 'cleaning') DEFAULT 'available',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (zone_id) REFERENCES table_zones(id)
);

-- 5. Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL
);

-- 6. Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    image LONGTEXT,
    price DECIMAL(10, 2) NOT NULL,
    preparation_time INT, -- in minutes
    availability BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    popular BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);

-- 7. Guests
CREATE TABLE IF NOT EXISTS guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    loyalty_points INT DEFAULT 0,
    membership_type ENUM('regular', 'silver', 'gold', 'platinum') DEFAULT 'regular',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL
);

-- 8. Orders
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT NULL,
    table_id INT NULL,
    order_type ENUM('dine-in', 'takeaway', 'delivery') DEFAULT 'dine-in',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    service_charge_percent DECIMAL(5, 2) DEFAULT 0.00,
    service_charge_amount DECIMAL(10, 2) DEFAULT 0.00,
    grand_total DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'partial', 'paid', 'refunded') DEFAULT 'pending',
    order_status ENUM('new', 'pending', 'cooking', 'ready', 'delivered', 'cancelled') DEFAULT 'new',
    assigned_waiter INT NULL,
    assigned_chef INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES guests(id),
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),
    FOREIGN KEY (assigned_waiter) REFERENCES users(id),
    FOREIGN KEY (assigned_chef) REFERENCES users(id)
);

-- 9. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    menu_item_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    kitchen_status ENUM('pending', 'cooking', 'ready', 'delivered') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- 10. Kitchen Tickets
CREATE TABLE IF NOT EXISTS kitchen_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    estimated_time INT,
    preparation_status ENUM('pending', 'cooking', 'ready', 'delivered') DEFAULT 'pending',
    assigned_chef INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (assigned_chef) REFERENCES users(id)
);

-- 11. Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_code VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(255) NOT NULL,
    category ENUM('kitchen', 'bar', 'rooms', 'maintenance') DEFAULT 'kitchen',
    current_stock DECIMAL(10, 2) NOT NULL,
    threshold DECIMAL(10, 2) DEFAULT 0,
    unit VARCHAR(20),
    unit_price DECIMAL(10, 2) DEFAULT 0,
    status ENUM('in_stock', 'low_stock', 'out_of_stock') DEFAULT 'in_stock',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL
);

-- 12. Inventory Logs
CREATE TABLE IF NOT EXISTS inventory_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT,
    action_type ENUM('add', 'remove', 'update', 'consume') DEFAULT 'update',
    quantity DECIMAL(10, 2) NOT NULL,
    previous_stock DECIMAL(10, 2) NOT NULL,
    updated_stock DECIMAL(10, 2) NOT NULL,
    performed_by INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id),
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- 13. Rooms
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(20) NOT NULL UNIQUE,
    room_name VARCHAR(100),
    room_type VARCHAR(50),
    capacity INT DEFAULT 2,
    base_rate DECIMAL(10, 2) DEFAULT 0.00,
    room_status ENUM('available', 'occupied', 'reserved', 'cleaning', 'maintenance') DEFAULT 'available',
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL
);

-- 14. Reservations
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_code VARCHAR(50) NOT NULL UNIQUE,
    guest_id INT,
    booking_type ENUM('table', 'room', 'event', 'transport') DEFAULT 'table',
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    guests_count INT DEFAULT 1,
    special_notes TEXT,
    reservation_status ENUM('pending', 'confirmed', 'checked_in', 'completed', 'cancelled') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (guest_id) REFERENCES guests(id)
);

-- 15. Room Bookings
CREATE TABLE IF NOT EXISTS room_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT,
    reservation_id INT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_guests INT DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

-- 16. Services (Transport & Excursions)
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    service_type ENUM('transport', 'excursion') DEFAULT 'excursion',
    description TEXT,
    price_per_person DECIMAL(10, 2) NOT NULL,
    availability BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL
);

-- 17. Service Bookings
CREATE TABLE IF NOT EXISTS service_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT,
    guest_id INT,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    total_guests INT DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (guest_id) REFERENCES guests(id)
);

-- 18. Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to INT NULL,
    location VARCHAR(100),
    description TEXT,
    deadline TIMESTAMP NULL,
    task_status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- 19. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    notification_type VARCHAR(50),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    targetRole VARCHAR(50) DEFAULT 'ALL',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 20. QR Codes
CREATE TABLE IF NOT EXISTS qr_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('table', 'room') NOT NULL,
    entity_id INT NOT NULL,
    qr_image LONGTEXT,
    qr_url VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL
);

-- 21. Guest Billing
CREATE TABLE IF NOT EXISTS guest_billing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT,
    reservation_id INT NULL,
    total_charges DECIMAL(12, 2) DEFAULT 0,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    remaining_balance DECIMAL(12, 2) DEFAULT 0,
    billing_status ENUM('open', 'settled') DEFAULT 'open',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (guest_id) REFERENCES guests(id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

-- 22. Settlements
CREATE TABLE IF NOT EXISTS settlements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    billing_id INT,
    payment_method ENUM('cash', 'card', 'upi', 'bank_transfer') DEFAULT 'cash',
    settled_amount DECIMAL(12, 2) NOT NULL,
    settled_by INT NULL,
    settlement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (billing_id) REFERENCES guest_billing(id),
    FOREIGN KEY (settled_by) REFERENCES users(id)
);

-- 23. Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_code VARCHAR(100) NOT NULL UNIQUE,
    guest_id INT,
    total_amount DECIMAL(12, 2) NOT NULL,
    transaction_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_gateway VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (guest_id) REFERENCES guests(id)
);

-- 24. Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    message TEXT,
    ticket_status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (guest_id) REFERENCES guests(id)
);

-- 25. Support Messages
CREATE TABLE IF NOT EXISTS support_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT,
    sender_id INT NULL, -- Can be guest or staff
    message TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id)
);

-- 26. Favorites
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    menu_item_id INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);


-- 27. Carts
CREATE TABLE IF NOT EXISTS carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    table_id INT NULL,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES guests(id),
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id)
);

-- 28. Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT,
    menu_item_id INT,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (cart_id) REFERENCES carts(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- 29. Analytics Logs
CREATE TABLE IF NOT EXISTS analytics_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module VARCHAR(50),
    activity VARCHAR(255),
    revenue DECIMAL(12, 2) DEFAULT 0,
    user_id INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 30. Settings
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL
);

SET FOREIGN_KEY_CHECKS = 1;
