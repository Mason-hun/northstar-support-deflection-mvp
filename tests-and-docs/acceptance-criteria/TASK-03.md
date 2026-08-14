# TASK-03 — Sample Order and Return Scenarios

## Purpose

Define realistic sample order-status and returns/refund scenarios for testing the Support Deflection MVP.

## Definition of Done

- At least 5 realistic Order Status scenarios are documented.
- At least 5 realistic Returns and Refunds scenarios are documented.
- Each scenario includes sample customer input.
- Each scenario includes the test condition.
- Each scenario includes an expected system response.
- Edge cases and validation scenarios are represented.
- The scenarios are clear enough for another team member to test.

> The source test case contains 5 Order Status scenarios (OS-01–OS-05) and 6 Returns and Refund scenarios (RR-01–RR-06).

---

# 1. Order Status Acceptance Criteria

## OS-01 — Valid shipped order

**Customer input:** “Where is my order 110?”

**Condition:** Valid order — shipped.

**Expected response:**
- Display order 110 as **Shipped**.
- Show the expected delivery date.

**Acceptance criteria:** Given a valid shipped order, when the customer asks where it is, the system displays **Shipped** and the expected delivery date.

---

## OS-02 — Valid processing order

**Customer input:** “Has order 300 been shipped?”

**Condition:** Valid order — processing.

**Expected response:**
- Display order 300 as **Processing**.
- Show the expected delivery date.

**Acceptance criteria:** Given a valid processing order, when the customer asks whether it has shipped, the system displays **Processing** and the expected delivery date.

---

## OS-03 — Missing order ID

**Customer input:** “Where is my order?”

**Condition:** Order ID missing.

**Expected response:** Ask the customer to provide their order number.

**Acceptance criteria:** Given that no order ID was provided, the system asks the customer to provide their order number.

**Edge case:** Customer requests an order status without supplying an order number.

---

## OS-04 — Valid-format order that does not exist

**Customer input:** “Order 113”

**Condition:** Valid format, but the order does not exist.

**Expected response:**
- Display **“Order not found”**.
- Ask the customer to verify the order number.

**Acceptance criteria:** Given a valid-format order number with no matching order, the system displays **“Order not found”** and asks the customer to verify the number.

**Edge case:** Correct format but no matching order record.

---

## OS-05 — Invalid order ID format

**Customer input:** “Order 300*”

**Condition:** Invalid input format.

**Expected response:** Display a clear validation message requesting a valid order number.

**Acceptance criteria:** Given an invalid order-number format, the system displays a validation message and requests a valid order number.

**Edge case:** Order number contains an invalid character.

---

# 2. Returns and Refunds Acceptance Criteria

## RR-01 — Clothing return

**Customer input:** “How do I return these boxers?”

**Condition:** Clothing; return allowed within **10 days of purchase**, unworn with original tag.

**Expected response:** Provide the return process.

**Acceptance criteria:** Given an eligible clothing item within 10 days of purchase, unworn and with its original tag, the system provides the return process.

**Edge case:** The item must satisfy the 10-day, unworn, and original-tag conditions.

---

## RR-02 — Electronics return

**Customer input:** “How do I return my fridge?”

**Condition:** Electronic; return allowed within **20 days of purchase**.

**Expected response:** Provide the return process.

**Acceptance criteria:** Given an electronic item within 20 days of purchase, the system provides the return process.

**Edge case:** Return request falls outside the stated 20-day window.

---

## RR-03 — Furniture return

**Customer input:** “I want to return my Coach”

**Condition:** Furniture; return allowed within **7 days of delivery**, in original packaging.

**Expected response:** Provide the return process.

**Acceptance criteria:** Given furniture within 7 days of delivery and in original packaging, the system provides the return process.

**Edge case:** The item must satisfy both the 7-day window and original-packaging condition.

---

## RR-04 — Missing product category

**Customer input:** “How do I return this?”

**Condition:** Product category missing.

**Expected response:** Ask the customer to specify **Clothing, Electronics, or Furniture**.

**Acceptance criteria:** Given that the product category is missing, the system asks the customer to specify Clothing, Electronics, or Furniture.

**Edge case:** Customer requests a return without identifying the product category.

---

## RR-05 — Return window expired

**Customer input:** “I bought this one month ago”

**Condition:** Return window expired.

**Expected response:**
- Inform the customer that the return window has expired.
- Direct them to support.

**Acceptance criteria:** Given an expired return window, the system informs the customer that it has expired and directs them to support.

**Edge case:** Purchase is outside the applicable return window.

---

## RR-06 — Return-status inquiry

**Customer input:** “What’s my return status?”

**Condition:** Return-status inquiry.

**Expected response:** Inform the customer that returns are processed within **4–7 working days** after receipt and inspection.

**Acceptance criteria:** Given a customer asking for return status, the system provides the 4–7 working day processing expectation after receipt and inspection.

**Edge case:** Customer is asking for status information rather than initiating a new return.

---

# 3. Scenario Coverage

| ID | Scenario | Category |
|---|---|---|
| OS-01 | Valid shipped order | Order Status |
| OS-02 | Valid processing order | Order Status |
| OS-03 | Missing order ID | Order Status |
| OS-04 | Non-existent order | Order Status |
| OS-05 | Invalid order ID | Order Status |
| RR-01 | Clothing return | Returns/Refunds |
| RR-02 | Electronics return | Returns/Refunds |
| RR-03 | Furniture return | Returns/Refunds |
| RR-04 | Missing product category | Returns/Refunds |
| RR-05 | Expired return | Returns/Refunds |
| RR-06 | Return status | Returns/Refunds |










