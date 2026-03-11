import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  User, Phone, Heart, Shield, Hospital, Save, AlertTriangle, Loader2
} from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

interface ProfileData {
  full_name: string;
  age: string;
  gender: string;
  address: string;
  city_state: string;
  blood_group: string;
  phone_number: string;
  guardian_name: string;
  emergency_contact_1: string;
  emergency_contact_2: string;
  emergency_relationship: string;
  medical_conditions: string;
  allergies: string;
  current_medications: string;
  disability_info: string;
  doctor_name: string;
  doctor_contact: string;
  preferred_hospital: string;
  insurance_info: string;
  organ_donor: boolean;
}

const defaultProfile: ProfileData = {
  full_name: "", age: "", gender: "", address: "", city_state: "",
  blood_group: "", phone_number: "", guardian_name: "",
  emergency_contact_1: "", emergency_contact_2: "", emergency_relationship: "",
  medical_conditions: "", allergies: "", current_medications: "",
  disability_info: "", doctor_name: "", doctor_contact: "",
  preferred_hospital: "", insurance_info: "", organ_donor: false,
};

export default function EmergencyProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    fetchProfile();
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("emergency_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setHasExisting(true);
      setProfile({
        full_name: data.full_name || "",
        age: data.age?.toString() || "",
        gender: data.gender || "",
        address: data.address || "",
        city_state: data.city_state || "",
        blood_group: data.blood_group || "",
        phone_number: data.phone_number || "",
        guardian_name: data.guardian_name || "",
        emergency_contact_1: data.emergency_contact_1 || "",
        emergency_contact_2: data.emergency_contact_2 || "",
        emergency_relationship: data.emergency_relationship || "",
        medical_conditions: data.medical_conditions || "",
        allergies: data.allergies || "",
        current_medications: data.current_medications || "",
        disability_info: data.disability_info || "",
        doctor_name: data.doctor_name || "",
        doctor_contact: data.doctor_contact || "",
        preferred_hospital: data.preferred_hospital || "",
        insurance_info: data.insurance_info || "",
        organ_donor: data.organ_donor || false,
      });
    }
    setLoading(false);
  };

  const handleChange = (field: keyof ProfileData, value: string | boolean) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const payload = {
      user_id: user.id,
      full_name: profile.full_name || null,
      age: profile.age ? parseInt(profile.age) : null,
      gender: profile.gender || null,
      address: profile.address || null,
      city_state: profile.city_state || null,
      blood_group: profile.blood_group || null,
      phone_number: profile.phone_number || null,
      guardian_name: profile.guardian_name || null,
      emergency_contact_1: profile.emergency_contact_1 || null,
      emergency_contact_2: profile.emergency_contact_2 || null,
      emergency_relationship: profile.emergency_relationship || null,
      medical_conditions: profile.medical_conditions || null,
      allergies: profile.allergies || null,
      current_medications: profile.current_medications || null,
      disability_info: profile.disability_info || null,
      doctor_name: profile.doctor_name || null,
      doctor_contact: profile.doctor_contact || null,
      preferred_hospital: profile.preferred_hospital || null,
      insurance_info: profile.insurance_info || null,
      organ_donor: profile.organ_donor,
    };

    let error;
    if (hasExisting) {
      ({ error } = await supabase
        .from("emergency_profiles")
        .update(payload)
        .eq("user_id", user.id));
    } else {
      ({ error } = await supabase
        .from("emergency_profiles")
        .insert(payload));
    }

    setSaving(false);
    if (error) {
      toast.error("Failed to save profile. Please try again.");
    } else {
      setHasExisting(true);
      toast.success("Emergency profile saved successfully!");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="hero-gradient py-10 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/20 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-3 backdrop-blur-sm border border-primary-foreground/30">
            <Shield className="w-4 h-4" /> Safety Profile
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-2">
            Emergency Profile
          </h1>
          <p className="text-primary-foreground/80 text-base">
            Store your critical medical & personal information for emergency responders.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" /> Personal Information
            </CardTitle>
            <CardDescription>Basic identification details</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" placeholder="Enter your full name" value={profile.full_name} onChange={e => handleChange("full_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" placeholder="Age" value={profile.age} onChange={e => handleChange("age", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={profile.gender} onValueChange={v => handleChange("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Blood Group</Label>
              <Select value={profile.blood_group} onValueChange={v => handleChange("blood_group", v)}>
                <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input id="phone_number" placeholder="+91 XXXXX XXXXX" value={profile.phone_number} onChange={e => handleChange("phone_number", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city_state">City / State</Label>
              <Input id="city_state" placeholder="City, State" value={profile.city_state} onChange={e => handleChange("city_state", e.target.value)} />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Full address" value={profile.address} onChange={e => handleChange("address", e.target.value)} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="w-5 h-5 text-destructive" /> Emergency Contacts
            </CardTitle>
            <CardDescription>People to contact in an emergency</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="guardian_name">Parent / Guardian Name</Label>
              <Input id="guardian_name" placeholder="Guardian name" value={profile.guardian_name} onChange={e => handleChange("guardian_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergency_relationship">Relationship</Label>
              <Input id="emergency_relationship" placeholder="e.g. Father, Mother, Spouse" value={profile.emergency_relationship} onChange={e => handleChange("emergency_relationship", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergency_contact_1">Emergency Contact 1</Label>
              <Input id="emergency_contact_1" placeholder="+91 XXXXX XXXXX" value={profile.emergency_contact_1} onChange={e => handleChange("emergency_contact_1", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergency_contact_2">Emergency Contact 2</Label>
              <Input id="emergency_contact_2" placeholder="+91 XXXXX XXXXX" value={profile.emergency_contact_2} onChange={e => handleChange("emergency_contact_2", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-destructive" /> Medical Information
            </CardTitle>
            <CardDescription>Critical health details for responders</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="medical_conditions">Known Diseases / Medical Conditions</Label>
              <Textarea id="medical_conditions" placeholder="e.g. Diabetes, Asthma, Heart Disease" value={profile.medical_conditions} onChange={e => handleChange("medical_conditions", e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="allergies">Allergies</Label>
              <Input id="allergies" placeholder="e.g. Penicillin, Peanuts" value={profile.allergies} onChange={e => handleChange("allergies", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="current_medications">Current Medications</Label>
              <Input id="current_medications" placeholder="e.g. Metformin, Insulin" value={profile.current_medications} onChange={e => handleChange("current_medications", e.target.value)} />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="disability_info">Disability Information</Label>
              <Textarea id="disability_info" placeholder="Any disability or special needs (optional)" value={profile.disability_info} onChange={e => handleChange("disability_info", e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doctor_name">Doctor Name</Label>
              <Input id="doctor_name" placeholder="Dr. name" value={profile.doctor_name} onChange={e => handleChange("doctor_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doctor_contact">Doctor Contact Number</Label>
              <Input id="doctor_contact" placeholder="+91 XXXXX XXXXX" value={profile.doctor_contact} onChange={e => handleChange("doctor_contact", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Additional Safety Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Hospital className="w-5 h-5 text-primary" /> Additional Safety Details
            </CardTitle>
            <CardDescription>Hospital, insurance, and organ donor preferences</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="preferred_hospital">Preferred Hospital</Label>
              <Input id="preferred_hospital" placeholder="Hospital name" value={profile.preferred_hospital} onChange={e => handleChange("preferred_hospital", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="insurance_info">Insurance Information</Label>
              <Input id="insurance_info" placeholder="Policy number or provider" value={profile.insurance_info} onChange={e => handleChange("insurance_info", e.target.value)} />
            </div>
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <Switch
                checked={profile.organ_donor}
                onCheckedChange={v => handleChange("organ_donor", v)}
              />
              <Label className="cursor-pointer">I am an organ donor</Label>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center pb-8">
          <Button
            size="lg"
            className="px-10 text-base font-bold gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? "Saving..." : "Save Emergency Profile"}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-secondary-foreground/60 text-sm">
            ResQHub © 2026 — Emergency Help & Rescue Assistance Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
