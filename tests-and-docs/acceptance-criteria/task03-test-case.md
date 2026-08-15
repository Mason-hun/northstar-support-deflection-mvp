# TASK03 — Test Case & Acceptance Criteria

# Purpose

This document defines the acceptance criteria for the Order Status and Returns & Refunds customer-support flows.
The criteria are used to verify that the implemented system produces the expected response for each supported customer scenario.

# Order Status

ID| Customer Input| Condition| Expected System Response
|---|---|---|---|
OS-01 | Where is my order 110?| Valid — shipped| Display order 110 as Shipped and show expected delivery date
OS-02 | Has order 300 been shipped?| Valid — processing| Display order 300 as Processing and show expected delivery date
OS-03 | Where is my order?| Order ID missing| Ask customer to provide their order number
OS-04 | Order 113| Valid format, order does not exist| Display Order not found and ask customer to verify the order number
OS-05 | Order 300*| Invalid input format| Display a clear validation message requesting a valid order number

# Returns & Refunds

ID| Customer Input|condition| Expected System Response
|---|---|---|---|
RR-01| How do I return these boxers?| Clothing |can be returned within 10 days of purchase, unworn with original tag intact
RR-02| How do I return my fridge?| Electronic |can be returned within 20 days of purchase. Customer should visit the return portal
RR-03| I want to return my Coach| Furniture | can be returned within 7 days of delivery in the original packaging
RR-04| How do I return?| Product category missing |Ask customer to confirm the category: electronics, furniture, or clothing
RR-05| I bought this 1 month ago|Return window expired |Inform customer that the return window has expired and advise contacting customer support
RR-06| Return status|Return-status inquiry |Returns are processed within 4–7 working days after the returned item is received and inspected

## Verification

These acceptance criteria are implemented through the backend Order Status and Returns & Refunds APIs and supported by automated tests.

Current automated test result:

14/14 tests passing ✅
