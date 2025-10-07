# EventDAO Documentation

## Overview

EventDAO is a decentralized platform that verifies real-world events on the Solana blockchain. Users can submit event claims, stake on event authenticity, and earn rewards for accurate verification.

## Current Status

✅ **Supabase Integration Removed** - The project now works completely locally without any database dependencies.

## Available Documentation

### Solana Integration
- **[README-Solana.md](./README-Solana.md)** - Solana blockchain integration guide
- **[SOLANA_INTEGRATION_GUIDE.md](./SOLANA_INTEGRATION_GUIDE.md)** - Detailed Solana setup and configuration

## Project Structure

```
EventDAO/
├── frontend/          # Next.js frontend application
├── backend/           # Node.js/Express API server  
├── shared/            # Shared types and utilities
├── programs/          # Solana smart contracts
├── docs/              # Documentation
└── scripts/           # Build and deployment scripts
```

## Features

### ✅ **Working Features**
- **Wallet Integration**: Connect Solana wallets (Phantom, Solflare, etc.)
- **Event Submission**: Submit events for verification (local mode)
- **Event Browsing**: Explore submitted events (mock data)
- **Wallet Dashboard**: View wallet information and transactions (local mode)
- **Responsive UI**: Modern, mobile-friendly interface

### 🔄 **Local Mode**
The application currently runs in local mode, meaning:
- No database dependencies
- No external API calls
- All data is handled locally
- Perfect for development and testing

## Getting Started

### Prerequisites
- Node.js 18+ and npm 8+
- Solana CLI (for program development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EventDAO
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

### Environment Setup

No environment variables are required since the app runs in local mode.

## Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
npm run dev
```

### Building for Production
```bash
npm run build
```

## Architecture

### Frontend (Next.js)
- **Pages**: Submit, Explore, Wallet, Leaderboard
- **Components**: Wallet integration, UI components
- **Hooks**: Custom React hooks for wallet management
- **Styles**: CSS modules for styling

### Backend (Node.js/Express)
- **API Routes**: Health checks, future API endpoints
- **Middleware**: Error handling, logging
- **Configuration**: Environment management

### Shared Types
- **Database Types**: Local data structures
- **Solana Types**: Blockchain integration types
- **Utility Types**: Common type definitions

## Solana Integration

The project includes comprehensive Solana blockchain integration:

- **Wallet Connection**: Support for multiple Solana wallets
- **Transaction Handling**: Solana transaction management
- **Program Integration**: Smart contract interaction
- **Network Configuration**: Devnet/Testnet/Mainnet support

See the Solana documentation for detailed setup instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues:
1. Check the Solana integration guides
2. Review the project structure
3. Check the console for error messages
4. Create an issue in the repository

---

**Note**: This project is currently in local mode without database integration. All functionality works locally for development and testing purposes.
