# Hospitality ERP - Database Design Documentation

# Overview

This document defines the complete database structure for all dashboards:

- Admin
- Manager
- Waiter
- Chef
- Cashier
- Customer

The database is designed for:

- Restaurant POS
- Hotel Management
- Reservations
- Kitchen Operations
- Inventory
- Billing
- Concierge
- Real-time Operations

---

# Recommended Database

Primary:
- PostgreSQL

Alternative:
- MySQL

ORM:
- Prisma ORM / Sequelize ORM

---

# Global Standards

All tables must include:

- id
- createdAt
- updatedAt
- deletedAt (Soft Delete)

Example:

id UUID PRIMARY KEY
createdAt TIMESTAMP
updatedAt TIMESTAMP
deletedAt TIMESTAMP NULL

---

# DATABASE MODULES

1. users
2. roles
3. permissions
4. tables
5. table_zones
6. menu_categories
7. menu_items
8. orders
9. order_items
10. kitchen_tickets
11. inventory
12. inventory_logs
13. reservations
14. rooms
15. room_bookings
16. guests
17. services
18. service_bookings
19. tasks
20. notifications
21. qr_codes
22. guest_billing
23. settlements
24. transactions
25. support_tickets
26. support_messages
27. favorites
28. carts
29. cart_items
30. analytics_logs
31. settings

---

# 1. USERS TABLE

Stores all system users.

Table: users

Fields:

- id
- full_name
- email
- phone
- password
- role_id
- avatar
- status
- shift
- rating
- last_login

Roles:
- admin
- manager
- waiter
- chef
- cashier
- customer

---

# 2. ROLES TABLE

Table: roles

Fields:
- id
- role_name
- description

Examples:
- Admin
- Manager
- Waiter
- Chef
- Cashier
- Customer

---

# 3. PERMISSIONS TABLE

Table: permissions

Fields:
- id
- role_id
- module_name
- can_create
- can_read
- can_update
- can_delete

---

# 4. TABLES TABLE

Restaurant seating.

Table: tables

Fields:
- id
- table_code
- capacity
- zone_id
- status

Statuses:
- available
- occupied
- reserved

---

# 5. TABLE ZONES

Table: table_zones

Fields:
- id
- zone_name

Examples:
- Ground Floor
- Rooftop
- Indoor VIP

---

# 6. MENU CATEGORIES

Table: menu_categories

Fields:
- id
- category_name
- icon

Examples:
- Pizza
- Burgers
- Pasta
- Drinks

---

# 7. MENU ITEMS

Table: menu_items

Fields:
- id
- category_id
- item_name
- description
- image
- price
- preparation_time
- availability
- rating
- popular

---

# 8. ORDERS TABLE

Main order table.

Table: orders

Fields:
- id
- order_number
- customer_id
- table_id
- order_type
- subtotal
- tax
- discount
- grand_total
- payment_status
- order_status
- assigned_waiter
- assigned_chef

Statuses:
- new
- pending
- cooking
- ready
- delivered
- cancelled

---

# 9. ORDER ITEMS

Table: order_items

Fields:
- id
- order_id
- menu_item_id
- quantity
- unit_price
- total_price
- kitchen_status

---

# 10. KITCHEN TICKETS

Kitchen Display System.

Table: kitchen_tickets

Fields:
- id
- order_id
- priority
- estimated_time
- preparation_status
- assigned_chef

---

# 11. INVENTORY

Table: inventory

Fields:
- id
- inventory_code
- product_name
- category
- current_stock
- threshold
- unit
- unit_price
- status

Statuses:
- in_stock
- low_stock
- out_of_stock

---

# 12. INVENTORY LOGS

Inventory movements.

Table: inventory_logs

Fields:
- id
- inventory_id
- action_type
- quantity
- previous_stock
- updated_stock
- performed_by

Actions:
- add
- remove
- update

---

# 13. RESERVATIONS

Table: reservations

Fields:
- id
- reservation_code
- guest_id
- booking_type
- booking_date
- booking_time
- guests_count
- special_notes
- reservation_status

Statuses:
- pending
- confirmed
- checked_in
- completed
- cancelled

---

# 14. ROOMS

Hotel rooms.

Table: rooms

Fields:
- id
- room_code
- room_name
- room_type
- capacity
- room_status
- notes

Statuses:
- available
- occupied
- reserved
- cleaning
- maintenance

---

# 15. ROOM BOOKINGS

Table: room_bookings

Fields:
- id
- room_id
- reservation_id
- check_in
- check_out
- total_guests

---

# 16. GUESTS

Table: guests

Fields:
- id
- full_name
- email
- phone
- address
- loyalty_points
- membership_type

---

# 17. SERVICES

Transport & excursions.

Table: services

Fields:
- id
- service_name
- service_type
- description
- price_per_person
- availability

Types:
- transport
- excursion

---

# 18. SERVICE BOOKINGS

Table: service_bookings

Fields:
- id
- service_id
- guest_id
- booking_date
- booking_time
- total_guests
- total_amount
- booking_status

---

# 19. TASKS

Staff duty management.

Table: tasks

Fields:
- id
- title
- category
- priority
- assigned_to
- location
- deadline
- task_status

Statuses:
- pending
- in_progress
- completed

---

# 20. NOTIFICATIONS

