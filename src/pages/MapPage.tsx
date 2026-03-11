import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { MapPin, Loader2, Navigation, AlertCircle, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

interface NearbyPlace {
  id: number;
  name: string;
  type: string;
  lat: number;
  lng: number;
  phone?: string;
  address?: string;
  distance?: number;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchNearbyHospitals(lat: number, lng: number): Promise<NearbyPlace[]> {
  const radius = 5000; // 5km
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});
      way["amenity"="clinic"](around:${radius},${lat},${lng});
      node["amenity"="pharmacy"](around:${radius},${lat},${lng});
    );
    out center body 50;
  `;

  const resp = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!resp.ok) throw new Error("Failed to fetch nearby places");
  const data = await resp.json();

  return data.elements
    .filter((el: any) => el.tags?.name)
    .map((el: any) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      const amenity = el.tags?.amenity || "hospital";
      const typeLabel = amenity === "pharmacy" ? "🏪 Pharmacy" : amenity === "clinic" ? "🏥 Clinic" : "🏥 Hospital";

      return {
        id: el.id,
        name: el.tags.name,
        type: typeLabel,
        lat: elLat,
        lng: elLng,
        phone: el.tags?.phone || el.tags?.["contact:phone"] || undefined,
        address: [el.tags?.["addr:street"], el.tags?.["addr:city"]].filter(Boolean).join(", ") || undefined,
        distance: haversineDistance(lat, lng, elLat, elLng),
      };
    })
    .sort((a: NearbyPlace, b: NearbyPlace) => (a.distance ?? 99) - (b.distance ?? 99));
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const leafletMapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

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
    const loadLeaflet = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapRef.current && !leafletMapRef.current) {
        const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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

    const loadPlaces = async () => {
      const L = (await import("leaflet")).default;
      const map = leafletMapRef.current;

      // Remove old markers
      if (userMarkerRef.current) userMarkerRef.current.remove();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // User marker
      const userIcon = L.divIcon({
        html: `<div style="background:hsl(45,100%,51%);border:3px solid hsl(210,11%,15%);border-radius:50%;width:18px;height:18px;box-shadow:0 0 0 4px rgba(255,193,7,0.3)"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        className: "",
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<b>📍 Your Location</b><br/>Accuracy: ~${Math.round(userLocation.accuracy)}m`)
        .openPopup();

      map.setView([userLocation.lat, userLocation.lng], 14);

      // Fetch real nearby hospitals
      setPlacesLoading(true);
      try {
        const results = await fetchNearbyHospitals(userLocation.lat, userLocation.lng);
        setPlaces(results);

        results.forEach((place) => {
          const color = place.type.includes("Pharmacy") ? "#8B5CF6" : "#DC2626";
          const svcIcon = L.divIcon({
            html: `<div style="background:${color};border:2px solid white;border-radius:50%;width:14px;height:14px;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
            className: "",
          });

          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
          const popupContent = `
            <div style="min-width:200px">
              <b>${place.type}</b><br/>
              <strong>${place.name}</strong><br/>
              ${place.address ? `<span style="color:#666">${place.address}</span><br/>` : ""}
              ${place.distance ? `<span style="color:#888">📏 ${place.distance.toFixed(1)} km away</span><br/>` : ""}
              ${place.phone ? `<a href="tel:${place.phone}" style="color:#2563eb">📞 ${place.phone}</a><br/>` : ""}
              <a href="${directionsUrl}" target="_blank" rel="noopener" style="color:#2563eb;font-weight:600">🗺️ Get Directions</a>
            </div>
          `;

          const marker = L.marker([place.lat, place.lng], { icon: svcIcon })
            .addTo(map)
            .bindPopup(popupContent);
          markersRef.current.push(marker);
        });
      } catch (e) {
        console.error("Failed to fetch nearby places:", e);
      } finally {
        setPlacesLoading(false);
      }
    };

    loadPlaces();
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
            Find real nearby hospitals, clinics, and pharmacies using your location.
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
          <Button onClick={getLocation} disabled={loading} className="font-bold shrink-0">
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
            Hospital / Clinic
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: "#8B5CF6" }} />
            Pharmacy
          </span>
        </div>

        {placesLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Searching for nearby hospitals and clinics...
          </div>
        )}

        {/* Map */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden" style={{ height: "500px" }}>
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Real results cards */}
        {places.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-bold text-foreground text-lg">
              {places.length} Nearby Place{places.length !== 1 ? "s" : ""} Found
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {places.slice(0, 8).map((place) => (
                <div
                  key={place.id}
                  className="bg-card rounded-xl border border-border p-4 shadow-card card-hover"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{place.type}</p>
                      <p className="font-bold text-card-foreground truncate">{place.name}</p>
                      {place.address && (
                        <p className="text-xs text-muted-foreground mt-0.5">{place.address}</p>
                      )}
                      {place.distance != null && (
                        <p className="text-xs text-primary font-semibold mt-1">
                          📏 {place.distance.toFixed(1)} km away
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {place.phone && (
                      <a
                        href={`tel:${place.phone}`}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> Directions
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-muted-foreground text-xs mt-6">
          Real-time data from OpenStreetMap. Distances are approximate.
        </p>
      </div>
    </div>
  );
}
