// Schedule: */15 * * * * (Supabase Free tier)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log('autoCheckout function booting up');

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);

    const twelveHoursInMs = 12 * 60 * 60 * 1000;
    const twelveHoursAgoThreshold = new Date(Date.now() - twelveHoursInMs);

    console.log(`Cron job running. Checking for open sessions started before ${twelveHoursAgoThreshold.toISOString()}.`);

    const { data: overdueSessions, error: selectError } = await supabaseClient
      .from('sessions')
      .select('id, member_id, check_in')
      .is('check_out', null) 
      .lt('check_in', twelveHoursAgoThreshold.toISOString());

    if (selectError) {
      console.error('Error fetching overdue sessions:', selectError.message);
      return new Response(JSON.stringify({ error: 'Database error fetching sessions.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!overdueSessions || overdueSessions.length === 0) {
      console.log('No overdue sessions found to auto-checkout.');
      return new Response(JSON.stringify({ message: 'No overdue sessions found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`Found ${overdueSessions.length} overdue sessions to auto-checkout.`);
    let closedCount = 0;
    const errorsEncountered = [];

    for (const session of overdueSessions) {
      const checkInTime = new Date(session.check_in);
      const autoCheckoutTime = new Date(checkInTime.getTime() + twelveHoursInMs);

      const { error: updateError } = await supabaseClient
        .from('sessions')
        .update({
          check_out: autoCheckoutTime.toISOString(),
          auto_closed: true,
        })
        .eq('id', session.id);

      if (updateError) {
        console.error(`Error auto-closing session ${session.id} for member ${session.member_id}:`, updateError.message);
        errorsEncountered.push({ sessionId: session.id, error: updateError.message });
      } else {
        console.log(`Auto-closed session ${session.id} for member ${session.member_id}. Check-in: ${session.check_in}, Auto Check-out: ${autoCheckoutTime.toISOString()}`);
        closedCount++;
      }
    }

    if (errorsEncountered.length > 0) {
      return new Response(JSON.stringify({ 
        message: `Auto-checkout process completed with some errors. Closed ${closedCount} of ${overdueSessions.length} sessions.`,
        errors: errorsEncountered 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: errorsEncountered.length === overdueSessions.length ? 500 : 207, // 207 Multi-Status if partially successful
      });
    }

    return new Response(JSON.stringify({ message: `Successfully auto-closed ${closedCount} sessions.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('General error in autoCheckout function:', error.message);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
