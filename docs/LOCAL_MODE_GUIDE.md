# Local Mode Guide

## Overview

EventDAO now runs in **Local Mode** - a completely self-contained version that works without any external dependencies like databases or cloud services.

## What is Local Mode?

Local Mode means:
- ✅ **No Database**: All data is handled in memory
- ✅ **No External APIs**: No calls to external services
- ✅ **No Environment Variables**: No configuration needed
- ✅ **Works Offline**: Fully functional without internet
- ✅ **Fast Development**: No setup or configuration required

## How It Works

### Data Storage
- **Users**: Created locally when wallet connects
- **Events**: Stored in memory during session
- **Transactions**: Mock data for demonstration
- **Wallet Connections**: Logged to console only

### User Experience
- **Wallet Connection**: Works exactly the same
- **Event Submission**: Creates local event objects
- **Event Browsing**: Shows mock events
- **Wallet Dashboard**: Displays local information

## Benefits

### For Development
- ✅ **No Setup Required**: Just run `npm run dev`
- ✅ **No Database Errors**: No connection issues
- ✅ **Fast Iteration**: No database migrations
- ✅ **Clean Console**: No error messages

### For Testing
- ✅ **Consistent Environment**: Same behavior every time
- ✅ **No External Dependencies**: Works anywhere
- ✅ **Easy Debugging**: All data is local
- ✅ **Quick Testing**: No database setup needed

## Current Functionality

### ✅ **Working Features**

#### Wallet Integration
```javascript
// Connects to Solana wallet
const { user, isConnected } = useWalletIntegration();

// Creates local user object
// No database operations
```

#### Event Submission
```javascript
// Submits event locally
const eventData = {
  title: "Concert 2025",
  description: "Amazing concert",
  // ... other fields
};

// Creates local event ID
const mockEventId = `local_event_${Date.now()}_${Math.random()}`;
```

#### Event Browsing
```javascript
// Shows mock events
const mockEvents = [
  {
    id: '1',
    title: 'Coldplay Concert Jakarta 2025',
    // ... other fields
  }
];
```

#### Wallet Dashboard
```javascript
// Shows local wallet information
const mockTransactions = [
  {
    id: '1',
    type: 'Faucet',
    amount: 100,
    // ... other fields
  }
];
```

## Console Output

### Expected Messages
```
✅ Local user created: {walletAddress: "...", userId: "local_...", username: "User_..."}
✅ Wallet connection recorded locally
✅ Event data prepared locally
✅ Event created locally with ID: local_event_...
```

### No More Errors
- ❌ No 409 Conflict errors
- ❌ No database connection errors
- ❌ No auto-sync failures
- ❌ No constraint violations

## Development Workflow

### 1. Start Development
```bash
cd frontend
npm run dev
```

### 2. Test Features
- Connect wallet ✅
- Submit events ✅
- Browse events ✅
- View dashboard ✅

### 3. Check Console
- Clean success messages ✅
- No error messages ✅
- Local operation logs ✅

## Future Options

### If You Need Data Persistence

#### Option 1: Local Storage
```javascript
// Store in browser localStorage
localStorage.setItem('events', JSON.stringify(events));
```

#### Option 2: IndexedDB
```javascript
// Use browser IndexedDB for larger data
const db = await openDB('eventdao', 1);
```

#### Option 3: File System
```javascript
// Save to JSON files
fs.writeFileSync('events.json', JSON.stringify(events));
```

#### Option 4: Different Database
- PostgreSQL
- MongoDB
- Firebase
- PlanetScale
- Any other database service

## Migration Path

### From Local to Database
1. **Choose Database**: Select your preferred database
2. **Create Schema**: Design your database structure
3. **Add Services**: Create database service layer
4. **Update Components**: Modify components to use database
5. **Test Migration**: Ensure data flows correctly

### Example Migration
```javascript
// Before (Local)
const user = await walletService.getOrCreateUser(walletAddress);

// After (Database)
const user = await userService.getOrCreateUser(walletAddress);
```

## Best Practices

### For Local Development
- ✅ **Use Mock Data**: Create realistic mock data
- ✅ **Simulate Operations**: Make operations feel real
- ✅ **Log Everything**: Console logs for debugging
- ✅ **Handle Errors**: Graceful error handling

### For Future Database Integration
- ✅ **Keep Interfaces**: Maintain same function signatures
- ✅ **Abstract Services**: Use service layer pattern
- ✅ **Handle Failures**: Plan for database failures
- ✅ **Test Thoroughly**: Test with and without database

## Troubleshooting

### Common Issues

#### "Function not found" errors
- **Cause**: Removed Supabase functions
- **Solution**: Use local alternatives

#### "Import not found" errors
- **Cause**: Removed Supabase imports
- **Solution**: Remove unused imports

#### "Property does not exist" errors
- **Cause**: Changed data structures
- **Solution**: Update property names

### Debugging
1. **Check Console**: Look for error messages
2. **Verify Imports**: Ensure all imports exist
3. **Test Components**: Test each component individually
4. **Check Types**: Verify TypeScript types match

## Conclusion

Local Mode provides a clean, error-free development environment for EventDAO. All core functionality works without external dependencies, making it perfect for development, testing, and demonstration purposes.

When you're ready to add data persistence, you can choose from various options and migrate gradually without breaking the existing functionality.
