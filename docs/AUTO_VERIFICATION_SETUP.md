# Automatic AI Verification Setup

## Overview

This system automatically verifies events using Gemini AI 48 hours after the event date. Once verified, the results are made available for users to participate in DAO voting.

## How It Works

1. **Timing**: 48 hours after an event's scheduled date
2. **Trigger**: Events with no existing AI verification
3. **Process**: 
   - Automatically calls Gemini AI to analyze the event
   - Saves the result to the database
   - Opens the verification window for DAO votes
   - Updates resolution status to `ai_verifying`

## API Endpoint

### POST `/api/ai/auto-verify`

Manually triggers automatic verification for eligible events.

**Response:**
```json
{
  "message": "Processed 5 events",
  "processed": 5,
  "failed": 0,
  "results": [
    {
      "eventId": "...",
      "success": true,
      "result": {
        "result": "true",
        "confidence": 85,
        "reasoning": "...",
        "sources": []
      }
    }
  ]
}
```

### GET `/api/ai/auto-verify`

Checks how many events are eligible for auto-verification.

**Response:**
```json
{
  "eventsNeedingVerification": 3,
  "events": [...],
  "criteria": {
    "eventDateBefore": "2024-01-01T00:00:00.000Z",
    "hasNoVerification": true
  }
}
```

## Scheduled Execution

### Option 1: Vercel Cron Jobs (Recommended)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/ai/auto-verify",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

This runs every 6 hours. Adjust the schedule as needed:
- `0 */6 * * *` - Every 6 hours
- `0 * * * *` - Every hour
- `0 0 * * *` - Once daily at midnight

### Option 2: External Cron Service

Use services like:
- **Cron-job.org** (free)
- **EasyCron** (free tier available)
- **cron-job.net** (free)

Configure to call: `https://your-domain.com/api/ai/auto-verify` (POST request)

### Option 3: Server Cron Job

If you have a server running 24/7:

```bash
# Add to crontab
0 */6 * * * curl -X POST https://your-domain.com/api/ai/auto-verify
```

## Database Schema Requirements

The system requires these columns in the `events` table:

- `date` (TIMESTAMPTZ) - Event scheduled date
- `ai_verification_result` (TEXT) - Verification result (true/false/uncertain)
- `ai_verification_confidence` (DECIMAL) - Confidence level (0-100)
- `ai_verification_timestamp` (TIMESTAMPTZ) - When verification occurred
- `resolution_status` (TEXT) - Current resolution status
- `verification_window_open` (BOOLEAN) - Whether DAO voting is open

Run the SQL script: `docs/EVT_STAKING_SETUP.sql` to ensure all columns exist.

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` (recommended) or `NEXT_PUBLIC_SUPABASE_ANON_KEY` - For admin operations
- `GEMINI_API_KEY` - Google Gemini API key

## Workflow

1. **Event Created** → Event date set, staking open
2. **48 Hours After Event Date** → Staking closes
3. **Auto-Verification Triggered** → Gemini AI analyzes event
4. **Verification Saved** → Result stored in database
5. **DAO Voting Opens** → Users can see AI result and vote
6. **Resolution** → Final resolution based on DAO votes + AI verification

## Manual Trigger

You can manually trigger verification for testing:

```bash
curl -X POST https://your-domain.com/api/ai/auto-verify
```

Or check eligible events:

```bash
curl https://your-domain.com/api/ai/auto-verify
```

## Monitoring

Check the response to see:
- How many events were processed
- How many succeeded/failed
- Detailed results for each event

Monitor your Vercel logs or server logs to track execution.

## Troubleshooting

1. **No events processed**: Check that events exist with dates 48+ hours ago and no existing verification
2. **API errors**: Verify `GEMINI_API_KEY` is set correctly
3. **Database errors**: Ensure all required columns exist in the `events` table
4. **Cron not running**: Verify `vercel.json` is configured correctly and deployed

