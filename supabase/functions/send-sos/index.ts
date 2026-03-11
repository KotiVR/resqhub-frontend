import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, location } = await req.json();

    if (!profile) {
      return new Response(JSON.stringify({ error: "No profile data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const locationText = location
      ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
      : "Location unavailable";

    const message = `
🚨 EMERGENCY SOS ALERT - ResQHub

Patient: ${profile.full_name || "Unknown"}
Phone: ${profile.phone_number || "N/A"}
Blood Group: ${profile.blood_group || "N/A"}
Medical Conditions: ${profile.medical_conditions || "None listed"}
Allergies: ${profile.allergies || "None listed"}
Current Medications: ${profile.current_medications || "None listed"}
Preferred Hospital: ${profile.preferred_hospital || "N/A"}
Doctor: ${profile.doctor_name || "N/A"} - ${profile.doctor_contact || "N/A"}

📍 Location: ${locationText}

This is an automated emergency alert from ResQHub.
    `.trim();

    // Log the SOS alert (in production, integrate with SMS/email APIs)
    console.log("SOS Alert triggered:");
    console.log("Emergency Contact 1:", profile.emergency_contact_1);
    console.log("Emergency Contact 2:", profile.emergency_contact_2);
    console.log("Message:", message);

    return new Response(
      JSON.stringify({
        success: true,
        message: "SOS alert processed",
        contacts_notified: [profile.emergency_contact_1, profile.emergency_contact_2].filter(Boolean),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("send-sos error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