Table: notifications

Fields:
- id
- user_id
- notification_type
- message
- is_read

---

# 21. QR CODES

Table: qr_codes

Fields:
- id
- entity_type
- entity_id
- qr_image
- qr_url

Entity Types:
- table
- room

---

# 22. GUEST BILLING

Table: guest_billing

Fields:
- id
- guest_id
- reservation_id
- total_charges
- paid_amount
- remaining_balance
- billing_status

Statuses:
- open
- settled

---

# 23. SETTLEMENTS

Table: settlements

Fields:
- id
- billing_id
- payment_method
- settled_amount
- settled_by
- settlement_date

Methods:
- cash
- card
- upi

---

# 24. TRANSACTIONS

Table: transactions

Fields:
- id
- transaction_code
- guest_id
- total_amount
- transaction_status
- payment_gateway

---

# 25. SUPPORT TICKETS

Table: support_tickets

Fields:
- id
- guest_id
- subject
- category
- priority
- message
- ticket_status

---

# 26. SUPPORT MESSAGES

Table: support_messages

Fields:
- id
- ticket_id
- sender_id
- message

---

# 27. FAVORITES

Table: favorites

Fields:
- id
- customer_id
- menu_item_id

---

# 28. CARTS

Table: carts

Fields:
- id
- customer_id
- table_id
- total_amount

---

# 29. CART ITEMS

Table: cart_items

Fields:
- id
- cart_id
- menu_item_id
- quantity
- total_price

---

# 30. ANALYTICS LOGS

Table: analytics_logs

Fields:
- id
- module
- activity
- revenue
- user_id

---

# 31. SETTINGS

Global system settings.

Table: settings

Fields:
- id
- setting_key
- setting_value

Examples:
- gst_rate
- service_charge
- restaurant_name
- printer_ip

---

# RELATIONSHIPS

users → roles
orders → tables
orders → guests
orders → users
order_items → menu_items
reservations → guests
reservations → rooms
tasks → users
support_messages → support_tickets

---

# INDEXING STRATEGY

Use indexes on:

- order_number
- reservation_code
- guest_id
- table_code
- room_code
- inventory_code

---

# SECURITY RULES

- Password hashing mandatory
- JWT authentication
- RBAC permission system
- Soft delete enabled
- Audit logs mandatory

---

# REAL-TIME TABLES

Socket synced tables:

- orders
- kitchen_tickets
- notifications
- support_messages
- reservations

---

# SCALABILITY DESIGN

Supports:
- Multi-branch restaurants
- Hotels
- Franchises
- Cloud deployment
- Mobile apps

---

# FUTURE DATABASE SUPPORT

Planned:
- AI recommendation engine
- Dynamic pricing
- Smart analytics
- Multi-language system
- Subscription billing
# Website Database Design

# Main Tables

1. website_banners
2. menu_items
3. menu_categories
4. reservations
5. excursions
6. excursion_bookings
7. transport_services
8. transport_requests
9. guest_sessions
10. concierge_chats
11. concierge_messages
12. contact_messages
13. testimonials
14. hotel_rooms
15. room_guests
16. guest_bills
17. notifications

---

# WEBSITE BANNERS

Table: website_banners

Fields:
- id
- title
- subtitle
- image
- cta_text
- cta_link

---

# MENU ITEMS

Table: menu_items

Fields:
- id
- category_id
- item_name
- description
- image
- price
- rating
- availability

---

# MENU CATEGORIES

Table: menu_categories

Fields:
- id
- category_name
- icon

---

# RESERVATIONS

Table: reservations

Fields:
- id
- guest_name
- guests_count
- booking_date
- booking_time
- meal_type
- reservation_status

---

# EXCURSIONS

Table: excursions

Fields:
- id
- title
- description
- location
- duration
- price
- image

---

# EXCURSION BOOKINGS

Table: excursion_bookings

Fields:
- id
- excursion_id
- guest_id
- booking_date
- total_guests
- total_price

---

# TRANSPORT SERVICES

Table: transport_services

Fields:
- id
- service_name
- vehicle_type
- description

---

# TRANSPORT REQUESTS

Table: transport_requests

Fields:
- id
- guest_id
- service_id
- pickup_location
- request_date
- request_status

---

# GUEST SESSIONS

Table: guest_sessions

Fields:
- id
- room_id
- guest_name
- qr_token
- active_status

---

# CONCIERGE CHATS

Table: concierge_chats

Fields:
- id
- guest_id
- department
- status

---

# CONCIERGE MESSAGES

Table: concierge_messages

Fields:
- id
- chat_id
- sender
- message

---

# CONTACT MESSAGES

Table: contact_messages

Fields:
- id
- full_name
- email
- subject
- message

---

# TESTIMONIALS

Table: testimonials

Fields:
- id
- customer_name
- review
- rating

---

# HOTEL ROOMS

Table: hotel_rooms

Fields:
- id
- room_number
- room_type
- room_status

---

# ROOM GUESTS

Table: room_guests

Fields:
- id
- room_id
- guest_name
- checkin_date
- checkout_date

---

# GUEST BILLS

Table: guest_bills

Fields:
- id
- guest_id
- total_amount
- payment_status

---

# NOTIFICATIONS

Table: notifications

Fields:
- id
- user_id
- title
- message
- is_read
