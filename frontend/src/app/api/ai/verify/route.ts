import { NextRequest, NextResponse } from 'next/server';
import { Event } from '@eventdao/shared';

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
}

export interface AIVerificationResult {
  result: 'true' | 'false' | 'uncertain';
  confidence: number;
  reasoning: string;
  sources?: string[];
}

/**
 * Build verification prompt for Gemini AI
 */
function buildVerificationPrompt(event: Event): string {
  return `You are an expert event verification system. Analyze the following event claim and determine if it is TRUE or FALSE.

Event Details:
- Title: ${event.title}
- Description: ${event.description}
- Date: ${event.date}
- Location: ${event.location}
- Category: ${event.category}
${event.event_url ? `- Event URL: ${event.event_url}` : ''}

Your task:
1. Verify if this event actually occurred or will occur as described
2. Check for credible sources (news articles, official announcements, social media from verified accounts)
3. Determine the accuracy and verifiability of the information
4. Identify any conflicting reports or red flags

Respond with a JSON object in this exact format:
{
  "result": "true" or "false" or "uncertain",
  "confidence": number between 0 and 100,
  "reasoning": "Brief explanation of your analysis (2-3 sentences)",
  "sources": ["source1", "source2", ...]
}

Important:
- Use "true" if the event is verified to have occurred or will occur
- Use "false" if the event is proven to be false or a hoax
- Use "uncertain" if you cannot determine with sufficient confidence
- Confidence should reflect how certain you are (higher = more certain)
- Include credible sources if available
- Be objective and fact-based`;
}

/**
 * Parse Gemini AI response and extract verification result
 */
function parseGeminiResponse(responseText: string): AIVerificationResult {
  try {
    // Try to extract JSON from the response
    // Gemini might return JSON wrapped in markdown code blocks
    let jsonStr = responseText.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    // Find JSON object in the response
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Validate and normalize the response
    let result: 'true' | 'false' | 'uncertain' = 'uncertain';
    if (parsed.result === 'true' || parsed.result === 'false') {
      result = parsed.result;
    } else if (parsed.result === 'uncertain') {
      result = 'uncertain';
    }
    
    const confidence = Math.max(0, Math.min(100, parseInt(parsed.confidence) || 50));
    const reasoning = parsed.reasoning || 'No reasoning provided';
    const sources = Array.isArray(parsed.sources) ? parsed.sources : [];
    
    return {
      result,
      confidence,
      reasoning,
      sources,
    };
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    // Fallback: try to extract information from text
    const lowerText = responseText.toLowerCase();
    let result: 'true' | 'false' | 'uncertain' = 'uncertain';
    
    if (lowerText.includes('true') && !lowerText.includes('false')) {
      result = 'true';
    } else if (lowerText.includes('false') && !lowerText.includes('true')) {
      result = 'false';
    }
    
    return {
      result,
      confidence: 50,
      reasoning: responseText.substring(0, 200),
      sources: [],
    };
  }
}

/**
 * GET /api/ai/verify
 * Health check endpoint for the Gemini API route
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Gemini AI verification endpoint is ready',
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
  });
}

/**
 * POST /api/ai/verify
 * Verify an event using Google Gemini AI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event: Event = body.event;

    if (!event) {
      return NextResponse.json(
        { error: 'Event data is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured, using fallback response');
      // Return a mock response if API key is not configured
      return NextResponse.json<AIVerificationResult>({
        result: 'uncertain',
        confidence: 50,
        reasoning: 'AI verification is not configured. Please set GEMINI_API_KEY environment variable.',
        sources: [],
      });
    }

    // Build the prompt
    const prompt = buildVerificationPrompt(event);

    // Call Gemini API
    // Using the official endpoint format from: https://ai.google.dev/gemini-api/docs/quickstart
    const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    
    const geminiRequest: GeminiRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey, // API key in header as per official docs
      },
      body: JSON.stringify(geminiRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      let errorReason = 'AI verification service temporarily unavailable.';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorReason = `Gemini API Error: ${errorJson.error.message}`;
        }
      } catch {
        // If parsing fails, use the raw error text (truncated)
        errorReason = `API Error (${response.status}): ${errorText.substring(0, 100)}`;
      }
      
      // Return fallback response on API error with detailed error info
      return NextResponse.json<AIVerificationResult>(
        {
          result: 'uncertain',
          confidence: 50,
          reasoning: errorReason,
          sources: [],
        },
        { status: response.status }
      );
    }

    const geminiResponse: GeminiResponse = await response.json();

    // Extract the response text
    const responseText =
      geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }

    // Parse the response
    const verificationResult = parseGeminiResponse(responseText);

    return NextResponse.json<AIVerificationResult>(verificationResult);
  } catch (error) {
    console.error('AI verification error:', error);
    
    // Return fallback response on any error
    return NextResponse.json<AIVerificationResult>(
      {
        result: 'uncertain',
        confidence: 50,
        reasoning: 'AI verification failed. Using community vote.',
        sources: [],
      },
      { status: 500 }
    );
  }
}

