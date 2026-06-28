# QueryMind Frontend - BE-Project Integration Setup

## Overview
The QueryMind Frontend is now fully integrated with the BE-Project Backend. This document walks you through the setup and running both services together.

## Architecture

```
QueryMind Frontend (React + Vite)
├── Port: 8000
├── API Calls: http://localhost:8080
└── Routes: /, /auth, /workspace

BE-Project Backend (Express.js)
├── Port: 8080
├── Endpoints: /user, /workspace
└── Database: PostgreSQL/MySQL
```

## Prerequisites

### Frontend Requirements
- Node.js 16+ (or compatible version)
- Bun (optional, for faster package management)

### Backend Requirements
- Node.js 16+
- PostgreSQL 12+ or MySQL 5.7+
- Database connection configured

## Setup Instructions

### 1. Frontend Setup

#### Install Dependencies
```bash
cd d:\QueryMind_Frontend
npm install
# or if using bun:
bun install
```

#### Environment Configuration
The `.env` file is already created with default values:
```
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=QueryMind
VITE_ENV=development
```

**For different environments:**
- **Local Development**: No changes needed (default `localhost:8080`)
- **Remote Backend**: Update `VITE_API_BASE_URL` to your backend URL
  ```
  VITE_API_BASE_URL=https://yourdomain.com
  ```

### 2. Backend Setup

#### Install Dependencies
```bash
cd d:\BE-Project
npm install
```

#### Database Configuration
Edit `.env` in BE-Project to match your database:

**PostgreSQL (Recommended)**:
```
LOCAL_DB_TYPE=postgres
PG_DATABASE_USER=postgres
PG_DATABASE_HOST=localhost
PG_DATABASE_NAME=local_db_setup
PG_DATABASE_PORT=5432
```

**MySQL**:
```
LOCAL_DB_TYPE=mysql
MYSQL_DATABASE_USER=root
MYSQL_DATABASE_HOST=localhost
MYSQL_DATABASE_PORT=3306
MYSQL_DATABASE_PASSWORD=your_password
```

#### Database Initialization
The backend automatically sets up the database schema on first run. Required tables:
- `userinfos` - User accounts and authentication
- `workspaces` - User workspaces
- `conversations` - Chat conversations
- `messages` - Chat messages

### 3. CORS Configuration

The backend is already configured to accept requests from the frontend:

**Current CORS Origins** (in `.env`):
```
CORS_ORIGIN=http://localhost:3000,http://localhost:8000
```

This allows:
- `http://localhost:8000` - Local frontend
- `http://localhost:3000` - Alternative port (if needed)

**For Production**: Update CORS_ORIGIN to your frontend domain:
```
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

## Running the Services

### Option 1: Development Mode (Recommended for Testing)

#### Terminal 1 - Start Backend
```bash
cd d:\BE-Project
npm start
# Expected output:
# ✅ PostgreSQL detected — setting up connection...
# 🚀 Application running on port 8080
# ✅ Routes registered and ready
```

#### Terminal 2 - Start Frontend
```bash
cd d:\QueryMind_Frontend
npm run dev
# Expected output:
# Local:        http://localhost:8000
# press h + enter to show help
```

#### Access Application
- **Frontend**: http://localhost:8000
- **API**: http://localhost:8080
- **Backend Routes**: 
  - `POST /user/register` - Register new user
  - `POST /user/login` - User login
  - `GET /workspace/getWorkspaces` - Get user workspaces
  - `POST /workspace/addWorkspaces` - Create workspace
  - `POST /workspace/connectWorkspace` - Connect to database
  - `POST /workspace/fetchQuery` - Execute query

### Option 2: Using PM2 (Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd d:\BE-Project
pm2 start index.js --name "be-project"

# Start frontend build process
cd d:\QueryMind_Frontend
npm run build
pm2 serve dist 8000 --name "querymind-frontend"

# View logs
pm2 logs
```

## API Integration Flow

### 1. Authentication Flow
```
Frontend (Auth Page)
  ↓ POST /user/register or /user/login
Backend (loginController)
  ↓ Generate JWT Token
Frontend (StorageContext via auth.js)
  ↓ Store token in localStorage as 'authToken'
  ↓ Store user info in localStorage as 'currentUser'
Protected Routes
  ↓ Auth.jsx checks currentUser, shows Protected Route
```

