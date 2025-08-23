# Metrix Authentication System

## Overview

Metrix includes a simple, self-hosted authentication system designed for small research deployments (1-2 users). The system supports both modern user account management and legacy password-only authentication.

## Setup Modes

### 1. First-Time Setup (Recommended)
When you first deploy Metrix:
1. Visit your domain (e.g., `http://localhost:3000`)
2. Click "Log In" to be redirected to the setup page
3. Create your admin account with email and password
4. You'll be automatically logged in to the dashboard

### 2. Legacy Mode
If you prefer password-only authentication:
1. Set `ADMIN_PASSWORD` in your `.env` file
2. Don't create any user accounts
3. Login will only require the admin password

## Environment Variables

```bash
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/metrix

# JWT secret for tokens (generate a secure random string)
JWT_SECRET=your-secure-jwt-secret-here

# Optional: Admin password for legacy mode
ADMIN_PASSWORD=your-admin-password

# Environment
NODE_ENV=development
```

## Features

- **Simple Setup**: One-time admin account creation
- **Secure Authentication**: bcrypt password hashing + JWT tokens
- **Legacy Support**: Backward compatible with password-only auth
- **Self-Hosted**: No external dependencies or services
- **Minimal Users**: Designed for 1-2 researchers

## API Endpoints

- `POST /api/auth/setup` - Create first admin user
- `GET /api/auth/setup-status` - Check if setup is required
- `POST /api/auth/login` - Login with email/password or legacy password
- `GET /api/auth/verify` - Verify JWT token

## Security Notes

1. **JWT Secret**: Generate a strong, random JWT secret
2. **Password Requirements**: Minimum 8 characters required
3. **Token Expiry**: JWT tokens expire after 24 hours
4. **HTTPS**: Use HTTPS in production
5. **Database**: Passwords are hashed with bcrypt (12 rounds)

## Deployment

### Local Development
```bash
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

### Production
1. Set environment variables in your hosting platform
2. Ensure MongoDB is accessible
3. Use a strong JWT_SECRET
4. Enable HTTPS

## Migration from Legacy

If you're upgrading from password-only auth:
1. Keep `ADMIN_PASSWORD` in your environment
2. Visit `/setup` to create your first user account
3. After setup, you can optionally remove `ADMIN_PASSWORD`

## Troubleshooting

- **Setup not working**: Check MongoDB connection and logs
- **Login fails**: Verify JWT_SECRET is set consistently
- **Legacy mode**: Ensure ADMIN_PASSWORD is set if no users exist
- **Token issues**: Check browser console for JWT errors
