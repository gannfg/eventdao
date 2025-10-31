# Google Gemini AI Setup Guide

## Overview
The EventDAO platform uses Google's Gemini Pro API to verify events and determine their authenticity. This guide explains how to set up the Gemini AI integration.

## Features
- ✅ Real-time AI verification of events
- ✅ Confidence scoring and reasoning
- ✅ Source citation
- ✅ Fallback to community voting if AI verification fails
- ✅ Free tier available with generous quotas

## Setup Instructions

### 1. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Select or create a Google Cloud project
5. Copy the API key (you can view it again later)

**Alternative Method (Google Cloud Console):**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Generative Language API
4. Go to APIs & Services > Credentials
5. Create an API key and restrict it to the Generative Language API

### 2. Configure Environment Variable

Create or update the `.env.local` file in the `frontend` directory:

```env
# Google Gemini API Configuration
GEMINI_API_KEY=your-gemini-api-key-here
```

**Important Notes:**
- The `.env.local` file is not tracked by git (it's in `.gitignore`)
- Never commit your API key to version control
- For production deployments (Vercel), add the environment variable in your deployment settings

### 3. Vercel Deployment (Production)

If deploying to Vercel:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add a new variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key
   - **Environment**: Production, Preview, Development (select all)
4. Redeploy your application

### 4. Testing the Integration

After setting up the API key:

1. Start your development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to an event on the Explore page
3. Click "Verify Event"
4. The AI verification should process the event and return results

## How It Works

### AI Verification Process

1. **Event Data**: When verification is triggered, the system sends event details to Google Gemini:
   - Event title
   - Description
   - Date and location
   - Category
   - Event URL (if available)

2. **AI Analysis**: Google Gemini Pro analyzes the event claim and:
   - Verifies if the event actually occurred
   - Checks for credible sources (news articles, official announcements)
   - Determines accuracy and verifiability
   - Identifies conflicting reports

3. **Response Format**: The API returns:
   - **result**: `"true"`, `"false"`, or `"uncertain"`
   - **confidence**: 0-100 (percentage)
   - **reasoning**: Explanation of the analysis
   - **sources**: Array of credible sources found

4. **Integration**: The AI result is combined with community voting to determine the final outcome

### Fallback Behavior

If the Gemini API key is not configured:
- The system uses a mock verification response
- A warning is logged in the console
- Community voting is used for resolution

If the API call fails:
- The system falls back to `"uncertain"` result
- Community voting determines the outcome
- Error details are logged for debugging

## Cost Considerations

The integration uses **Gemini Pro**, which offers:
- **Free Tier**: 60 requests per minute, generous daily quota
- **Paid Tier**: $0.0005 per 1K characters input, $0.0015 per 1K characters output
- Typical verification request: ~500-1000 characters

**Estimated Cost**: Free tier covers most use cases, or ~$0.001 per verification on paid tier

## API Endpoint

The verification is handled by the Next.js API route:
- **Path**: `/api/ai/verify`
- **Method**: `POST`
- **Body**: `{ event: Event }`
- **Response**: `AIVerificationResult`

## Troubleshooting

### API Key Not Working
- Verify the key format is correct (should be a string, not starting with a prefix)
- Check if the Generative Language API is enabled in your Google Cloud project
- Ensure the key has proper permissions
- Verify the API key hasn't been restricted too much

### Rate Limiting
- Gemini has rate limits: 60 requests per minute on free tier
- If you hit limits, implement request queuing or upgrade to paid tier
- Consider implementing caching for similar events

### High Costs
- Monitor usage in Google Cloud Console
- Free tier should cover most development needs
- Consider implementing caching for similar events

### Mock Responses in Production
- Check if `GEMINI_API_KEY` is set in your production environment
- Verify the environment variable is loaded correctly
- Check server logs for error messages
- Ensure the Generative Language API is enabled in your Google Cloud project

## Security Best Practices

1. **Never expose API keys**:
   - Don't commit `.env.local` to git
   - Use environment variables in production
   - Rotate keys regularly
   - Restrict API keys to specific APIs in Google Cloud Console

2. **Monitor usage**:
   - Set up usage alerts in Google Cloud Console
   - Review logs for unexpected API calls
   - Implement rate limiting if needed
   - Set up billing alerts

3. **Error handling**:
   - Always handle API failures gracefully
   - Log errors for debugging without exposing sensitive data
   - Provide fallback mechanisms

4. **API Key Restrictions**:
   - Restrict the API key to only the Generative Language API
   - Set application restrictions if possible
   - Use different keys for development and production

## Support

For issues or questions:
1. Check Google Cloud Status: https://status.cloud.google.com/
2. Review Gemini API documentation: https://ai.google.dev/docs
3. Check server logs for detailed error messages
4. Verify environment variable configuration
5. Google AI Studio: https://makersuite.google.com/

