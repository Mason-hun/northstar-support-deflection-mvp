# Northstar Support Deflection MVP – Test Cases (TASK-03)

## Order Status Test Cases

| ID | Customer Input | Condition | Expected System Response |
|----|----------------|-----------|--------------------------|
| OS-01 | "Where is my order 110?" | Valid order – Shipped | Display order 110 as "Shipped" and show expected delivery date |
| OS-02 | "Has order 300 been shipped?" | Valid order – Processing | Display order 300 as "Processing" and show expected delivery date |
| OS-03 | "Where is my order?" | Order ID missing | Ask customer to provide their order number |
| OS-04 | "Order 113" | Valid format but order does not exist | Display "Order not found" and ask customer to verify the order number |
| OS-05 | "Order 300*" | Invalid input format | Display a clear validation message requesting a valid order number |

---

## Returns & Refunds Test Cases

| ID | Customer Input | Condition | Expected System Response |
|----|----------------|-----------|--------------------------|
| RR-01 | "How do I return these shoes?" | Clothing | Return allowed within **10 days of purchase**, unworn with original tag intact |
| RR-02 | "How do I return my fridge?" | Electronics | Return allowed within **20 days of purchase**, provide return process |
| RR-03 | "I want to return my Coach bag" | Furniture | Return allowed within **7 days of delivery**, in original packaging |
| RR-04 | "How do I return this?" | Product category missing | Ask customer to specify "Clothing, Electronics, or Furniture" |
| RR-05 | "I bought this one month ago" | Return window expired | Inform customer that the return window has expired and direct them to support |
| RR-06 | "What's my return status?" | Return status inquiry | Inform customer that returns are processed within **4–7 working days** after receipt and inspection |
