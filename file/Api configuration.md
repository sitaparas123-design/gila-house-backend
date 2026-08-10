# API Configuration

# Base URL

http://localhost:5000/api/v1

---

# Authentication Headers

Authorization: Bearer TOKEN

---

# API Standards

## Success Response

{
  "success": true,
  "message": "Data fetched successfully",
  "data": {}
}

---

## Error Response

{
  "success": false,
  "message": "Something went wrong"
}

---

# Auth APIs

POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password

---

# Dashboard APIs

GET /dashboard/stats
GET /dashboard/revenue
GET /dashboard/logs
GET /dashboard/orders

---

# POS APIs

POST /pos/create-order
PUT /pos/update-order
POST /pos/pay
GET /pos/orders

---

# Orders APIs

GET /orders
GET /orders/:id
PUT /orders/status

---

# Kitchen APIs

GET /kitchen/orders
PUT /kitchen/order-status

---

# Inventory APIs

GET /inventory
POST /inventory
PUT /inventory/:id
DELETE /inventory/:id

---

# Rooms APIs

GET /rooms
POST /rooms
PUT /rooms/:id
DELETE /rooms/:id

---

# Reservations APIs

POST /reservations
GET /reservations
PUT /reservations/:id

---

# Reports APIs

GET /reports/daily
GET /reports/weekly
GET /reports/monthly

---

# Socket Events

## Emit
- orderCreated
- orderUpdated
- roomUpdated
- inventoryAlert

## Listen
- kitchenUpdate
- dashboardUpdate


# Floor Management API Configuration

# Base URL

/api/v1

---

# Floor APIs

## Get All Floors
GET /floors

---

## Create Floor
POST /floors

Request Body:

{
  "name": "Ground Floor"
}

---

## Update Floor
PUT /floors/:id

---

## Delete Floor
DELETE /floors/:id

---

# Table APIs

## Get All Tables
GET /tables

---

## Add New Table
POST /tables

Request Body:

{
  "tableNumber": "T-01",
  "floorId": "uuid",
  "capacity": 4,
  "status": "available"
}

---

## Update Table
PUT /tables/:id

---

## Delete Table
DELETE /tables/:id

---

## Change Table Status
PUT /tables/status

Request Body:

{
  "tableId": "uuid",
  "status": "occupied"
}

---

## Assign Waiter
PUT /tables/assign-waiter

Request Body:

{
  "tableId": "uuid",
  "waiterId": "uuid"
}

---

# Status Enums

available
occupied
reserved
cleaning
inactive

---

# Socket Events

## Emit Events
- tableCreated
- tableUpdated
- tableStatusChanged

## Listen Events
- liveTableUpdate


# POS API Configuration

# Base URL

/api/v1

---

# Menu APIs

## Get All Menu Items
GET /menu

---

## Search Menu Items
GET /menu/search?q=pizza

---

## Get Categories
GET /menu/categories

---

## Add Menu Item
POST /menu

Request Body:

{
  "name": "Margherita Pizza",
  "categoryId": "uuid",
  "price": 299,
  "status": "ready"
}

---

# Cart APIs

## Get Active Cart
GET /cart

---

## Add Item To Cart
POST /cart/add

Request Body:

{
  "itemId": "uuid",
  "quantity": 1
}

---

## Update Cart Item
PUT /cart/update

Request Body:

{
  "itemId": "uuid",
  "quantity": 2
}

---

## Remove Cart Item
DELETE /cart/remove/:id

---

## Apply Discount
POST /cart/apply-discount

Request Body:

{
  "discount": 10
}

---

# Order APIs

## Create Order
POST /orders/create

---

## Send To KDS
POST /orders/send-kds

---

## Get Orders
GET /orders

---

## Update Order Status
PUT /orders/status

---

# Payment APIs

## Checkout
POST /payments/checkout

Request Body:

{
  "orderId": "uuid",
  "paymentMethod": "cash"
}

---

# Status Enums

pending
accepted
cooking
ready
delivered
cancelled

---

# Socket Events

## Emit
- orderCreated
- orderUpdated
- cartUpdated
- paymentCompleted

## Listen
- kitchenStatusChanged
# Global API Structure

# Base URL

/api/v1

---

# Authentication

POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout

---

# Dashboard

GET /dashboard

---

# Tables

GET /tables
POST /tables/create

---

# POS

POST /pos/order

---

# Orders

GET /orders
PUT /orders/status

---

# Kitchen

GET /kitchen/queue

---

# Inventory

GET /inventory

---

# Menu

GET /menu

---

# Staff

GET /staff

---

# Reports

GET /reports/dashboard

---

# Rooms

GET /rooms

---

# Reservations

GET /reservations

---

# Concierge

GET /concierge/chats

---

# Services

GET /services/bookings

---

# QR

POST /qr/generate

---

# Billing

GET /billing

---

# Settings

GET /settings

---

# Authentication

