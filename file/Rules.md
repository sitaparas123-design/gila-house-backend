# Global System Rules

# Security Rules

- JWT required
- Role-based access mandatory
- Password hashing required

---

# Database Rules

- UUID IDs
- Soft delete preferred
- Audit logs mandatory

---

# Performance Rules

- Pagination required
- Cache analytics
- Optimize queries

---

# Real-Time Rules

- Socket.IO mandatory
- Live updates enabled
- Reconnection handling required

---

# Financial Rules

- GST auto calculation
- Invoice logs immutable
- Payment verification mandatory

---

# Inventory Rules

- Stock cannot go negative
- Threshold alerts mandatory

---

# Reservation Rules

- Double booking blocked
- Occupancy tracking mandatory

---

# Messaging Rules

- Chats stored permanently
- Guest privacy protected

---

# QR Rules

- Expired QR invalid
- Sessions tracked

---

# Logging Rules

Track:
- Login activity
- Payment activity
- Inventory changes
- Reservation updates

---

# Error Handling Rules

Use:
- Global error middleware
- Standard API response format

Success Response:

{
  "success": true,
  "message": "Completed",
  "data": {}
}

Error Response:

{
  "success": false,
  "message": "Something went wrong"
}
# Manager Dashboard Rules

# Authentication Rules

- JWT authentication mandatory
- Role must be MANAGER
- Session validation required

---

# Authorization Rules

Managers can:
- Manage operations
- View reports
- Manage reservations
- Monitor billing

Managers cannot:
- Modify global system configs
- Access super admin permissions

---

# Orders Rules

- Orders must have valid items
- Completed orders immutable
- Status flow controlled

Allowed flow:

new
↓
pending
↓
cooking
↓
ready
↓
delivered

---

# POS Rules

- GST auto calculated
- Discounts validated
- Cart cannot be empty

---

# Kitchen Rules

- KOT required
- Dispatch confirmation mandatory
- Cooking delays tracked

---

# Inventory Rules

- Stock cannot go negative
- Threshold alerts mandatory
- Inventory logs maintained

---

# Reservation Rules

- Double booking blocked
- Reservation logs mandatory
- Date/time required

---

# Rooms Rules

- Occupied rooms locked
- Maintenance blocks assignment
- Cleaning workflow mandatory

---

# Concierge Rules

- Chats stored permanently
- Guest privacy protected
- Message timestamps required

---

# Billing Rules

- Invoice IDs unique
- Settled invoices immutable
- Payment verification mandatory

---

# QR Rules

- QR unique required
- Expired QR invalid
- QR scans tracked

---

# Reporting Rules

- Financial reports read-only
- Export logs maintained

---

# Performance Rules

- Pagination mandatory
- Socket updates enabled
- Query optimization required

---

# Logging Rules

Track:
- Orders
- Inventory changes
- Reservations
- Billing actions
- Staff assignments

---

# Security Rules

- Helmet middleware required
- CORS configuration required
- Rate limiting recommended

---

# Error Handling Rules

Use:
- Global error middleware
- Standard response format

Success:

{
  "success": true
}

Error:

{
  "success": false
}
# Waiter Dashboard Rules

# Authentication Rules

- JWT authentication mandatory
- Role must be WAITER
- Session validation required

---

# Authorization Rules

Waiters can:
- Manage tables
- Create orders
- Handle reservations
- Respond to guests

Waiters cannot:
- Access analytics
- Modify system settings
- Access admin controls

---

# POS Rules

- Cart cannot be empty
- GST auto calculation required
- Discounts validated
- Orders linked to table or guest

---

# Orders Rules

Allowed status flow:

new
↓
pending
↓
cooking
↓
ready
↓
delivered

- Completed orders immutable
- Kitchen token mandatory

---

# Table Rules

- Table IDs unique
- Occupied tables cannot be reassigned
- Zone assignment required

---

# Reservation Rules

- Double booking blocked
- Guest count mandatory
- Reservation logs required

---

# Concierge Rules

- Chats stored permanently
- Guest privacy protected
- Message timestamps mandatory

---

# Service Rules

- Service requests logged
- Approval tracking required
- Schedule conflicts blocked

---

# Task Rules

- Assigned staff mandatory
- Deadlines required
- Completion logs required

---

# Real-Time Rules

Socket.IO required for:
- Orders
- Reservations
- Concierge
- Table updates

---

# Logging Rules

Track:
- Order creation
- Reservation updates
- Table assignments
- Guest communications

---

# Security Rules

- Helmet middleware required
- Rate limiting recommended
- API validation mandatory

---

# Error Handling Rules

Use:
- Global error middleware
- Standard API responses

Success:

{
  "success": true
}

Error:

{
  "success": false
}

---

# Performance Rules

- Pagination mandatory
- Query optimization required
- Real-time sync enabled
# Chef Dashboard Rules

# Authentication Rules

- JWT authentication mandatory
- Role must be CHEF
- Session validation required

---

# Authorization Rules

Chefs can:
- Manage kitchen queue
- Update cooking status
- Dispatch orders
- Monitor inventory

Chefs cannot:
- Access admin settings
- Modify financial data
- Manage system users

---

# Kitchen Rules

Allowed status flow:

new
↓
pending
↓
cooking
↓
ready
↓
delivered

