import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Search, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Guide {
  id: string;
  title: string;
  category: string;
  description: string;
  steps: string[];
  icon: string | null;
  severity: string;
}

const defaultGuides: Guide[] = [
  {
    id: "cpr",
    title: "CPR (Cardiopulmonary Resuscitation)",
    category: "Cardiac",
    description: "CPR is a life-saving technique useful in emergencies where breathing or heartbeat has stopped.",
    icon: "❤️",
    severity: "critical",
    steps: [
      "Call emergency services immediately (911).",
      "Position the person on their back on a firm, flat surface.",
      "Kneel beside their neck and shoulders.",
      "Place the heel of your hand on the center of the chest (lower half of breastbone).",
      "Place your other hand on top and interlace your fingers.",
      "Keep arms straight and press down hard — at least 2 inches (5 cm).",
      "Push at a rate of 100–120 compressions per minute.",
      "If trained: Give 2 rescue breaths after every 30 compressions.",
      "Continue until help arrives or the person shows signs of life.",
    ],
  },
  {
    id: "choking",
    title: "Choking Rescue (Heimlich Maneuver)",
    category: "Airway",
    description: "For a conscious adult or child who is choking and cannot breathe, speak, or cough effectively.",
    icon: "🫁",
    severity: "critical",
    steps: [
      "Ask 'Are you choking?' — if they can speak/cough, encourage coughing.",
      "If they cannot breathe, call emergency services (911).",
      "Stand or kneel behind the person.",
      "Give 5 firm back blows between the shoulder blades with the heel of your hand.",
      "Make a fist and place it just above the belly button, below the breastbone.",
      "Grasp your fist with your other hand.",
      "Give 5 quick inward and upward thrusts.",
      "Alternate between 5 back blows and 5 abdominal thrusts.",
      "Continue until the object is expelled or the person becomes unconscious.",
    ],
  },
  {
    id: "burns",
    title: "Burns First Aid",
    category: "Burns",
    description: "Immediate care for minor to moderate burns from heat, chemicals, or electricity.",
    icon: "🔥",
    severity: "high",
    steps: [
      "Remove the person from the source of burn immediately.",
      "Remove jewelry and tight clothing near the burn area — but NOT if stuck to skin.",
      "Cool the burn with cool (not cold/ice) running water for 10–20 minutes.",
      "Do NOT use ice, butter, toothpaste, or home remedies.",
      "Cover loosely with a sterile non-stick bandage or clean cloth.",
      "Take over-the-counter pain relievers if needed (ibuprofen, acetaminophen).",
      "For severe burns (large area, face, hands, feet, genitals), call 911 immediately.",
      "Do not break blisters — this increases infection risk.",
    ],
  },
  {
    id: "fracture",
    title: "Fracture (Broken Bone) Handling",
    category: "Trauma",
    description: "First aid for suspected broken bones until medical help arrives.",
    icon: "🦴",
    severity: "high",
    steps: [
      "Call emergency services (911) if the fracture is severe or the person cannot move.",
      "Stop any bleeding by applying gentle pressure with a clean cloth.",
      "Immobilize the injured area — do NOT try to realign the bone.",
      "Apply a splint using rigid material (board, rolled newspaper) padded with cloth.",
      "Extend the splint beyond the joints above and below the fracture.",
      "Apply ice packs (wrapped in cloth) to reduce swelling and pain.",
      "Elevate the injured limb if possible without causing pain.",
      "Watch for signs of shock: pale skin, rapid breathing, dizziness.",
      "Keep the person calm and still until help arrives.",
    ],
  },
  {
    id: "bleeding",
    title: "Severe Bleeding Control",
    category: "Trauma",
    description: "Immediate steps to control life-threatening bleeding before professional help arrives.",
    icon: "🩸",
    severity: "critical",
    steps: [
      "Stay calm and immediately call emergency services (911).",
      "Apply firm, direct pressure with a clean cloth or bandage over the wound.",
      "Elevate the injured area above the level of the heart if possible.",
      "Do NOT remove embedded objects — stabilize them instead.",
      "Continue applying pressure — do NOT lift the cloth to check the wound.",
      "If blood soaks through, add more material on top without removing original.",
      "If limb is involved and bleeding is uncontrolled, consider a tourniquet as last resort.",
      "Monitor the person's breathing and consciousness.",
      "Keep the person warm and still until help arrives.",
    ],
  },
  {
    id: "stroke",
    title: "Stroke Recognition & Response",
    category: "Neurological",
    description: "Recognize and respond to a stroke using the FAST method.",
    icon: "🧠",
    severity: "critical",
    steps: [
      "Remember FAST: Face drooping, Arm weakness, Speech difficulty, Time to call 911.",
      "Check Face: Ask them to smile — is one side drooping?",
      "Check Arms: Ask them to raise both arms — does one drift down?",
      "Check Speech: Ask them to repeat a simple phrase — is it slurred or strange?",
      "If ANY of these signs: Call 911 IMMEDIATELY. Note the time symptoms started.",
      "Keep the person calm and comfortable.",
      "Do NOT give food, water, or medications.",
      "Do NOT drive the person to hospital yourself — wait for ambulance.",
      "Be ready to perform CPR if the person loses consciousness and stops breathing.",
    ],
  },
];