JWT Bearer Token Required

Authorization:
Bearer TOKEN


# Manager Dashboard API Configuration

# Base URL

/api/v1/manager

---

# Dashboard

GET /dashboard

---

# Tables

GET /tables
POST /tables/create
PUT /tables/update/:id

---

# POS

POST /pos/order
GET /pos/menu

---

# Orders

GET /orders
GET /orders/:id
PUT /orders/status

---

# Kitchen

GET /kitchen/queue
PUT /kitchen/dispatch

---

# Tasks

GET /tasks
POST /tasks/create
PUT /tasks/status

---

# Inventory

GET /inventory
POST /inventory/create
PUT /inventory/update

---

# Menu

GET /menu
POST /menu/create
PUT /menu/update

---

# Reports

GET /reports/dashboard

---

# Rooms

GET /rooms
POST /rooms/create
PUT /rooms/status

---

# Reservations

GET /reservations
POST /reservations/create
PUT /reservations/status

---

# Concierge

GET /concierge/chats
POST /concierge/send

---

# Services

GET /services
PUT /services/approve

---

# QR

GET /qr
POST /qr/generate

---

# Billing

GET /billing
POST /billing/print

---

# Authentication

JWT Bearer Token Required

Authorization:
Bearer TOKEN
# Waiter Dashboard API Configuration

# Base URL

/api/v1/waiter

---

# Dashboard

GET /dashboard

---

# Tables

GET /tables
POST /tables/create
PUT /tables/update/:id

---

# POS

GET /pos/menu
POST /pos/order
POST /pos/cart/add
POST /pos/checkout

---

# Orders

GET /orders
GET /orders/:id
PUT /orders/status

---

# Tasks

GET /tasks
PUT /tasks/status

---

# Reservations

GET /reservations
POST /reservations/create
PUT /reservations/status

---

# Concierge

GET /concierge/chats
POST /concierge/send

---

# Services

GET /services
PUT /services/status

---

# Authentication

JWT Bearer Token Required

Authorization:
Bearer TOKEN
# Chef Dashboard API Configuration

# Base URL

/api/v1/chef

---

# Dashboard

GET /dashboard

---

# Orders

GET /orders
GET /orders/:id
PUT /orders/status

---

# Kitchen

GET /kitchen/queue
GET /kitchen/ready
PUT /kitchen/dispatch
PUT /kitchen/cooking

---

# Tasks

GET /tasks
POST /tasks/create
PUT /tasks/status

---

# Inventory

GET /inventory
POST /inventory/create
PUT /inventory/update

---

# Alerts

GET /alerts
PUT /alerts/read

---

# Authentication

JWT Bearer Token Required

Authorization:
Bearer TOKEN
# Cashier Dashboard API Configuration

# Base URL

/api/v1/cashier

---

# Dashboard

GET /dashboard

---

# POS

GET /pos/menu
POST /pos/cart/add
POST /pos/order
POST /pos/checkout

---

# Orders

GET /orders
GET /orders/:id
PUT /orders/status

---

# Guest Billing

GET /billing
GET /billing/:id
PUT /billing/settle

---

# Settlement

GET /settlement
POST /settlement/process
POST /settlement/receipt

---

# Transactions

GET /transactions
GET /transactions/:id

---

# Authentication

JWT Bearer Token Required

Authorization:
Bearer TOKEN
# Customer Dashboard API Configuration

# Base URL

/api/v1/customer

---

# Dashboard

GET /dashboard

---

# Menu

GET /menu
GET /menu/:id

---

# Cart

GET /cart
POST /cart/add
PUT /cart/update
DELETE /cart/remove

---

# Orders

POST /orders/create
GET /orders
GET /orders/:id

---

# Reservations

GET /reservations
POST /reservations/create

---

# Services

GET /services
POST /services/book

---

# Favorites

GET /favorites
POST /favorites/add
DELETE /favorites/remove

---

# Profile

GET /profile
PUT /profile/update

---

# Support

GET /support/tickets
POST /support/ticket
POST /support/message

---

# Authentication

JWT / Guest Session Required

Authorization:
Bearer TOKEN
# Website API Configuration

# Base URL

/api/v1

---

# Public Website APIs

GET /website/home
GET /website/about
GET /website/menu
GET /website/services

---

# Menu APIs

GET /menu
GET /menu/:id

---

# Reservation APIs

POST /reservations/create
GET /reservations/:id

---

# Excursion APIs

GET /excursions
POST /excursions/book

---

# Transport APIs

GET /transport/services
POST /transport/request

---

# Guest APIs

POST /guest/checkin
GET /guest/profile
GET /guest/bill

---

# Concierge APIs

GET /concierge/chats
POST /concierge/message

---

# Contact APIs

POST /contact/message

---

# Authentication APIs

POST /auth/login
POST /auth/logout

---

# Real-Time APIs

Socket Events:
- new_message
- order_update
- reservation_update
- transport_update
