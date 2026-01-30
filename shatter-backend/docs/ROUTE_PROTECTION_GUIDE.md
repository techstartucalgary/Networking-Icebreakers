# Route Protection Guide

This guide explains how to protect API routes using JWT authentication middleware in the Shatter backend.

## Overview

The authentication system uses JSON Web Tokens (JWT) to secure API endpoints. When a user logs in, they receive a token that must be included in subsequent requests to access protected routes.

## How to Protect Routes

### 1. Import the Auth Middleware

In your route file, import the `authMiddleware`:

```typescript
import { authMiddleware } from '../middleware/auth_middleware';
```

### 2. Apply Middleware to Routes

Add the middleware before your controller function:

```typescript
router.put('/:userId', authMiddleware, updateUserProfile);
router.post('/create', authMiddleware, createEvent);
```

### 3. Access User Info in Controllers

Protected routes can access the authenticated user's ID via `req.user`:

```typescript
export const updateUserProfile = async (req: Request, res: Response) => {
  const userId = req.user?.userId;  // Authenticated user's ID

  // Verify user is updating their own profile
  if (req.user?.userId !== req.params.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // ... rest of controller logic
};
```

## Example: Protected Route

Here's a complete example of a protected route:

**File:** `src/routes/user_route.ts`

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth_middleware';
import { getUserProfile, updateUserProfile } from '../controllers/user_controller';

const router = Router();

// Public route - no auth required
router.get('/:userId', getUserProfile);

// Protected route - requires valid JWT token
router.put('/:userId', authMiddleware, updateUserProfile);

export default router;
```

## Routes Classification

### Public Routes (No Authentication Required)

These routes should be accessible without a token:

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/events` - List all events
- `GET /api/events/:eventId` - View event details

### Protected Routes (Authentication Required)

These routes require a valid JWT token in the Authorization header:

#### User Management
- `GET /api/users/me` - Get current user's profile
- `PUT /api/users/:userId` - Update user profile (user can only update their own)

#### Event Management
- `POST /api/events/create` - Create new event
- `PUT /api/events/:eventId/status` - Update event status (host only)
- `DELETE /api/events/:eventId` - Cancel event (host only)

#### Participation
- `POST /api/events/:eventId/join` - Join an event
- `POST /api/events/:eventId/leave` - Leave an event

## Testing Protected Routes

### Using Postman

1. **Login to get a token:**
   ```
   POST http://localhost:4000/api/auth/login
   Body: { "email": "user@example.com", "password": "password123" }
   ```

   Response will include a `token` field.

2. **Use the token for protected routes:**
   ```
   GET http://localhost:4000/api/users/me
   Headers:
     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Save token as environment variable:**
   - In Postman, create an environment variable: `AUTH_TOKEN`
   - After login, save the token: `AUTH_TOKEN = {{response.token}}`
   - Use in headers: `Authorization: Bearer {{AUTH_TOKEN}}`

### Using curl

```bash
# Login and save token
TOKEN=$(curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.token')

# Use token for protected route
curl http://localhost:4000/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

## Error Responses

### Missing Token
```json
{
  "error": "Authorization header missing"
}
```
**Status Code:** 401 Unauthorized

### Invalid Token Format
```json
{
  "error": "Invalid authorization format. Use: Bearer <token>"
}
```
**Status Code:** 401 Unauthorized

### Invalid or Malformed Token
```json
{
  "error": "Invalid token. Please login again."
}
```
**Status Code:** 401 Unauthorized

### Expired Token
```json
{
  "error": "Token expired. Please login again."
}
```
**Status Code:** 401 Unauthorized

## Authorization Header Format

The authorization header must follow this exact format:

```
Authorization: Bearer <token>
```

Where `<token>` is the JWT string returned from the login endpoint.

**Example:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzNhYmMxMjMiLCJpYXQiOjE3MDUzMzQ0MDAsImV4cCI6MTcwNzkyNjQwMH0.signature
```

## Token Structure

The JWT token contains three parts separated by dots (`.`):

1. **Header:** Algorithm and token type
2. **Payload:** User data (userId, issued at, expiration)
3. **Signature:** Cryptographic signature

**Decoded Payload Example:**
```json
{
  "userId": "673abc123def456",
  "iat": 1705334400,
  "exp": 1707926400
}
```

- `userId`: The authenticated user's MongoDB _id
- `iat`: Issued at timestamp (Unix time)
- `exp`: Expiration timestamp (Unix time, 30 days from issue)

## Security Best Practices

1. **Never expose JWT_SECRET** - Keep it in `.env` file and never commit to git
2. **Use HTTPS in production** - Tokens should only be transmitted over secure connections
3. **Token expiration** - Tokens expire after 30 days (configurable in `jwt_utils.ts`)
4. **Validate user ownership** - Always verify users can only modify their own resources
5. **Don't trust client data** - Always validate using `req.user` from the middleware

## Troubleshooting

### Token Not Working
- Verify the token format: `Authorization: Bearer <token>`
- Check if token is expired (decode at https://jwt.io)
- Ensure `JWT_SECRET` in `.env` matches the one used to generate the token
- Verify the middleware is correctly applied to the route

### req.user is undefined
- Ensure `authMiddleware` is applied before the controller
- Check that the token was successfully verified (no 401 errors)
- Verify the TypeScript declaration for `req.user` is properly imported

## Related Files

- **JWT Utilities:** `src/utils/jwt_utils.ts`
- **Auth Middleware:** `src/middleware/auth_middleware.ts`
- **Auth Controller:** `src/controllers/auth_controller.ts`
- **User Routes Example:** `src/routes/user_route.ts`

## Additional Resources

- [JWT.io](https://jwt.io) - Decode and verify JWT tokens
- [JSON Web Tokens Introduction](https://jwt.io/introduction)
