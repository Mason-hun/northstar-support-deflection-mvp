Northstar Support Deflection MVP

A customer-support automation MVP designed to reduce repetitive support queries by providing automated responses for common order status and returns & refunds requests.

Project Status

🚧 MVP — Backend flows implemented and ready for frontend integration

Implemented

- Order Status flow
- Returns & Refunds flow
- Input validation
- Return-window eligibility logic
- Automated backend tests
- Environment-based Django configuration

Test Status

14/14 automated tests passing ✅

---

Tech Stack

Backend

- Python
- Django
- SQLite (development)
- Django REST-style JSON endpoints

Development

- Git & GitHub
- Python virtual environment
- ".env" environment configuration

---

Project Structure

northstar-support-deflection-mvp/
│
├── backend/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── support/
│   │   ├── migrations/
│   │   ├── return_policies.py
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── tests.py
│   │   └── admin.py
│   │
│   ├── manage.py
│   └── requirements.txt
│
├── .gitignore
└── README.md

---

Getting Started

1. Clone the repository

git clone <repository-url>
cd northstar-support-deflection-mvp

2. Create and activate a virtual environment

From the "backend" directory:

cd backend
python -m venv .venv

Activate it on Git Bash:

source .venv/Scripts/activate

On Windows Command Prompt:

.venv\Scripts\activate

---

3. Install dependencies

python -m pip install -r requirements.txt

---

4. Configure environment variables

Create:

backend/.env

Add:

SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

«Never commit ".env" to Git. It is excluded through ".gitignore".»

---

5. Apply migrations

python manage.py migrate

---

6. Run the development server

python manage.py runserver

The backend will be available at:

http://127.0.0.1:8000/

---

API Endpoints

Base URL:

http://127.0.0.1:8000/api/

Order Status

Get order status

GET /api/orders/{order_id}

Example:

GET /api/orders/110

Successful response:

{
  "order_id": 110,
  "status": "Shipped",
  "expected_delivery": "2026-06-14"
}

Missing order ID

GET /api/orders/

Returns:

{
  "error": "Order number required",
  "message": "Please provide your order number."
}

Order not found

Example:

GET /api/orders/113

Returns HTTP "404":

{
  "error": "Order not found",
  "message": "Please verify your order number."
}

Invalid order number

Example:

GET /api/orders/300*

Returns HTTP "400":

{
  "error": "Invalid order number",
  "message": "Please provide a valid order number."
}

---

Returns & Refunds

Get return policy

GET /api/returns/{category}

Supported categories:

- "clothing"
- "electronics"
- "furniture"

Examples:

GET /api/returns/clothing
GET /api/returns/electronics
GET /api/returns/furniture

Missing category

GET /api/returns/

Returns a validation response asking the customer to select a category.

Check return eligibility

GET /api/returns/{category}/check?purchase_date=YYYY-MM-DD

Example:

GET /api/returns/clothing/check?purchase_date=2026-08-10

The endpoint evaluates the purchase date against the configured return window for the selected category.

It also validates:

- Missing purchase date
- Invalid date format
- Future purchase dates
- Expired return windows

Return status

GET /api/returns/status

Returns information about the expected return-processing period.

---

Return Policies

Category| Return Window| Conditions
Clothing| 10 days| Unworn with original tag intact
Electronics| 20 days| Visit the return portal
Furniture| 7 days| Original packaging

Returns are processed within 4–7 working days after the returned item is received and inspected.

---

Testing

Run the complete test suite with:

python manage.py test

Current result:

Ran 14 tests
OK

The test suite covers:

Order Status

- Valid shipped order
- Valid processing order
- Missing order ID
- Non-existent order
- Invalid order ID format

Returns & Refunds

- Clothing return policy
- Electronics return policy
- Furniture return policy
- Missing category
- Expired return window
- Return status
- Eligible return
- Invalid purchase date
- Future purchase date

---

Development Workflow

The project uses feature/chore branches and pull requests for collaborative development.

Recommended workflow:

git checkout -b <branch-name>

Make changes, test locally, then:

python manage.py test

Review the changes:

git status
git diff

Commit:

git add .
git commit -m "type: description"

Push:

git push -u origin <branch-name>

Create a pull request for review before merging into the main development branch.

---

Security

Sensitive configuration is stored in environment variables rather than committed directly into the repository.

The following files and values should not be committed:

- ".env"
- Django secret keys
- Production credentials
- API keys
- Database credentials

For production deployment, Django security settings such as "DEBUG", "ALLOWED_HOSTS", HTTPS, secure cookies, and other deployment-specific settings must be reviewed and configured appropriately.

---

Current MVP Scope

The current backend supports:

Customer Request
       │
       ├── Order Status
       │      ├── Validate order number
       │      ├── Find order
       │      └── Return status + delivery date
       │
       └── Returns & Refunds
              ├── Identify category
              ├── Return policy
              ├── Check eligibility
              └── Return processing status

The backend APIs are currently ready for frontend integration.

---

Future Work

Potential future improvements include:

- Customer-support conversational interface
- Frontend integration
- Authentication and authorization
- Production database
- Persistent customer/order data
- Additional support-deflection flows
- Improved API documentation
- Production deployment
- Monitoring and logging
- Expanded automated and end-to-end testing

---

Contributing

1. Create a feature or chore branch.
2. Implement the change.
3. Add or update tests.
4. Ensure all tests pass.
5. Commit with a meaningful message.
6. Open a pull request.
7. Address review feedback.
8. Merge after approval.

---

Team

Northstar Support Deflection MVP — collaborative team project.
