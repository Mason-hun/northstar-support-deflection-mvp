# TASK-03 — API & Project Documentation

# Purpose

This document describes the API endpoints implemented for the TASK-03 Order Status and Returns & Refunds flows.

urlBase URL for local development:

"http://127.0.0.1:8000/api/"

---

## 1. Order Status API

### OS-01 / OS-02 — Retrieve Order Status

Endpoint

"GET /api/orders/{order_id}"

Example

"GET /api/orders/110"

Expected successful response

Returns:

- Order ID
- Current order status
- Expected delivery date

Example:

{
  "order_id": 110,
  "status": "Shipped",
  "expected_delivery": "2026-06-14"
}

The endpoint supports both shipped and processing orders.

---

### OS-03 — Missing Order ID

Endpoint

"GET /api/orders/"

Expected response

HTTP "400"

The API asks the customer to provide their order number.

---

### OS-04 — Order Not Found

Example

"GET /api/orders/113"

Expected response

HTTP "404"

{
  "error": "Order not found",
  "message": "Please verify your order number."
}

---

### OS-05 — Invalid Order ID Format

An invalid order identifier such as "300*" should produce a validation error rather than attempting a database lookup.

Expected response:

HTTP "400"

---

## 2. Returns & Refunds API

### RR-01 — Clothing

"GET /api/returns/clothing"

Returns the clothing return policy.

- Return window: 10 days
- Item must be unworn
- Original tag must remain intact

---

### RR-02 — Electronics

"GET /api/returns/electronics"

Returns the electronics return policy.

- Return window: 20 days
- Customer should use the return portal to process the return

---

### RR-03 — Furniture

"GET /api/returns/furniture"

Returns the furniture return policy.

- Return window: 7 days
- Item must be in the original packaging

---

### RR-04 — Missing Category

"GET /api/returns/"

Returns HTTP "400" and asks the customer to specify a return category.

Supported categories:

- Clothing
- Electronics
- Furniture

---

### RR-05 — Return Eligibility

Endpoint

"GET /api/returns/{category}/check?purchase_date=YYYY-MM-DD"

The endpoint compares the purchase date with the configured return window for the selected category.

It handles:

- Eligible returns
- Expired return windows
- Missing purchase dates
- Invalid date formats
- Future purchase dates

---

### RR-06 — Return Status

"GET /api/returns/status"

Returns the expected processing period:

«Returns are processed within 4–7 working days after the returned item is received and inspected.»

---

## API Validation

The API validates user input before processing requests.

Examples include:

- Missing order number
- Invalid order number
- Invalid return category
- Missing purchase date
- Invalid purchase date
- Future purchase date
- Expired return window

This ensures predictable responses for both valid and invalid customer requests.
