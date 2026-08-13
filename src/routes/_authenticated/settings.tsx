import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/skillgraph";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SkillGraph" },
      { name: "description", content: "Edit your SkillGraph profile, headline, location and bio." },
      { property: "og:title", content: "Settings — SkillGraph" },
      { property: "og:description", content: "Edit your profile, headline, location and bio." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", headline: "", bio: "", city: "", country: "" });
  const [saving, setSaving] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data as Profile | null;
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        username: profile.username ?? "",
        headline: profile.headline ?? "",
        bio: profile.bio ?? "",
        city: profile.city ?? "",
        country: profile.country ?? "",
      });
    }
  }, [profile]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["my-profile", user.id] });
    toast.success("Profile updated");
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold">Settings</h1>
      <div className="card-surface mt-5 space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
          <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
        </div>
        <Field label="Headline" value={form.headline} onChange={(v) => setForm({ ...form, headline: v })} />
        <div className="space-y-1.5">
          <Label>Bio</Label>
          <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="hero" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
