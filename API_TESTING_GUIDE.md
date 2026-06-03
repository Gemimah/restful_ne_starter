# 🧪 API TESTING GUIDE

Complete guide for testing your RESTful API during the exam.

---

## 🚀 TESTING TOOLS

### Option 1: Swagger UI (Recommended for Exam)
- **URL:** http://localhost:5000/api-docs
- **Pros:** Built-in, visual, no setup needed
- **Usage:** Click endpoint → Try it out → Fill parameters → Execute

### Option 2: Thunder Client (VS Code Extension)
- **Install:** Search "Thunder Client" in VS Code extensions
- **Pros:** Works inside VS Code, save requests
- **Usage:** Click thunder icon → New Request

### Option 3: Postman
- **Download:** https://www.postman.com/downloads/
- **Pros:** Full-featured, import/export collections
- **Usage:** New → HTTP Request

### Option 4: cURL (Command Line)
- **Pros:** Fast, scriptable
- **Usage:** Copy commands from examples below

---

## 📝 COMPLETE API TEST WORKFLOW

### STEP 1: Register a New User

**Endpoint:** `POST /api/auth/register`

```json
{
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email with the OTP sent.",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "isVerified": false
  }
}
```

**⚠️ Important:** Check server console for OTP (if SMTP not configured):
```
[DEV] OTP for john@example.com: 123456
```

---

### STEP 2: Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

**💡 Save the token** — you'll need it for authenticated requests!

---

### STEP 3: Login (Alternative to Verify OTP)

**Endpoint:** `POST /api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

---

### STEP 4: Get Current User Profile

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "isVerified": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### STEP 5: Test CRUD Operations (Items Example)

#### Create Item

**Endpoint:** `POST /api/items`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "title": "My First Item",
  "description": "This is a test item",
  "status": "ACTIVE"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "title": "My First Item",
    "description": "This is a test item",
    "status": "ACTIVE",
    "userId": "user-uuid",
    "createdAt": "2024-01-15T10:35:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Get All Items (Paginated)

**Endpoint:** `GET /api/items?page=1&limit=10`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "title": "My First Item",
      "description": "This is a test item",
      "status": "ACTIVE",
      "userId": "user-uuid",
      "createdAt": "2024-01-15T10:35:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Get Single Item

**Endpoint:** `GET /api/items/:id`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "title": "My First Item",
    "description": "This is a test item",
    "status": "ACTIVE",
    "userId": "user-uuid",
    "createdAt": "2024-01-15T10:35:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Update Item

**Endpoint:** `PUT /api/items/:id`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Updated Item Title",
  "status": "INACTIVE"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "title": "Updated Item Title",
    "description": "This is a test item",
    "status": "INACTIVE",
    "userId": "user-uuid",
    "createdAt": "2024-01-15T10:35:00.000Z",
    "updatedAt": "2024-01-15T10:40:00.000Z"
  }
}
```

#### Delete Item

**Endpoint:** `DELETE /api/items/:id`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

## 🔐 TESTING ADMIN ENDPOINTS

### Create Admin User Manually

**Option 1: Via Prisma Studio**
```bash
npx prisma studio
```
1. Open `User` table
2. Find your user
3. Change `role` from `USER` to `ADMIN`
4. Save

**Option 2: Via SQL**
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'john@example.com';
```

**Option 3: Via Code (Add to auth.service.js register temporarily)**
```javascript
// In auth.service.js register function
const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name,
    role: 'ADMIN',  // Add this line
    otp,
    otpExpiry,
  },
});
```

### Test Admin-Only Endpoint

Now your token has ADMIN role. Test protected endpoints that require `authorize('ADMIN')`.

---

## 🧪 COMMON TEST SCENARIOS

### Scenario 1: Validation Errors

**Test:** Missing required field

**Request:** `POST /api/items`
```json
{
  "description": "Missing title field"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Title is required"
}
```

### Scenario 2: Unauthorized Access

**Test:** No token provided

**Request:** `GET /api/items` (without Authorization header)

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Scenario 3: Forbidden (Insufficient Permissions)

**Test:** User tries admin endpoint

**Request:** `DELETE /api/items/:id` (as USER role)

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Forbidden"
}
```

### Scenario 4: Not Found

**Test:** Invalid item ID

**Request:** `GET /api/items/invalid-uuid`

**Expected Response (404):**
```json
{
  "success": false,
  "message": "Item not found"
}
```

### Scenario 5: Duplicate Email

**Test:** Register with existing email

**Request:** `POST /api/auth/register`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (409):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Scenario 6: Invalid OTP

**Test:** Wrong OTP code

**Request:** `POST /api/auth/verify-otp`
```json
{
  "email": "john@example.com",
  "otp": "999999"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

### Scenario 7: Expired Token

**Test:** Token older than JWT_EXPIRES_IN

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## 📋 QUICK TEST CHECKLIST

Before submitting your exam, verify:

**Authentication:**
- [ ] Register new user works
- [ ] OTP verification works
- [ ] Login works
- [ ] Get current user works
- [ ] Invalid credentials rejected
- [ ] Missing token rejected (401)

**CRUD Operations:**
- [ ] Create works (201 response)
- [ ] Get all works (pagination included)
- [ ] Get by ID works
- [ ] Update works
- [ ] Delete works
- [ ] Validation errors return 400
- [ ] Not found returns 404

**Authorization:**
- [ ] USER can access user endpoints
- [ ] USER cannot access admin endpoints (403)
- [ ] ADMIN can access admin endpoints
- [ ] Users only see their own data (if required)

**Edge Cases:**
- [ ] Duplicate email rejected (409)
- [ ] Invalid OTP rejected (400)
- [ ] Invalid UUID rejected (400)
- [ ] Expired OTP rejected (400)
- [ ] Business rules enforced (e.g., negative price)

---

## 🛠️ SWAGGER UI TIPS

### How to Use Swagger for Testing

1. **Go to:** http://localhost:5000/api-docs

2. **Test Authentication:**
   - Click `POST /api/auth/register` → Try it out
   - Fill in the request body
   - Click Execute
   - Copy OTP from server console

3. **Set Authorization Token:**
   - After login/verify, copy the token
   - Click "Authorize" button at top
   - Enter: `Bearer YOUR_TOKEN_HERE`
   - Click Authorize
   - Now all protected endpoints will include token

4. **Test Protected Endpoints:**
   - They should now work with your token
   - Green lock icon means authentication required

5. **Test Different Scenarios:**
   - Try invalid data (validation errors)
   - Try without token (unauthorized)
   - Try wrong IDs (not found)

---

## 🔥 PRO TESTING TIPS

1. **Test as you code** — Don't wait until everything is done
2. **Use Swagger first** — It's fastest for exam
3. **Keep token handy** — Save it in notepad
4. **Check server logs** — Errors often show there first
5. **Test happy path first** — Then test error cases
6. **Verify database** — Use Prisma Studio to see data
7. **Test all roles** — Create both USER and ADMIN accounts
8. **Save successful tests** — Document what works

---

## 🐛 DEBUGGING TIPS

**Problem:** 401 Unauthorized  
**Check:** Token included? Token valid? Token format correct?

**Problem:** 403 Forbidden  
**Check:** User role correct? Endpoint requires admin?

**Problem:** 400 Bad Request  
**Check:** Request body format? Required fields? Validation rules?

**Problem:** 404 Not Found  
**Check:** ID exists? UUID format correct? User owns resource?

**Problem:** 500 Internal Server Error  
**Check:** Server logs for details. Often Prisma relation issues.

---

Good luck testing! 🚀
