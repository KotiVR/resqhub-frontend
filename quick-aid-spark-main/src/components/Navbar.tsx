import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, Menu, X, MapPin, BookOpen, ShieldCheck, User, LogOut, Settings
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/first-aid", label: "First Aid" },
  { href: "/map", label: "Map" },
  { href: "/awareness", label: "Awareness" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-secondary text-secondary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl" onClick={() => setOpen(false)}>
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-primary">ResQ</span>
            <span className="text-secondary-foreground">Hub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  location.pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-secondary-foreground/80 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${
                  location.pathname === "/admin"
                    ? "bg-primary text-primary-foreground"
                    : "text-secondary-foreground/80 hover:bg-secondary-foreground/10"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-secondary-foreground/70 text-sm flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> {user.email?.split("@")[0]}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" /> Sign Out
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary-foreground/10 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-3 pb-4 space-y-1 border-t border-secondary-foreground/20">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  location.pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-secondary-foreground/80 hover:bg-secondary-foreground/10"
                }`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-secondary-foreground/80 hover:bg-secondary-foreground/10 flex items-center gap-1"
                onClick={() => setOpen(false)}
              >
                <Settings className="w-3.5 h-3.5" /> Admin Panel
              </Link>
            )}
            <div className="pt-2 border-t border-secondary-foreground/20 mt-2">
              {user ? (
                <button
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-secondary-foreground/80 hover:bg-secondary-foreground/10 flex items-center gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out ({user.email?.split("@")[0]})
                </button>
              ) : (
                <button
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold text-primary hover:bg-secondary-foreground/10"
                  onClick={() => { navigate("/auth"); setOpen(false); }}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