### 2. Workspace Flow
```
Frontend (Workspace Page)
  ↓ useWorkspace hook triggers useEffect
Backend (workspaceController)
  ↓ GET /workspace/getWorkspaces (requires auth token)
Frontend (WorkspaceContext)
  ↓ Store workspaces, set current workspace
  ↓ Load query history from localStorage
```

### 3. Authenticated Requests
All requests after login include the JWT token:
```javascript
Authorization: Bearer <jwt_token>
```

This is handled automatically by `apiCall()` function in `src/lib/auth.js`.

## Key Files Modified

### Frontend Files
| File | Changes |
|------|---------|
| `src/lib/auth.js` | Added token management, authenticated API calls, workspace endpoints |
| `src/context/WorkspaceContext.jsx` | Integrated with backend API, added loading/error states |
| `.env` | Frontend API configuration |
| `.env.example` | Configuration template |

### Backend Files
| File | Changes |
|------|---------|
| `controllers/userControllers/loginController.js` | Returns userID, userName, useremail with token |

## Troubleshooting

### Frontend can't connect to backend
**Problem**: CORS error or "Cannot reach http://localhost:8080"

**Solutions**:
1. Verify backend is running: `http://localhost:8080/health`
2. Check `CORS_ORIGIN` in backend `.env`
3. Verify frontend `.env` has correct API URL: `VITE_API_BASE_URL=http://localhost:8080`
4. Restart both services

### Login fails with "Invalid credentials"
**Problem**: User registration or login returns error

**Check**:
1. Database is running and accessible
2. Tables exist: `userinfos` table should exist
3. User exists in database
4. Password is correct (case-sensitive)

### Token issues after login
**Problem**: Authenticated routes fail, redirects to login

**Check**:
1. Verify `authToken` is stored in localStorage
2. Check browser DevTools → Application → Local Storage
3. Verify JWT_SECRET matches between services
4. Clear localStorage and login again: `localStorage.clear()`

### Port conflicts
**Problem**: Port 8000 or 8080 already in use

**Solutions**:
```bash
# Change frontend port in vite.config.js
# Change to port 8001 if 8000 is used
server: { port: 8001 }

# Change backend port in .env
PORT=8081
# Then update frontend .env: VITE_API_BASE_URL=http://localhost:8081
```

## Testing the Integration

### 1. Test Backend API
```bash
# Test health
curl http://localhost:8080

# Test registration
curl -X POST http://localhost:8080/user/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","useremail":"test@example.com","userpassword":"password123"}'

# Test login
curl -X POST http://localhost:8080/user/login \
  -H "Content-Type: application/json" \
  -d '{"useremail":"test@example.com","userPassword":"password123"}'
```

### 2. Test Frontend Flow
1. Navigate to http://localhost:8000
2. Click "Sign Up"
3. Enter email, password, name
4. Click "Sign Up" button
5. Should redirect to workspace page
6. Verify workspaces are loaded from backend

### 3. Check Browser Console
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab to see API requests
4. Check Application → Local Storage for tokens

## Next Steps

After successful integration:

1. **Add Workspace Database Connection**
   - Implement database connection UI
   - Test with real database connections

2. **Implement Query Execution**
   - Connect to NL2SQL-AI-Server (port 9001)
   - Test NL→SQL conversion

3. **Add WebSocket Support** (Optional)
   - For real-time query results
   - Already configured in cloud-backend

4. **Deploy to Production**
   - See deployment guide in projects
   - Use cloud-backend for EC2 deployment
   - Frontend can be served by Nginx

## Environment Variables Reference

### Frontend (.env)
```
VITE_API_BASE_URL     - Base URL for API calls
VITE_APP_NAME         - Application name for display
VITE_ENV              - Environment (development/production)
```

### Backend (.env)
```
PORT                  - Server port (default: 8080)
NODE_ENV              - Environment
JWT_SECRET            - JWT signing key
CORS_ORIGIN           - Allowed origins for CORS
LOCAL_DB_TYPE         - Database type (postgres/mysql)
PG_DATABASE_*         - PostgreSQL connection details
MYSQL_DATABASE_*      - MySQL connection details
```

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs: `npm run dev`
3. Verify database connectivity
4. Ensure all services are running on expected ports

---

**Last Updated**: 2026-04-19
**Version**: 1.0
