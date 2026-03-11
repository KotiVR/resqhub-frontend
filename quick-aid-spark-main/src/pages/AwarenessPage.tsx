import Navbar from "@/components/Navbar";
import { ShieldCheck, CheckSquare, Clock, Phone, Lightbulb } from "lucide-react";

const preparednessChecklist = [
  "Know your local emergency number (911 or equivalent)",
  "Keep a first aid kit stocked and accessible",
  "Have emergency contacts saved in your phone",
  "Know the location of nearest hospital and fire station",
  "Keep a 72-hour emergency supply kit (water, food, flashlight, batteries)",
  "Learn basic CPR and first aid techniques",
  "Know how to turn off gas, electricity, and water in your home",
  "Have a family emergency meeting point designated",
  "Keep copies of important documents in a waterproof container",
  "Ensure smoke and carbon monoxide detectors are working",
];

const beforeAmbulanceSteps = [
  { icon: "📞", title: "Call 911 Immediately", desc: "Give your exact location, describe the emergency, and stay on the line." },
  { icon: "🧘", title: "Stay Calm", desc: "Panic makes things worse. Take deep breaths and focus on what you can do." },
  { icon: "🚫", title: "Don't Move the Injured", desc: "Unless there is immediate danger (fire, flooding), keep the person still." },
  { icon: "✋", title: "Apply First Aid", desc: "Follow the appropriate first aid guide for the situation." },
  { icon: "🚪", title: "Unlock Your Door", desc: "Unlock front door so paramedics can enter immediately." },
  { icon: "💡", title: "Turn On Lights", desc: "Turn on all outside lights to help emergency services find your location." },
  { icon: "🐕", title: "Secure Pets", desc: "Keep pets away from the area so they don't interfere with responders." },
  { icon: "📋", title: "Gather Information", desc: "Have a list of current medications, allergies, and medical history ready." },
];

const safetyTips = [
  { category: "Home Safety", tips: [
    "Install smoke detectors on every floor",
    "Keep fire extinguisher in kitchen",
    "Never leave cooking unattended",
    "Store medications safely out of children's reach",
    "Keep a first aid kit in an easily accessible location",
  ]},
  { category: "Road Safety", tips: [
    "Always wear your seatbelt",
    "Never drive under the influence",
    "Follow speed limits, especially in school zones",
    "Avoid using mobile phone while driving",
    "Ensure your vehicle has an emergency kit",
  ]},
  { category: "Outdoor Safety", tips: [
    "Always tell someone your plans and expected return time",
    "Carry a charged mobile phone",
    "Know basic wilderness first aid",
    "Check weather forecasts before outdoor activities",
    "Carry a whistle for signaling in an emergency",
  ]},
];

export default function AwarenessPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-secondary py-10 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-extrabold text-secondary-foreground">Emergency Awareness</h1>
          </div>
          <p className="text-secondary-foreground/70 text-sm md:text-base">
            Preparation saves lives. Know what to do before, during, and after an emergency.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-12">

        {/* Before Ambulance Arrives */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Before the Ambulance Arrives</h2>
              <p className="text-muted-foreground text-sm">Critical minutes — what to do right now</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {beforeAmbulanceSteps.map((step, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 shadow-card card-hover">
                <div className="text-2xl mb-2">{step.icon}</div>
                <h3 className="font-bold text-sm text-card-foreground mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Preparedness Checklist */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Emergency Preparedness Checklist</h2>
              <p className="text-muted-foreground text-sm">Are you ready for an emergency?</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {preparednessChecklist.map((item, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-border accent-[hsl(var(--primary))] cursor-pointer" />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-relaxed">{item}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
              ✅ Check off items you've completed. Review and update your preparedness regularly.
            </p>
          </div>
        </section>

        {/* Safety Tips */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Safety Tips by Category</h2>
              <p className="text-muted-foreground text-sm">Prevention is the best emergency response</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {safetyTips.map((cat, i) => (
              <div key={i} className="bg-card rounded-xl border border-border shadow-card p-5">
                <h3 className="font-bold text-card-foreground mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                  {cat.category}
                </h3>
                <ul className="space-y-2.5">
                  {cat.tips.map((tip, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      <span className="text-muted-foreground leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency Numbers Reference */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Important Emergency Numbers</h2>
              <p className="text-muted-foreground text-sm">Save these to your phone now</p>
            </div>
          </div>
          <div className="bg-secondary rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "🚑", service: "Ambulance", number: "911" },
                { icon: "🚓", service: "Police", number: "911" },
                { icon: "🚒", service: "Fire", number: "911" },
                { icon: "☠️", service: "Poison Control", number: "1-800-222-1222" },
                { icon: "💙", service: "Crisis Line", number: "988" },
                { icon: "🌊", service: "Coast Guard", number: "VHF-FM Ch16" },
                { icon: "🧠", service: "NAMI Helpline", number: "1-800-950-6264" },
                { icon: "🏥", service: "General Info", number: "211" },
              ].map((item) => (
                <a
                  key={item.service}
                  href={`tel:${item.number}`}
                  className="bg-card rounded-xl p-4 text-center card-hover border border-border block"
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="font-bold text-xs text-card-foreground">{item.service}</p>
                  <p className="text-primary font-bold text-sm mt-1">{item.number}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8 px-4 mt-10">
        <div className="container mx-auto text-center">
          <p className="text-secondary-foreground/60 text-sm">
            ResQHub Emergency Awareness — Knowledge saves lives
          </p>
        </div>
      </footer>
    </div>
  );
}
