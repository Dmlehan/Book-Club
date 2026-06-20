# 📬 Book-Club API – Postman Usage Guide

This guide explains how to import and use the Postman collection to test the **Book-Club Library API** backend.

---

## ⚙️ Prerequisites

1. **Server Running**: Make sure your backend server is running (`npm run dev` inside the `Backend/` directory).
2. **MongoDB Connected**: Ensure MongoDB is running locally on the default port `27017`.
3. **Postman Installed**: Download from [https://www.postman.com/downloads/](https://www.postman.com/downloads/).

---

## 📥 Import the Collection

1. Open **Postman**.
2. Click **Import** in the top-left corner.
3. Select the file: `Backend/Book-Club-API.postman_collection.json`.
4. The **Book-Club Library API** collection will appear in your sidebar.

---

## 🔑 Authentication Flow (How the Token Works)

> **All protected routes require a JWT Bearer token.** The collection is set up to automatically handle this for you — you just need to login once.

### Step 1 — Register a Staff User
*(Skip if you already have an account)*

Open the **🔐 Authentication → Register Staff User** request and click **Send**.

| Field | Value |
|-------|-------|
| URL | `POST http://localhost:5000/api/auth/register` |
| username | `librarian1` |
| password | `securepassword123` |
| name | `Jane Doe` |

✅ Expected response: `201 Created`

---

### Step 2 — Login to Get JWT Token

Open the **🔐 Authentication → Login** request and click **Send**.

| Field | Value |
|-------|-------|
| URL | `POST http://localhost:5000/api/auth/login` |
| username | `librarian1` |
| password | `securepassword123` |

✅ Expected response: `200 OK` with a `token` field.

> 🪄 **The token is automatically saved** to the `{{token}}` collection variable by the test script embedded in the request. All other protected requests already use `{{token}}` in their Authorization header — so you're ready to go!

---

## 📋 Collection Variables Reference

These variables are **automatically set** when you run certain requests:

| Variable | Set By | Used By |
|----------|--------|---------|
| `{{baseUrl}}` | Default: `http://localhost:5000` | All requests |
| `{{token}}` | **Login** request (auto-set) | All protected requests |
| `{{readerId}}` | **Create Reader** request (auto-set) | Get/Update/Delete Reader |
| `{{bookId}}` | **Add Book** request (auto-set) | Get/Update/Delete Book |

To change the base URL (e.g. for a deployed server), click the collection name → **Variables** tab → update `baseUrl`.

---

## 🛠️ Recommended Testing Order

Follow this order for the best testing experience, as later requests depend on data created earlier:

```
1. Health Check
2. Register Staff User
3. Login                     ← Sets {{token}}
4. Create Reader              ← Sets {{readerId}}
5. Get All Readers
6. Get Reader by ID           ← Uses {{readerId}}
7. Update Reader              ← Uses {{readerId}}
8. Add Book to Catalog        ← Sets {{bookId}}
9. Get All Books
10. Search Books by Keyword
11. Filter Books by Author / Title / ISBN
12. Get Book by ID            ← Uses {{bookId}}
13. Update Book               ← Uses {{bookId}}
14. Delete Book               ← Uses {{bookId}}
15. Delete Reader             ← Uses {{readerId}}
```

---

## 🌐 API Endpoint Reference

### 🔍 Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | ❌ None | Verifies the server is running |

---

### 🔐 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ None | Register a new library staff user |
| `POST` | `/api/auth/login` | ❌ None | Login and receive a JWT token |

**Register Body:**
```json
{
  "username": "librarian1",
  "password": "securepassword123",
  "name": "Jane Doe"
}
```

**Login Body:**
```json
{
  "username": "librarian1",
  "password": "securepassword123"
}
```

**Login Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "user": {
    "id": "...",
    "username": "librarian1",
    "name": "Jane Doe"
  }
}
```

---

### 👥 Readers

All reader endpoints require a **Bearer token** in the Authorization header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/readers` | ✅ Required | Register a new reader |
| `GET` | `/api/readers` | ✅ Required | Get all readers |
| `GET` | `/api/readers/:id` | ✅ Required | Get a specific reader |
| `PUT` | `/api/readers/:id` | ✅ Required | Update reader details |
| `DELETE` | `/api/readers/:id` | ✅ Required | Delete a reader |

**Create Reader Body:**
```json
{
  "readerId": "R202401",
  "name": "Alice Cooper",
  "email": "alice.cooper@example.com",
  "phone": "+15550199"
}
```

**Update Reader Body (partial update supported):**
```json
{
  "name": "Alice M. Cooper",
  "phone": "+15550200"
}
```

**Audit Events Triggered:**
- `CREATE_READER` — on successful creation
- `UPDATE_READER` — on update with changed fields
- `DELETE_READER` — on deletion

---

### 📚 Books

GET endpoints are **public**. POST, PUT, DELETE require a **Bearer token**.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/books` | ✅ Required | Add a book to the catalog |
| `GET` | `/api/books` | ❌ None | Get all books (supports search/filter) |
| `GET` | `/api/books?search=keyword` | ❌ None | Search across title, author, isbn, genre |
| `GET` | `/api/books?title=...` | ❌ None | Filter by title (partial match) |
| `GET` | `/api/books?author=...` | ❌ None | Filter by author (partial match) |
| `GET` | `/api/books?isbn=...` | ❌ None | Filter by ISBN |
| `GET` | `/api/books?genre=...` | ❌ None | Filter by genre |
| `GET` | `/api/books/:id` | ❌ None | Get a specific book by ID |
| `PUT` | `/api/books/:id` | ✅ Required | Update book details |
| `DELETE` | `/api/books/:id` | ✅ Required | Delete a book from catalog |

**Add Book Body:**
```json
{
  "title": "The Hobbit",
  "author": "J.R.R. Tolkien",
  "isbn": "9780261102217",
  "genre": "Fantasy",
  "totalCopies": 3,
  "availableCopies": 3
}
```

**Update Book Body (partial update supported):**
```json
{
  "totalCopies": 5,
  "availableCopies": 5
}
```

**Audit Events Triggered:**
- `CREATE_BOOK` — on successful creation
- `UPDATE_BOOK` — on update with changed fields
- `DELETE_BOOK` — on deletion

---

## 🔒 How to Manually Add a Token (if needed)

If the auto-save script doesn't work:
1. Run the **Login** request and copy the `token` value from the response.
2. Click the collection name in the sidebar → **Variables** tab.
3. Set the **Current Value** of `token` to your copied JWT string.
4. Click **Save**.

All other requests will now use your token.

---

## ⚠️ Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| `401` | Not authorized, token missing | Forgot to login first or token expired |
| `400` | Username is already taken | Register with a different username |
| `400` | A book with this ISBN already exists | Use a unique ISBN for each book |
| `404` | Reader/Book not found | The ID in the URL doesn't exist in DB |
| `500` | Internal server error | Check the terminal running `npm run dev` |
