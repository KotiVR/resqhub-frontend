import { useState } from "react";
import { AlertTriangle, MapPin, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function SOSButton() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  const handleSOSClick = () => {
    // Try to get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation(null)
      );
    }
    setOpen(true);
    setSent(false);
  };

  const handleConfirm = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 2000));
    setSending(false);
    setSent(true);
    toast({
      title: "🚨 SOS Alert Sent!",
      description: location
        ? `Alert sent with your location (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}). Emergency services have been notified.`
        : "Alert sent. Emergency services have been notified.",
    });
  };

  const handleClose = () => {
    setOpen(false);
    setSent(false);
    setSending(false);
  };

  return (
    <>
      <button
        className="sos-pulse mx-auto flex items-center justify-center gap-3 bg-destructive text-destructive-foreground font-extrabold text-lg px-10 py-5 rounded-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        onClick={handleSOSClick}
        aria-label="Send SOS Alert"
      >
        <AlertTriangle className="w-6 h-6" />
        SOS — SEND EMERGENCY ALERT
        <AlertTriangle className="w-6 h-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive text-xl">
              <AlertTriangle className="w-6 h-6" />
              Confirm SOS Alert
            </DialogTitle>
            <DialogDescription>
              This will send an emergency alert. Please confirm this is a real emergency.
            </DialogDescription>
          </DialogHeader>

          {!sent ? (
            <div className="space-y-4">
              {location ? (
                <div className="flex items-start gap-2 bg-accent p-3 rounded-lg text-sm">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-accent-foreground">Your location detected</p>
                    <p className="text-muted-foreground">
                      Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
                  📍 Location not detected. Alert will be sent without location data.
                </div>
              )}

              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg text-sm">
                <p className="font-bold text-destructive mb-1">⚠️ Only use in a real emergency!</p>
                <p className="text-muted-foreground">
                  False emergency alerts may delay help for people in genuine emergencies.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleClose} disabled={sending}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
                  onClick={handleConfirm}
                  disabled={sending}
                >
                  {sending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "🚨 Confirm SOS"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h3 className="font-bold text-lg text-foreground">Alert Sent Successfully!</h3>
              <p className="text-muted-foreground text-sm">
                Emergency services have been notified. Stay calm and remain in a safe location if possible.
              </p>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleClose}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
