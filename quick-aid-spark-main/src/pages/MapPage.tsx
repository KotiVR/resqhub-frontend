import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { MapPin, Loader2, Navigation, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const leafletMapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  const getLocation = () => {
    setLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? "Location access denied. Please enable location permissions."
            : "Unable to detect your location. Please try again."
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Fix default icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapRef.current && !leafletMapRef.current) {
        const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);
        leafletMapRef.current = map;
        setMapLoaded(true);
      }
    };
    loadLeaflet();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !userLocation || !leafletMapRef.current) return;

    const addMarkers = async () => {
      const L = (await import("leaflet")).default;
      const map = leafletMapRef.current;

      // Remove old user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      // User location icon (yellow)
      const userIcon = L.divIcon({
        html: `<div style="background:#FFC107;border:3px solid #212529;border-radius:50%;width:18px;height:18px;box-shadow:0 0 0 4px rgba(255,193,7,0.3)"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        className: "",
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<b>📍 Your Location</b><br/>Accuracy: ~${Math.round(userLocation.accuracy)}m`)
        .openPopup();

      // Mock nearby emergency services
      const mockServices = [
        { name: "City General Hospital", type: "🏥 Hospital", lat: userLocation.lat + 0.01, lng: userLocation.lng + 0.008, phone: "555-0100" },
        { name: "Central Police Station", type: "🚓 Police", lat: userLocation.lat - 0.008, lng: userLocation.lng + 0.012, phone: "555-0200" },
        { name: "Fire Station #3", type: "🚒 Fire", lat: userLocation.lat + 0.005, lng: userLocation.lng - 0.01, phone: "555-0300" },
        { name: "Emergency Clinic", type: "🚑 Clinic", lat: userLocation.lat - 0.012, lng: userLocation.lng - 0.006, phone: "555-0400" },
      ];

      mockServices.forEach((svc) => {
        const svcIcon = L.divIcon({
          html: `<div style="background:#DC2626;border:2px solid white;border-radius:50%;width:14px;height:14px;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
          className: "",
        });
        L.marker([svc.lat, svc.lng], { icon: svcIcon })
          .addTo(map)
          .bindPopup(`<b>${svc.type}</b><br/>${svc.name}<br/><a href="tel:${svc.phone}">📞 ${svc.phone}</a>`);
      });

      map.setView([userLocation.lat, userLocation.lng], 14);
    };

    addMarkers();
  }, [userLocation, mapLoaded]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-secondary py-8 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-extrabold text-secondary-foreground">Emergency Map</h1>
          </div>
          <p className="text-secondary-foreground/70 text-sm">
            Find nearby hospitals, police, and fire stations using your real-time location.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Location Bar */}
        <div className="bg-card rounded-xl border border-border shadow-card p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            {userLocation ? (
              <div>
                <p className="font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Location Detected
                </p>
                <p className="text-muted-foreground text-sm">
                  {userLocation.lat.toFixed(5)}°N, {userLocation.lng.toFixed(5)}°E — Accuracy: ±{Math.round(userLocation.accuracy)}m
                </p>
              </div>
            ) : locationError ? (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-sm">{locationError}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Click the button to detect your location and find nearby services.</p>
            )}
          </div>
          <Button
            onClick={getLocation}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shrink-0"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Detecting...</>
            ) : (
              <><Navigation className="w-4 h-4 mr-2" /> {userLocation ? "Update Location" : "Detect My Location"}</>
            )}
          </Button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary inline-block border-2 border-secondary" />
            Your Location
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-destructive inline-block" />
            Emergency Services
          </span>
        </div>

        {/* Map */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden" style={{ height: "500px" }}>
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Info cards */}
        {userLocation && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { icon: "🏥", label: "Hospital", dist: "~1.2 km", phone: "555-0100" },
              { icon: "🚓", label: "Police", dist: "~1.5 km", phone: "555-0200" },
              { icon: "🚒", label: "Fire Station", dist: "~1.1 km", phone: "555-0300" },
              { icon: "🚑", label: "Clinic", dist: "~1.8 km", phone: "555-0400" },
            ].map((svc) => (
              <a
                key={svc.label}
                href={`tel:${svc.phone}`}
                className="bg-card rounded-xl border border-border p-4 text-center card-hover shadow-card block"
              >
                <div className="text-2xl mb-1">{svc.icon}</div>
                <p className="font-bold text-sm text-card-foreground">{svc.label}</p>
                <p className="text-xs text-muted-foreground">{svc.dist}</p>
                <p className="text-xs text-primary font-semibold mt-1">📞 {svc.phone}</p>
              </a>
            ))}
          </div>
        )}

        <p className="text-center text-muted-foreground text-xs mt-6">
          Map powered by OpenStreetMap. Nearby service locations are approximate.
        </p>
      </div>
    </div>
  );
}
