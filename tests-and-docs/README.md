# Tests & Documentation

This directory contains project-level acceptance criteria, API documentation, test evidence, and supporting project documentation for the Northstar Support Deflection MVP.

The purpose of this directory is to document what the system is expected to do and how the implemented flows are verified, while application code and automated unit tests remain within their respective project directories.

# Directory Structure

```text
tests-and-docs/
├── acceptance-criteria/
├── API-project-documents/
├── Test-evidence/
└── README.md
```

## acceptance-criteria/

Contains the requirements and acceptance criteria used to define the expected behavior of project features.

For TASK-03, this includes:

- OS-01 to OS-05 — Order Status
- RR-01 to RR-06 — Returns & Refunds

## API-project-documents/

Contains documentation describing the APIs, endpoints, expected responses, validation behavior, and other project-level technical information.

## Test-evidence/

Contains records of test execution and verification results, including automated test results and supporting evidence where applicable.

### Relationship to Application Tests

The actual automated Django tests remain inside the backend application:

backend/support/tests.py

The "tests-and-docs/" directory does not replace those tests.

Instead:

backend/support/tests.py
        ↓
Verifies that the implementation works

tests-and-docs/
        ↓
Documents what the system is expected to do
and provides project-level verification evidence

### Current Verification Status

The TASK-03 backend implementation currently has:

14/14 automated tests passing ✅

The documentation in this directory should remain aligned with the actual implementation and should be updated whenever acceptance criteria, API behavior, or testing procedures change.
