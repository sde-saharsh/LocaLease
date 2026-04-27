## Renter Auth Routes

### Register Renter
### POST `/api/auth/renter/register`

- No auth needed
- URL: `{{BASE_URL}}/api/auth/renter/register`
- Headers:
  - `Content-Type: application/json`
- Body:

```json
{
  "name": "Test Renter",
  "email": "testrenter1@example.com",
  "password": "password123",
  "phone": "9123456780",
  "role": "renter"
}
```

Save returned `token` as `TOKEN_RENTER`.

### Login Renter
### POST `/api/auth/renter/login`

- No auth needed
- URL: `{{BASE_URL}}/api/auth/renter/login`
- Headers:
  - `Content-Type: application/json`
- Body:

```json
{
  "email": "testrenter1@example.com",
  "password": "password123"
}
```

Save returned `token` as `TOKEN_RENTER`.

---

  "role": "renter"
}
```

Save token as `TOKEN_RENTER`.

### 3.1 Create Rental Request
### POST `/api/requests`

- Auth required
- URL: `{{BASE_URL}}/api/requests`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{TOKEN_RENTER}}`
- Body:

```json
{
  "itemId": "{{ITEM_ID}}",
  "startDate": "2026-05-01",
  "endDate": "2026-05-03",
  "totalPrice": 5000,
  "message": "Need it for a short shoot."
}
```

Save returned `_id` as `REQUEST_ID`.

### 3.2 Get Requests (Role-based)
### GET `/api/requests`

- Auth required
- URL: `{{BASE_URL}}/api/requests`
- Headers:
  - For renter view: `Authorization: Bearer {{TOKEN_RENTER}}`
  - For lender view: `Authorization: Bearer {{TOKEN_LENDER}}`

### 3.3 Get My Requests (Renter)
### GET `/api/requests/my`

- Auth required
- URL: `{{BASE_URL}}/api/requests/my`
- Headers:
  - `Authorization: Bearer {{TOKEN_RENTER}}`

### 3.4 Get Lender Requests
### GET `/api/requests/lender`

- Auth required
- URL: `{{BASE_URL}}/api/requests/lender`
- Headers:
  - `Authorization: Bearer {{TOKEN_LENDER}}`

### 3.5 Update Request Status
### PUT `/api/requests/:id`

- Auth required (lender/admin)
- URL: `{{BASE_URL}}/api/requests/{{REQUEST_ID}}`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{TOKEN_LENDER}}`
- Body:

```json
{
  "status": "accepted"
}
```

Try other values:
- `pending`
- `accepted`
- `rejected`
- `completed`

---

## Recommended Postman Variables

Create an environment and add:

- `BASE_URL`
- `TOKEN_LENDER`
- `TOKEN_RENTER`
