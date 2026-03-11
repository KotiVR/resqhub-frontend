import { useState } from "react";
import { AlertTriangle, Phone } from "lucide-react";

interface EmergencyService {
  type: string;
  label: string;
  number: string;
  icon: string;
  colorClass: string;
  bgClass: string;
}

const services: EmergencyService[] = [
  {
    type: "emergency",
    label: "Emergency",
    number: "112",
    icon: "🆘",
    colorClass: "text-red-600",
    bgClass: "bg-red-50 border-red-200 hover:bg-red-100",
  },
  {
    type: "ambulance",
    label: "Ambulance",
    number: "108",
    icon: "🚑",
    colorClass: "text-red-600",
    bgClass: "bg-red-50 border-red-200 hover:bg-red-100",
  },
  {
    type: "police",
    label: "Police",
    number: "100",
    icon: "🚓",
    colorClass: "text-blue-700",
    bgClass: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    type: "fire",
    label: "Fire Brigade",
    number: "101",
    icon: "🚒",
    colorClass: "text-orange-600",
    bgClass: "bg-orange-50 border-orange-200 hover:bg-orange-100",
  },
  {
    type: "women",
    label: "Women Helpline",
    number: "181",
    icon: "👩",
    colorClass: "text-purple-700",
    bgClass: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  },
  {
    type: "child",
    label: "Child Helpline",
    number: "1098",
    icon: "👶",
    colorClass: "text-teal-700",
    bgClass: "bg-teal-50 border-teal-200 hover:bg-teal-100",
  },
];

export default function EmergencyDashboard() {
  const [calling, setCalling] = useState<string | null>(null);

  const handleCall = (service: EmergencyService) => {
    setCalling(service.type);
    setTimeout(() => setCalling(null), 2000);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {services.map((service) => (
        <a
          key={service.type}
          href={`tel:${service.number}`}
          className={`emergency-btn ${service.bgClass} border-2 ${calling === service.type ? "scale-95" : ""}`}
          onClick={() => handleCall(service)}
          aria-label={`Call ${service.label} at ${service.number}`}
        >
          <span className="text-3xl">{service.icon}</span>
          <span className={`text-sm font-bold ${service.colorClass}`}>{service.label}</span>
          <span className="flex items-center gap-0.5 text-xs font-semibold text-muted-foreground">
            <Phone className="w-3 h-3" /> {service.number}
          </span>
          {calling === service.type && (
            <span className="text-xs font-bold text-green-600 animate-pulse">Calling...</span>
          )}
        </a>
      ))}
    </div>
  );
}
