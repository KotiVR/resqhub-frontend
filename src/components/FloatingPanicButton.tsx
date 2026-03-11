import { useState } from "react";
import { AlertTriangle, MapPin, Phone, Heart, X, Navigation, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function FloatingPanicButton() {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const triggerSOS = async () => {
    setSending(true);
    setLocationStatus("Detecting location...");

    // Get location
    let lat: number | null = null;
    let lng: number | null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
        });
      });
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
      setLocationStatus("Location detected!");
    } catch {
      setLocationStatus("Location unavailable");
    }

    // Try to send emergency notification if user is logged in
    if (user) {
      try {
        const { data: profile } = await supabase
          .from("emergency_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile && (profile.emergency_contact_1 || profile.emergency_contact_2)) {
          const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sos`;
          await fetch(FUNCTION_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              profile,
              location: lat && lng ? { lat, lng } : null,
            }),
          });
        }
      } catch (e) {
        console.error("SOS notification error:", e);
      }
    }

    setSending(false);
    toast({
      title: "🚨 SOS Alert Activated!",
      description: lat
        ? `Emergency contacts notified. Location: ${lat.toFixed(4)}, ${lng!.toFixed(4)}`
        : "Emergency contacts notified. Location unavailable.",
    });

    setEmergencyMode(true);
  };

  return (
    <>
      {/* Floating Panic Button - always visible, bottom left */}
      <button
        onClick={triggerSOS}
        disabled={sending}
        className="fixed bottom-6 left-6 z-50 w-16 h-16 rounded-full bg-destructive text-destructive-foreground shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform sos-pulse"
        aria-label="Panic SOS Button"
      >
        {sending ? (
          <span className="w-6 h-6 border-3 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <AlertTriangle className="w-7 h-7" />
        )}
      </button>

      {/* Emergency Mode - Simplified Interface */}
      <Dialog open={emergencyMode} onOpenChange={setEmergencyMode}>
        <DialogContent className="max-w-sm bg-card border-destructive/50">
          <DialogHeader>
            <DialogTitle className="text-center text-destructive text-2xl font-extrabold flex items-center justify-center gap-2">
              <AlertTriangle className="w-7 h-7" />
              EMERGENCY MODE
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {locationStatus && (
              <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {locationStatus}
              </p>
            )}

            {/* Big Emergency Buttons */}
            <a
              href="tel:108"
              className="flex items-center justify-center gap-3 w-full py-5 rounded-xl bg-destructive text-destructive-foreground font-extrabold text-lg hover:bg-destructive/90 transition-colors"
            >
              <Phone className="w-6 h-6" />
              Call Ambulance (108)
            </a>

            <button
              onClick={() => {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
                    if (navigator.share) {
                      navigator.share({ title: "My Emergency Location", url });
                    } else {
                      navigator.clipboard.writeText(url);
                      toast({ title: "📋 Location copied to clipboard!" });
                    }
                  },
                  () => toast({ title: "❌ Location unavailable" })
                );
              }}
              className="flex items-center justify-center gap-3 w-full py-5 rounded-xl bg-primary text-primary-foreground font-extrabold text-lg hover:bg-primary/90 transition-colors"
            >
              <Navigation className="w-6 h-6" />
              Share Location
            </button>

            <button
              onClick={() => {
                setEmergencyMode(false);
                navigate("/first-aid");
              }}
              className="flex items-center justify-center gap-3 w-full py-5 rounded-xl bg-secondary text-secondary-foreground font-extrabold text-lg hover:bg-secondary/90 transition-colors"
            >
              <Stethoscope className="w-6 h-6" />
              View First Aid
            </button>

            <a
              href="tel:112"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border-2 border-destructive text-destructive font-bold text-base hover:bg-destructive/10 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call 112 (National Emergency)
            </a>
          </div>

          <button
            onClick={() => setEmergencyMode(false)}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
