# Username Popup Setup Guide

## Overview
This feature adds a username input popup that appears after wallet connection for new users. The username is saved to the Supabase database.

## Features
- ✅ Username input popup after wallet connection
- ✅ Form validation (3-50 characters, alphanumeric + underscore/hyphen)
- ✅ Supabase database integration
- ✅ Error handling and loading states
- ✅ Responsive design

## Setup Instructions

### 1. Backend Configuration
Create a `.env` file in the `backend/` directory with your Supabase credentials:

```env
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Database Setup
Ensure your Supabase project has a `users` table with the following structure:

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  wallet_address VARCHAR(44) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Frontend Configuration
The frontend will automatically connect to the backend API at `http://localhost:4000/api` by default.

To use a different API URL, set the environment variable:
```env
NEXT_PUBLIC_API_URL=http://your-api-url/api
```

## How It Works

1. **Wallet Connection**: User connects their Solana wallet
2. **User Check**: System checks if user exists in database by wallet address
3. **Existing User**: If found, user is logged in with their username
4. **New User**: If not found, username popup appears
5. **Username Input**: User enters desired username with validation
6. **Account Creation**: Username and wallet address are saved to Supabase
7. **Completion**: User is logged in and can use the application

## API Endpoints

- `GET /api/users/wallet/:wallet_address` - Get user by wallet address
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `GET /api/users` - Get all users

## Components

### UsernameModal
- Located: `frontend/src/components/UsernameModal.tsx`
- Props: `isOpen`, `onClose`, `onSubmit`, `loading`, `error`
- Features: Form validation, loading states, error display

### WalletButton
- Updated to include the username modal
- Handles the wallet connection flow
- Shows appropriate loading states

### UserService
- Located: `frontend/src/lib/user-service.ts`
- Handles all API calls to backend
- Type-safe with TypeScript interfaces

## Error Handling

The system handles various error scenarios:
- Username already taken
- Invalid username format
- Network errors
- Supabase connection issues
- Wallet connection failures

## Testing

To test the feature:
1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Connect a wallet that hasn't been used before
4. Enter a username when prompted
5. Verify the user appears in your Supabase database

## Troubleshooting

### Common Issues:
1. **"Failed to check user status"**: Check Supabase credentials in `.env`
2. **"Username already exists"**: Try a different username
3. **"Invalid wallet address format"**: Ensure wallet address is 44 characters
4. **CORS errors**: Verify `CORS_ORIGIN` in backend `.env`

### Debug Mode:
Enable console logging by opening browser dev tools to see detailed logs of the wallet connection and user creation process.
