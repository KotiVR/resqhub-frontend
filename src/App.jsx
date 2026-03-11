import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect } from "react";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import FirstAidPage from "./pages/FirstAidPage";
import MapPage from "./pages/MapPage";
import AwarenessPage from "./pages/AwarenessPage";
import EmergencyProfilePage from "./pages/EmergencyProfilePage";

import Chatbot from "./components/Chatbot";
import FloatingPanicButton from "./components/FloatingPanicButton";

import { API_URL } from "./api";

const queryClient = new QueryClient();

function App() {

  // TEST BACKEND CONNECTION
  useEffect(() => {
    fetch(`${API_URL}/contacts`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Contacts from backend:", data);
      })
      .catch((err) => {
        console.error("Backend connection failed:", err);
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <AuthProvider>

            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/first-aid" element={<FirstAidPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/awareness" element={<AwarenessPage />} />
              <Route path="/emergency-profile" element={<EmergencyProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Chatbot />
            <FloatingPanicButton />

          </AuthProvider>
        </BrowserRouter>

      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;