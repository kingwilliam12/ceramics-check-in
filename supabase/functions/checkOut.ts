import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log('checkOut function booting up');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } }
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    const memberId = user.id;
    const currentTime = new Date().toISOString();

    // 1. Find an existing open session for this member (check_out IS NULL)
    const { data: openSession, error: selectError } = await supabaseClient
      .from('sessions')
      .select('id')
      .eq('member_id', memberId)
      .is('check_out', null)
      .order('check_in', { ascending: false }) // In case of multiple, pick the latest check_in
      .limit(1)
      .maybeSingle();

    if (selectError) {
      console.error('Error selecting open session for check-out:', selectError.message);
      return new Response(JSON.stringify({ error: 'Database error finding session.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!openSession) {
      // No open session found to check out from
      console.log(`No open session found for member ${memberId} to check out.`);
      return new Response(JSON.stringify({ error: 'No active session found to check out from.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404, // Or 400 Bad Request, depending on desired semantics
      });
    }

    // 2. Update the open session with the check_out time
    console.log(`Open session found (id: ${openSession.id}), setting check_out time for member ${memberId}`);
    const { data: updatedSession, error: updateError } = await supabaseClient
      .from('sessions')
      .update({ check_out: currentTime })
      .eq('id', openSession.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating session for check-out:', updateError.message);
      return new Response(JSON.stringify({ error: 'Database error during check-out.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify(updatedSession), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('General error in checkOut function:', error.message);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
