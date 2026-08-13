import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-auth";
import { ALL_SKILLS, PROJECT_TYPES, VERIFIER_TYPES, skillCategory } from "@/lib/skillgraph";

export const Route = createFileRoute("/_authenticated/add-proof")({
  head: () => ({
    meta: [
      { title: "Add Proof of Work — SkillGraph" },
      { name: "description", content: "Publish real evidence of what you built, made or delivered." },
      { property: "og:title", content: "Add Proof of Work — SkillGraph" },
      { property: "og:description", content: "Publish real evidence of what you built, made or delivered." },
    ],
  }),
  component: AddProof,
});

const schema = z.object({
  title: z.string().trim().min(4, "Give your proof a clear title").max(120),
  description: z.string().trim().min(20, "Describe what you actually did (20+ characters)").max(2000),
  media: z.string().trim().max(500).optional(),
  link: z.string().trim().max(500).optional(),
});

function AddProof() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", media: "", link: "" });
  const [skills, setSkills] = useState<string[]>([]);
  const [verifier, setVerifier] = useState("Client");
  const [projectType, setProjectType] = useState("Freelance");
  const [saving, setSaving] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string[] | null>(null);

  const toggleSkill = (s: string) => setSkills((v) => (v.includes(s) ? v.filter((x) => x !== s) : [...v, s]));

  function runAiAssist() {
    const text = `${form.title} ${form.description}`.toLowerCase();
    const detected = ALL_SKILLS.filter((s) => text.includes(s.toLowerCase()));
    setAiSuggestion(detected.length ? detected : ["Project Management"]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please complete the form");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("proofs")
      .insert({
        user_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        media_urls: parsed.data.media ? [parsed.data.media] : [],
        links: parsed.data.link ? [parsed.data.link] : [],
        skills,
        project_type: projectType,
        verifier_type: verifier,
        verification_status: verifier === "Self" ? "self" : "pending",
      })
      .select("id")
      .single();

    if (!error && skills.length) {
      await supabase
        .from("user_skills")
        .upsert(
          skills.map((name) => ({ user_id: user.id, name, category: skillCategory(name) })),
          { onConflict: "user_id,name" },
        );
    }
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Proof published — your profile just got stronger");
    navigate({ to: "/proof/$proofId", params: { proofId: data.id } });
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold">Add Proof of Work</h1>
      <p className="text-sm text-muted-foreground">What did you accomplish?</p>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <div className="card-surface space-y-4 p-5">
          <div className="space-y-1.5">
            <Label>Project title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Built an inventory system for a local shop"
            />
          </div>
          <div className="space-y-1.5">
            <Label>What did you do?</Label>
            <Textarea
              rows={6}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the problem, what you built and the result."
            />
          </div>
          <Button type="button" variant="soft" size="sm" onClick={runAiAssist}>
            <Sparkles className="size-4" /> AI-assisted analysis
          </Button>
          {aiSuggestion && (
            <div className="rounded-2xl bg-primary-soft p-4 text-sm">
              <p className="font-semibold text-primary">Suggested skills detected</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {aiSuggestion.map((s) => (
                  <Chip key={s} label={s} selected={skills.includes(s)} onClick={() => toggleSkill(s)} />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                AI-assisted analysis only. Verification always comes from real people.
              </p>
            </div>
          )}
        </div>

        <Block title="Skills used">
          <div className="flex flex-wrap gap-2">
            {ALL_SKILLS.map((s) => (
              <Chip key={s} label={s} selected={skills.includes(s)} onClick={() => toggleSkill(s)} />
            ))}
          </div>
        </Block>

        <Block title="Upload proof" subtitle="Add an image URL, link, GitHub repository, website or portfolio.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={form.media}
              onChange={(e) => setForm({ ...form, media: e.target.value })}
              placeholder="Image or video URL"
            />
            <Input
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="GitHub, Drive, website…"
            />
          </div>
        </Block>

        <Block title="Who can verify this?">
          <div className="flex flex-wrap gap-2">
            {VERIFIER_TYPES.map((v) => (
              <Chip key={v} label={v} selected={verifier === v} onClick={() => setVerifier(v)} />
            ))}
          </div>
        </Block>

        <Block title="Project type">
          <div className="flex flex-wrap gap-2">
            {PROJECT_TYPES.map((p) => (
              <Chip key={p} label={p} selected={projectType === p} onClick={() => setProjectType(p)} />
            ))}
          </div>
        </Block>

        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : null} Submit Proof
        </Button>
      </form>
    </AppShell>
  );
}

function Block({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card-surface p-5">
      <p className="font-semibold">{title}</p>
      {subtitle ? <p className="mb-3 text-sm text-muted-foreground">{subtitle}</p> : <div className="mb-3" />}
      {children}
    </div>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"
      }`}
    >
      {label}
    </button>
  );
}
