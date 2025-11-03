import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const geminiApiKey = process.env.GEMINI_API_KEY;

// Use service role key for admin operations if available
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  event_url?: string;
  media_files?: string[];
  [key: string]: any;
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

interface AIVerificationResult {
  result: 'true' | 'false' | 'uncertain';
  confidence: number;
  reasoning: string;
  sources?: string[];
}

function buildVerificationPrompt(event: Event): string {
  return `You are an AI event verification system. Analyze the following event and determine if it actually occurred or if it's a hoax.

EVENT DETAILS:
Title: ${event.title}
Description: ${event.description}
Scheduled Date: ${event.date}
Location: ${event.location}
Category: ${event.category}
${event.event_url ? `Event URL: ${event.event_url}` : ''}
${event.media_files && event.media_files.length > 0 ? `Media Files: ${event.media_files.join(', ')}` : ''}

Your task:
1. Analyze all available information about this event
2. Check if the event actually happened as described
3. Look for evidence of:
   - Actual occurrence (news, social media, official confirmations)
   - Hoax indicators (contradictory information, fake sources, etc.)
   - Uncertainty factors (insufficient information, conflicting reports)

Respond ONLY with a valid JSON object in this exact format:
{
  "result": "true" | "false" | "uncertain",
  "confidence": number (0-100),
  "reasoning": "detailed explanation of your analysis",
  "sources": ["source1", "source2", ...]
}

Be thorough and provide clear reasoning for your decision.`;
}

function parseGeminiResponse(responseText: string): AIVerificationResult {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        result: parsed.result || 'uncertain',
        confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
        reasoning: parsed.reasoning || 'AI analysis completed',
        sources: parsed.sources || [],
      };
    }
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
  }

  // Fallback: try to infer from text
  const lowerText = responseText.toLowerCase();
  let result: 'true' | 'false' | 'uncertain' = 'uncertain';
  if (lowerText.includes('true') || lowerText.includes('occurred') || lowerText.includes('happened')) {
    result = 'true';
  } else if (lowerText.includes('false') || lowerText.includes('hoax') || lowerText.includes('fake')) {
    result = 'false';
  }

  return {
    result,
    confidence: 50,
    reasoning: responseText.substring(0, 500),
    sources: [],
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Get events that need auto-verification
    // Criteria: 48 hours after event date, staking closed, no existing AI verification
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const { data: eventsToVerify, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .lte('date', fortyEightHoursAgo.toISOString()) // Event date was 48+ hours ago
      .is('ai_verification_result', null) // No existing verification
      .limit(10); // Process max 10 at a time

    if (fetchError) {
      console.error('Error fetching events:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch events', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!eventsToVerify || eventsToVerify.length === 0) {
      return NextResponse.json({
        message: 'No events need verification',
        processed: 0,
      });
    }

    const results = [];

    // Process each event
    for (const event of eventsToVerify) {
      try {
        // Build prompt
        const prompt = buildVerificationPrompt(event as Event);

        // Call Gemini API - using the same pattern as verify route
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': geminiApiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
        }

        const geminiData: GeminiResponse = await response.json();

        if (geminiData.error) {
          throw new Error(`Gemini API error: ${geminiData.error.message}`);
        }

        const responseText =
          geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';

        // Parse response
        const verificationResult = parseGeminiResponse(responseText);

        // Save to database
        const { error: updateError } = await supabase
          .from('events')
          .update({
            ai_verification_result: verificationResult.result,
            ai_verification_confidence: verificationResult.confidence,
            ai_verification_timestamp: new Date().toISOString(),
            resolution_status: 'ai_verifying', // Update status
            verification_window_open: true, // Open verification window for DAO votes
          })
          .eq('id', event.id);

        if (updateError) {
          console.error(`Error saving verification for event ${event.id}:`, updateError);
          results.push({
            eventId: event.id,
            success: false,
            error: updateError.message,
          });
        } else {
          results.push({
            eventId: event.id,
            success: true,
            result: verificationResult,
          });
        }
      } catch (err) {
        console.error(`Error processing event ${event.id}:`, err);
        results.push({
          eventId: event.id,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${eventsToVerify.length} events`,
      processed: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (error) {
    console.error('Auto-verification error:', error);
    return NextResponse.json(
      {
        error: 'Auto-verification failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for manual triggering or status check
export async function GET() {
  try {
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const { data: eventsToVerify, error } = await supabase
      .from('events')
      .select('id, title, date, ai_verification_result')
      .lte('date', fortyEightHoursAgo.toISOString())
      .is('ai_verification_result', null)
      .limit(10);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch events', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      eventsNeedingVerification: eventsToVerify?.length || 0,
      events: eventsToVerify || [],
      criteria: {
        eventDateBefore: fortyEightHoursAgo.toISOString(),
        hasNoVerification: true,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to check events',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

