import Navbar from "@/components/Navbar";
import SOSButton from "@/components/SOSButton";
import EmergencyDashboard from "@/components/EmergencyDashboard";
import QuickStats from "@/components/QuickStats";
import { Link } from "react-router-dom";
import { BookOpen, MapPin, ShieldCheck, ChevronRight } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient py-14 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/20 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-4 backdrop-blur-sm border border-primary-foreground/30">
            🚨 Emergency Ready — 24/7
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground mb-3 leading-tight">
            ResQHub
          </h1>
          <p className="text-primary-foreground/90 text-lg md:text-xl font-medium mb-2">
            Emergency Help & Rescue Assistance
          </p>
          <p className="text-primary-foreground/75 text-base mb-8 max-w-xl mx-auto">
            Life-saving guidance, emergency contacts, and real-time location support — all in one place.
          </p>
          <SOSButton />
        </div>
      </section>

      <QuickStats />

      {/* Emergency Dashboard */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
              Emergency Services
            </h2>
            <p className="text-muted-foreground">Tap to call emergency services immediately</p>
          </div>
          <EmergencyDashboard />
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-10 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-extrabold text-center mb-8 text-foreground">
            Life-Saving Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/first-aid" className="block">
              <div className="bg-card rounded-xl p-6 shadow-card card-hover border border-border h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-card-foreground mb-2">First Aid Guides</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Step-by-step emergency first aid instructions for CPR, choking, burns, fractures, and bleeding.
                </p>
                <span className="text-primary font-semibold text-sm flex items-center gap-1">
                  View Guides <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
            <Link to="/map" className="block">
              <div className="bg-card rounded-xl p-6 shadow-card card-hover border border-border h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-card-foreground mb-2">Find Nearby Services</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Locate nearest hospitals, police stations, and fire departments using your real-time GPS location.
                </p>
                <span className="text-primary font-semibold text-sm flex items-center gap-1">
                  Open Map <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
            <Link to="/awareness" className="block">
              <div className="bg-card rounded-xl p-6 shadow-card card-hover border border-border h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-card-foreground mb-2">Emergency Awareness</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Safety tips, emergency preparedness checklists, and what to do before the ambulance arrives.
                </p>
                <span className="text-primary font-semibold text-sm flex items-center gap-1">
                  Learn More <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-primary font-extrabold text-lg">ResQ</span>
            <span className="font-bold text-lg">Hub</span>
          </div>
          <p className="text-secondary-foreground/60 text-sm">
            Emergency Help & Rescue Assistance — Always Ready, Always Here
          </p>
          <p className="text-secondary-foreground/40 text-xs mt-2">
            In case of immediate life-threatening emergency, always call your local emergency number first.
          </p>
        </div>
      </footer>
    </div>
  );
}
