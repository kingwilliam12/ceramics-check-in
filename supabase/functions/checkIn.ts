import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log('checkIn function booting up');

// Standard Supabase CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Adjust this for production to specific origins
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allow POST for check-in, OPTIONS for preflight
};

serve(async (req) => {
  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service_role key for admin-level access
    // This is required to bypass RLS if necessary for the function's logic,
    // though typically RLS should be designed to allow legitimate user actions.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        // It's generally recommended to pass the user's auth token to Supabase
        // so that RLS can be applied based on the user, even when using service_role for specific operations.
        global: { headers: { Authorization: req.headers.get('Authorization')! } }
      }
    );

    // Get the authenticated user's ID
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    const memberId = user.id;

    // Regarding location data from PRD 3.C: "Server records check_in timestamp + device coarse location (GPS ± 50 m)."
    // Current 'sessions' table schema (PRD Sec 7) does not have location fields.
    // PRD S-7 (PII masking) advises: "store member ID only; no raw email or GPS lat/long."
    // This implies if location is stored, it should be coarse (e.g., city/region or a geohash of limited precision),
    // or a boolean indicating if inside a predefined geofence.
    // For now, location handling is deferred pending schema update and clarification.

    const currentTime = new Date().toISOString();

    // 1. Check for an existing open session for this member (check_out IS NULL)
    // NOTE: Assumes database schema will be aligned with PRD naming (e.g., 'sessions.check_out', 'sessions.member_id', 'sessions.check_in').
    // Current migration uses: 'endedAt', 'memberId', 'startedAt'. This WILL FAIL until migration is updated.
    const { data: existingOpenSession, error: selectError } = await supabaseClient
      .from('sessions')
      .select('id, check_in') 
      .eq('member_id', memberId) 
      .is('check_out', null)
      .maybeSingle(); 

    if (selectError) {
      console.error('Error selecting existing session:', selectError.message);
      // More specific error for client if needed, but internal server error is generally safer
      return new Response(JSON.stringify({ error: 'Database error checking for existing session.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (existingOpenSession) {
      // Overlap Rule: If an open session exists, update its check_in timestamp
      console.log(`Open session found (id: ${existingOpenSession.id}), updating check_in time for member ${memberId}`);
      const { data: updatedSession, error: updateError } = await supabaseClient
        .from('sessions')
        .update({ check_in: currentTime })
        .eq('id', existingOpenSession.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating session:', updateError.message);
        return new Response(JSON.stringify({ error: 'Database error updating session.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      return new Response(JSON.stringify(updatedSession), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      // No open session, create a new one
      console.log(`No open session found, creating new session for member ${memberId}`);
      const { data: newSession, error: insertError } = await supabaseClient
        .from('sessions')
        .insert({ member_id: memberId, check_in: currentTime })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting new session:', insertError.message);
        return new Response(JSON.stringify({ error: 'Database error creating new session.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      return new Response(JSON.stringify(newSession), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201, // 201 Created for new resource
      });
    }
  } catch (error) {
    console.error('General error in checkIn function:', error.message);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