- KOT mandatory
- Dispatch confirmation required
- Cooking timers tracked

---

# Orders Rules

- Completed orders immutable
- Priority handling mandatory
- Kitchen logs required

---

# Inventory Rules

- Stock cannot go negative
- Threshold alerts mandatory
- Ingredient usage tracked

---

# Alerts Rules

- Notifications stored
- Alert timestamps required
- Critical alerts prioritized

---

# Task Rules

- Assignee mandatory
- Deadlines required
- Completion tracking enabled

---

# Real-Time Rules

Socket.IO required for:
- Kitchen queue
- Orders
- Alerts
- Dispatch updates

---

# Logging Rules

Track:
- Cooking status updates
- Dispatch activity
- Inventory changes
- Kitchen alerts

---

# Security Rules

- Helmet middleware required
- API validation mandatory
- Rate limiting recommended

---

# Error Handling Rules

Use:
- Global error middleware
- Standard API responses

Success:

{
  "success": true
}

Error:

{
  "success": false
}

---

# Performance Rules

- Queue optimization required
- Real-time sync enabled
- Pagination mandatory
# Cashier Dashboard Rules

# Authentication Rules

- JWT authentication mandatory
- Role must be CASHIER
- Session validation required

---

# Authorization Rules

Cashiers can:
- Process payments
- Manage settlements
- Access POS
- Print receipts

Cashiers cannot:
- Modify system settings
- Manage users
- Access admin controls

---

# POS Rules

- Cart cannot be empty
- GST mandatory
- Discounts validated
- Orders linked to guest or table

---

# Billing Rules

- Outstanding balances tracked
- Settled folios immutable
- Guest history maintained

---

# Settlement Rules

- Payment confirmation mandatory
- Supported payment methods validated
- Settlement logs required

---

# Transaction Rules

- All payments logged
- Transaction IDs unique
- Audit records immutable

---

# Orders Rules

Allowed status flow:

new
↓
pending
↓
cooking
↓
ready
↓
delivered
↓
paid

---

# Real-Time Rules

Socket.IO required for:
- Billing updates
- POS synchronization
- Settlement notifications
- Order status updates

---

# Logging Rules

Track:
- Payments
- Settlements
- Receipt generation
- Transaction updates

---

# Security Rules

- Helmet middleware required
- Rate limiting recommended
- API validation mandatory

---

# Error Handling Rules

Use:
- Global error middleware
- Standard API responses

Success:

{
  "success": true
}

Error:

{
  "success": false
}

---

# Performance Rules

- Pagination mandatory
- Query optimization required
- Real-time synchronization enabled
# Customer Dashboard Rules

# Authentication Rules

- Guest session required
- QR validation required
- Token validation mandatory

---

# Authorization Rules

Customers can:
- Order food
- Create reservations
- Book services
- Contact support

Customers cannot:
- Access admin controls
- Modify system settings
- Access staff operations

---

# Ordering Rules

- Cart cannot be empty
- Table/session required
- GST auto calculated
- Orders linked to guest session

---

# Reservation Rules

- Double booking blocked
- Guest count mandatory
- Date validation required

---

# Services Rules

- Guest information mandatory
- Booking schedule validated
- Folio linkage optional

---

# Favorites Rules

- Duplicate favorites blocked
- Quick reorder supported

---

# Support Rules

- Ticket subject mandatory
- Priority required
- Chat history stored

---

# Profile Rules

- Email validation required
- Mobile validation required
- Secure password handling mandatory

---

# Real-Time Rules

Socket.IO required for:
- Order tracking
- Support chat
- Reservation updates

---

# Logging Rules

Track:
- Orders
- Reservations
- Support requests
- Guest activities

---

# Security Rules

- Helmet middleware required
- API validation mandatory
- Rate limiting enabled

---

# Error Handling Rules

Use:
- Global error middleware
- Standard API responses

Success:

{
  "success": true
}

Error:

{
  "success": false
}

---

# Performance Rules

- Pagination mandatory
- Query optimization required
- Real-time synchronization enabled
# Website Rules

# General Rules

- Mobile-first design mandatory
- Responsive UI required
- Fast loading optimization required

---

# Reservation Rules

- Guest details mandatory
- Double booking blocked
- Date validation required

---

# Ordering Rules

- Cart validation required
- Tax auto calculation
- Live kitchen sync required

---

# Hotel Guest Rules

- Valid room required
- Guest session validation mandatory
- Room billing enabled

---

# Excursion Rules

- Guest count required
- Date selection mandatory
- Manager approval optional

---

# Transport Rules

- Pickup location required
- Driver assignment required

---

# Concierge Rules

- Chat logs stored
- Department routing required
- Real-time messaging mandatory

---

# Contact Rules

- Email validation required
- Spam protection enabled

---

# Security Rules

- JWT required
- HTTPS mandatory
- Rate limiting enabled
- Helmet middleware required

---

# Real-Time Rules

Socket.IO required for:
- Chat
- Orders
- Notifications
- Reservations

---

# Error Handling Rules

Standard response format:

Success:
{
  "success": true
}

Error:
{
  "success": false
}

---

# Logging Rules

Track:
- Guest activity
- Reservations
- Orders
- Concierge requests

---

# Performance Rules

- Lazy loading required
- Image optimization mandatory
- API pagination mandatory
