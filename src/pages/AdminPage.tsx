import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Settings, BookOpen, Phone, Plus, Pencil, Trash2, Save, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Guide {
  id: string;
  title: string;
  category: string;
  description: string;
  steps: string[];
  icon: string | null;
  severity: string;
  is_active: boolean;
}

interface Contact {
  id: string;
  service_type: string;
  name: string;
  phone_number: string;
  location: string | null;
  is_active: boolean;
}

type Tab = "guides" | "contacts";

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("guides");
  const [guides, setGuides] = useState<Guide[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [editingGuide, setEditingGuide] = useState<Partial<Guide> | null>(null);
  const [editingContact, setEditingContact] = useState<Partial<Contact> | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
    if (!loading && user && !isAdmin) {
      toast({ title: "Access Denied", description: "Admin access required.", variant: "destructive" });
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setDataLoading(true);
    const [guidesRes, contactsRes] = await Promise.all([
      supabase.from("first_aid_guides").select("*").order("created_at", { ascending: false }),
      supabase.from("emergency_contacts").select("*").order("created_at", { ascending: false }),
    ]);
    if (guidesRes.data) {
      setGuides(guidesRes.data.map(g => ({ ...g, steps: Array.isArray(g.steps) ? g.steps as string[] : [] })));
    }
    if (contactsRes.data) setContacts(contactsRes.data);
    setDataLoading(false);
  };

  // Guide CRUD
  const saveGuide = async () => {
    if (!editingGuide?.title || !editingGuide?.category || !editingGuide?.description) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    const payload = {
      title: editingGuide.title,
      category: editingGuide.category,
      description: editingGuide.description,
      steps: editingGuide.steps || [],
      icon: editingGuide.icon || null,
      severity: editingGuide.severity || "medium",
      is_active: editingGuide.is_active !== false,
    };
    if (editingGuide.id) {
      await supabase.from("first_aid_guides").update(payload).eq("id", editingGuide.id);
      toast({ title: "Guide updated!" });
    } else {
      await supabase.from("first_aid_guides").insert(payload);
      toast({ title: "Guide created!" });
    }
    setEditingGuide(null);
    fetchData();
  };

  const deleteGuide = async (id: string) => {
    if (!confirm("Delete this guide?")) return;
    await supabase.from("first_aid_guides").delete().eq("id", id);
    toast({ title: "Guide deleted." });
    fetchData();
  };

  // Contact CRUD
  const saveContact = async () => {
    if (!editingContact?.name || !editingContact?.service_type || !editingContact?.phone_number) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    const payload = {
      name: editingContact.name,
      service_type: editingContact.service_type,
      phone_number: editingContact.phone_number,
      location: editingContact.location || null,
      is_active: editingContact.is_active !== false,
    };
    if (editingContact.id) {
      await supabase.from("emergency_contacts").update(payload).eq("id", editingContact.id);
      toast({ title: "Contact updated!" });
    } else {
      await supabase.from("emergency_contacts").insert(payload);
      toast({ title: "Contact created!" });
    }
    setEditingContact(null);
    fetchData();
  };

  const deleteContact = async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    await supabase.from("emergency_contacts").delete().eq("id", id);
    toast({ title: "Contact deleted." });
    fetchData();
  };

  if (loading || (!isAdmin && user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-secondary py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-secondary-foreground">Admin Panel</h1>
              <p className="text-secondary-foreground/70 text-sm">Manage first-aid guides and emergency contacts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={tab === "guides" ? "default" : "outline"}
            onClick={() => setTab("guides")}
            className={tab === "guides" ? "bg-primary text-primary-foreground" : ""}
          >
            <BookOpen className="w-4 h-4 mr-2" /> First Aid Guides
          </Button>
          <Button
            variant={tab === "contacts" ? "default" : "outline"}
            onClick={() => setTab("contacts")}
            className={tab === "contacts" ? "bg-primary text-primary-foreground" : ""}
          >
            <Phone className="w-4 h-4 mr-2" /> Emergency Contacts
          </Button>
        </div>

        {/* ===== GUIDES TAB ===== */}
        {tab === "guides" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-foreground">First Aid Guides ({guides.length} in DB)</h2>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setEditingGuide({ severity: "medium", steps: [], is_active: true })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Guide
              </Button>
            </div>

            {/* Guide Edit Form */}
            {editingGuide && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-card">
                <h3 className="font-bold text-base text-foreground mb-4">
                  {editingGuide.id ? "Edit Guide" : "New Guide"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <Label>Title *</Label>
                    <Input
                      value={editingGuide.title || ""}
                      onChange={(e) => setEditingGuide({ ...editingGuide, title: e.target.value })}
                      placeholder="e.g., Snake Bite First Aid"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category *</Label>
                    <Input
                      value={editingGuide.category || ""}
                      onChange={(e) => setEditingGuide({ ...editingGuide, category: e.target.value })}
                      placeholder="e.g., Trauma, Cardiac, Burns"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Icon (emoji)</Label>
                    <Input
                      value={editingGuide.icon || ""}
                      onChange={(e) => setEditingGuide({ ...editingGuide, icon: e.target.value })}
                      placeholder="🐍"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Severity</Label>
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                      value={editingGuide.severity || "medium"}
                      onChange={(e) => setEditingGuide({ ...editingGuide, severity: e.target.value })}
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5 mb-4">
                  <Label>Description *</Label>
                  <Textarea
                    value={editingGuide.description || ""}
                    onChange={(e) => setEditingGuide({ ...editingGuide, description: e.target.value })}
                    placeholder="Brief description of when to use this guide..."
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5 mb-4">
                  <Label>Steps (one per line)</Label>
                  <Textarea
                    value={(editingGuide.steps || []).join("\n")}
                    onChange={(e) => setEditingGuide({ ...editingGuide, steps: e.target.value.split("\n").filter(Boolean) })}
                    placeholder="Step 1&#10;Step 2&#10;Step 3..."
                    rows={5}
                  />
                </div>
                <div className="flex gap-3">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={saveGuide}>
                    <Save className="w-4 h-4 mr-2" /> Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditingGuide(null)}>
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Guides List */}
            {dataLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : guides.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No custom guides yet. Add your first guide above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {guides.map((guide) => (
                  <div key={guide.id} className="bg-card rounded-xl border border-border p-4 flex items-start justify-between gap-4 shadow-card">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-2xl">{guide.icon || "📋"}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-card-foreground text-sm">{guide.title}</p>
                        <p className="text-xs text-muted-foreground">{guide.category} · {guide.severity}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{guide.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => setEditingGuide(guide)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => deleteGuide(guide.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== CONTACTS TAB ===== */}
        {tab === "contacts" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-foreground">Emergency Contacts ({contacts.length})</h2>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setEditingContact({ is_active: true })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Contact
              </Button>
            </div>

            {/* Contact Edit Form */}
            {editingContact && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-card">
                <h3 className="font-bold text-base text-foreground mb-4">
                  {editingContact.id ? "Edit Contact" : "New Contact"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <Label>Service Name *</Label>
                    <Input
                      value={editingContact.name || ""}
                      onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                      placeholder="e.g., City General Hospital"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Service Type *</Label>
                    <Input
                      value={editingContact.service_type || ""}
                      onChange={(e) => setEditingContact({ ...editingContact, service_type: e.target.value })}
                      placeholder="e.g., Hospital, Police, Fire"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone Number *</Label>
                    <Input
                      value={editingContact.phone_number || ""}
                      onChange={(e) => setEditingContact({ ...editingContact, phone_number: e.target.value })}
                      placeholder="555-0100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location (optional)</Label>
                    <Input
                      value={editingContact.location || ""}
                      onChange={(e) => setEditingContact({ ...editingContact, location: e.target.value })}
                      placeholder="123 Main St, City"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={saveContact}>
                    <Save className="w-4 h-4 mr-2" /> Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditingContact(null)}>
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Contacts List */}
            {dataLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
                <Phone className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No emergency contacts yet. Add your first contact above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="bg-card rounded-xl border border-border p-4 flex items-start justify-between gap-4 shadow-card">
                    <div>
                      <p className="font-bold text-card-foreground text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.service_type}</p>
                      <p className="text-primary font-semibold text-sm">📞 {contact.phone_number}</p>
                      {contact.location && <p className="text-xs text-muted-foreground">📍 {contact.location}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => setEditingContact(contact)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => deleteContact(contact.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin note */}
        <div className="mt-8 bg-accent rounded-xl p-4 flex items-start gap-3 border border-border">
          <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-foreground">Admin Access Only</p>
            <p className="text-muted-foreground">
              To grant admin access to a user, run this SQL in your database:
              <code className="block bg-secondary text-secondary-foreground rounded px-3 py-2 mt-2 text-xs font-mono">
                INSERT INTO user_roles (user_id, role) VALUES ('USER_UUID', 'admin');
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