const categoryColors: Record<string, string> = {
  Cardiac: "bg-red-100 text-red-700 border-red-200",
  Airway: "bg-blue-100 text-blue-700 border-blue-200",
  Burns: "bg-orange-100 text-orange-700 border-orange-200",
  Trauma: "bg-amber-100 text-amber-700 border-amber-200",
  Neurological: "bg-purple-100 text-purple-700 border-purple-200",
  General: "bg-green-100 text-green-700 border-green-200",
};

const severityBadge: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border border-destructive/20",
  high: "bg-orange-100 text-orange-700 border border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

export default function FirstAidPage() {
  const [guides, setGuides] = useState<Guide[]>(defaultGuides);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>("cpr");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      const { data } = await supabase.from("first_aid_guides").select("*").eq("is_active", true);
      if (data && data.length > 0) {
        const mapped = data.map((g) => ({
          ...g,
          steps: Array.isArray(g.steps) ? (g.steps as string[]) : [],
        }));
        setGuides([...defaultGuides, ...mapped]);
      }
      setLoading(false);
    };
    fetchGuides();
  }, []);

  const filtered = guides.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(guides.map((g) => g.category))];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-secondary py-10 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-extrabold text-secondary-foreground">First Aid Guides</h1>
          </div>
          <p className="text-secondary-foreground/70 mb-5 text-sm md:text-base">
            Step-by-step emergency instructions. Stay calm, follow the steps.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search guides (CPR, burns, choking…)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Emergency reminder */}
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-8">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-foreground">
            <strong>Always call 911 first</strong> in a life-threatening emergency. These guides are meant to help while you wait for professional help.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                categoryColors[cat] || "bg-muted text-muted-foreground border-border"
              } hover:opacity-80 transition-opacity`}
              onClick={() => setSearch(cat === search ? "" : cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Guides accordion */}
        <div className="space-y-3">
          {filtered.map((guide, i) => (
            <div
              key={guide.id}
              className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-accent/50 transition-colors"
                onClick={() => setExpanded(expanded === guide.id ? null : guide.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{guide.icon || "📋"}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-card-foreground text-base leading-tight">{guide.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityBadge[guide.severity] || severityBadge.medium}`}>
                        {guide.severity}
                      </span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block ${categoryColors[guide.category] || "bg-muted text-muted-foreground border-border"}`}>
                      {guide.category}
                    </span>
                  </div>
                </div>
                {expanded === guide.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 ml-2" />
                )}
              </button>

              {expanded === guide.id && (
                <div className="px-5 pb-5 border-t border-border">
                  <p className="text-muted-foreground text-sm mt-4 mb-4">{guide.description}</p>
                  <ol className="space-y-2.5">
                    {guide.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-foreground leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-semibold">No guides found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
