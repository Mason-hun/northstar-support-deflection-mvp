# TASK-03 — Test Evidence

# Purpose

This document records the automated test verification for the TASK-03 Order Status and Returns & Refunds flows.

## Automated Test Result

The Django automated test suite was executed using:

```python
python manage.py test
```

Result:

Ran 14 tests
OK

All 14 automated tests passed successfully.

---

## Order Status Test Coverage

The automated tests cover:

- Valid shipped order
- Valid processing order
- Missing order ID
- Non-existent order
- Invalid order ID format

These correspond to the OS-01 through OS-05 acceptance criteria.

---

## Returns & Refunds Test Coverage

The automated tests cover:

- Clothing return policy
- Electronics return policy
- Furniture return policy
- Missing return category
- Expired return window
- Return status
- Eligible return
- Invalid purchase date
- Future purchase date

These tests verify both normal behavior and validation/edge cases.

---

## Verification Status

Area| Result
|---|---|
Order Status| PASS
Returns & Refunds| PASS
Input Validation| PASS
Return Eligibility| PASS
Automated Test Suite| 14/14 PASS

Overall status: PASS ✅



