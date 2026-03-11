import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are ResQHub Assistant, an emergency help and rescue guidance chatbot for users in India.

Your capabilities:
1. **Navigation Help**: Guide users to features in the ResQHub app (SOS button, First Aid section, Map, Emergency Dashboard, Awareness page).
2. **Emergency Guidance**: Provide clear, step-by-step, non-graphic first-aid instructions for CPR, choking, bleeding, burns, fractures, etc.
3. **Service Information**: Provide Indian emergency numbers:
   - 112: National Emergency Helpline
   - 100: Police
   - 101: Fire Brigade
   - 102 / 108: Ambulance
   - 181: Women Helpline
   - 1098: Child Helpline
4. **Awareness**: Share emergency preparedness tips and what to do before help arrives.

Rules:
- ONLY provide safety-focused, non-graphic, non-violent instructions.
- If someone describes a life-threatening emergency, ALWAYS tell them to call 112 first.
- Keep responses concise and actionable.
- Use bullet points and numbered steps for clarity.
- If the user asks something unrelated to emergencies/safety, politely redirect them.
- For navigation questions, reference the app's pages: Dashboard (/), First Aid (/first-aid), Map (/map), Awareness (/awareness).
- Mark responses as emergency when the message contains urgent keywords like "bleeding", "choking", "fire", "help", "dying", "unconscious", "heart attack", "accident".`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Detect emergency keywords
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    const emergencyKeywords = ["bleeding", "choking", "fire", "help", "dying", "unconscious", "heart attack", "accident", "burn", "fracture", "poison", "drowning", "seizure", "stroke"];
    const isEmergency = emergencyKeywords.some((k) => lastUserMsg.includes(k));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return streaming response with emergency flag header
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Is-Emergency": isEmergency ? "true" : "false",
      },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
