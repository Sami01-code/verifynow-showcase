import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Check, Plus, Search, Sparkles } from "lucide-react";
import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile, useSession } from "@/hooks/use-auth";
import {
  ALL_SKILLS,
  EXPERIENCE_LEVELS,
  GOALS,
  OPPORTUNITY_LOCATIONS,
  OPPORTUNITY_PREFERENCES,
  PROOF_TYPES,
  SKILL_CATALOG,
  skillCategory,
} from "@/lib/skillgraph";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Build your SkillGraph — Onboarding" },
      { name: "description", content: "Five quick questions to personalise your proof-of-skill profile." },
      { property: "og:title", content: "Build your SkillGraph" },
      { property: "og:description", content: "Five quick questions to personalise your proof-of-skill profile." },
    ],
  }),
  component: Onboarding,
});

const DRAFT_KEY = "skillgraph.onboarding.draft";

type Draft = {
  goals: string[];
  skills: string[];
  level: string;
  proofTypes: string[];
  preferences: string[];
  locations: string[];
};

const emptyDraft: Draft = { goals: [], skills: [], level: "", proofTypes: [], preferences: [], locations: [] };

function Onboarding() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { data: profile } = useMyProfile(user);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (stored) setDraft({ ...emptyDraft, ...JSON.parse(stored) });
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const toggle = (key: keyof Draft, value: string) =>
    setDraft((d) => {
      const list = d[key] as string[];
      return { ...d, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] };
    });

  async function finish() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        goals: draft.goals,
        experience_level: draft.level || "Beginner",
        proof_types: draft.proofTypes,
        opportunity_preferences: draft.preferences,
        opportunity_locations: draft.locations,
        onboarding_complete: true,
      })
      .eq("id", user.id);
    if (!error && draft.skills.length) {
      await supabase.from("user_skills").upsert(
        draft.skills.map((name) => ({
          user_id: user.id,
          name,
          category: skillCategory(name),
        })),
        { onConflict: "user_id,name" },
      );
    }
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    localStorage.removeItem(DRAFT_KEY);
    setStep(6);
  }

  if (step === 6) return <Completion draft={draft} onGo={() => navigate({ to: "/add-proof" })} />;

  const filtered = query
    ? ALL_SKILLS.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-hero-mesh px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <BrandLockup />
          <span className="text-sm font-medium text-muted-foreground">Step {step} of 5</span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <div key={step} className="card-surface mt-6 animate-rise p-6 sm:p-8">
          {step === 1 && (
            <StepBlock
              title="What brings you to SkillGraph?"
              subtitle="This helps us personalise your experience. Select all that apply."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {GOALS.map((g) => (
                  <SelectCard
                    key={g.value}
                    title={g.value}
                    desc={g.desc}
                    selected={draft.goals.includes(g.value)}
                    onClick={() => toggle("goals", g.value)}
                  />
                ))}
              </div>
            </StepBlock>
          )}

          {step === 2 && (
            <StepBlock title="What skills do you have?" subtitle="Select everything you're comfortable doing.">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search skills, or type your own"
                  className="pl-9"
                />
              </div>
              {query && (
                <div className="flex flex-wrap gap-2">
                  {filtered.map((s) => (
                    <SkillChip key={s} label={s} selected={draft.skills.includes(s)} onClick={() => toggle("skills", s)} />
                  ))}
                  {!ALL_SKILLS.some((s) => s.toLowerCase() === query.toLowerCase()) && (
                    <button
                      onClick={() => {
                        toggle("skills", query.trim());
                        setQuery("");
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary px-3 py-1 text-sm font-medium text-primary"
                    >
                      <Plus className="size-3.5" /> Add &quot;{query}&quot;
                    </button>
                  )}
                </div>
              )}
              {draft.skills.length > 0 && (
                <div className="rounded-2xl bg-primary-soft p-3">
                  <p className="text-xs font-semibold text-primary">Selected ({draft.skills.length})</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {draft.skills.map((s) => (
                      <SkillChip key={s} label={s} selected onClick={() => toggle("skills", s)} />
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {Object.entries(SKILL_CATALOG).map(([cat, list]) => (
                  <div key={cat}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {list.map((s) => (
                        <SkillChip
                          key={s}
                          label={s}
                          selected={draft.skills.includes(s)}
                          onClick={() => toggle("skills", s)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </StepBlock>
          )}

          {step === 3 && (
            <StepBlock
              title="How would you describe your experience?"
              subtitle="You can change this later. Your actual proof will matter more than the level you select."
            >
              <div className="grid gap-3">
                {EXPERIENCE_LEVELS.map((l) => (
                  <SelectCard
                    key={l.value}
                    title={l.value}
                    desc={l.desc}
                    selected={draft.level === l.value}
                    onClick={() => setDraft((d) => ({ ...d, level: l.value }))}
                  />
                ))}
              </div>
            </StepBlock>
          )}

          {step === 4 && (
            <StepBlock title="What can you show us?" subtitle="Your profile becomes stronger when you add real evidence.">
              <div className="flex flex-wrap gap-2">
                {PROOF_TYPES.map((p) => (
                  <SkillChip key={p} label={p} selected={draft.proofTypes.includes(p)} onClick={() => toggle("proofTypes", p)} />
                ))}
              </div>
              {draft.proofTypes.includes("I don't have proof yet") && (
                <div className="rounded-2xl bg-primary-soft p-4 text-sm font-medium text-accent-foreground">
                  That&apos;s completely fine. SkillGraph can help you build your first proof.
                </div>
              )}
            </StepBlock>
          )}

          {step === 5 && (
            <StepBlock title="What do you want SkillGraph to help you find?">
              <div className="grid gap-2 sm:grid-cols-2">
                {OPPORTUNITY_PREFERENCES.map((o) => (
                  <SelectCard
                    key={o}
                    title={o}
                    selected={draft.preferences.includes(o)}
                    onClick={() => toggle("preferences", o)}
                  />
                ))}
              </div>
              <div>
                <p className="font-semibold">Where do you want opportunities?</p>
                <p className="text-sm text-muted-foreground">
                  Based on {profile?.city ?? "your city"}, {profile?.country ?? "your country"}.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {OPPORTUNITY_LOCATIONS.map((l) => (
                    <SkillChip key={l} label={l} selected={draft.locations.includes(l)} onClick={() => toggle("locations", l)} />
                  ))}
                </div>
              </div>
            </StepBlock>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="text-muted-foreground"
            >
              <ArrowLeft className="size-4" /> Back
            </Button>
            <div className="flex items-center gap-2">
              {step !== 3 && step !== 5 && (
                <Button variant="ghost" className="text-muted-foreground" onClick={() => setStep((s) => s + 1)}>
                  Skip
                </Button>
              )}
              {step < 5 ? (
                <Button variant="hero" size="lg" onClick={() => setStep((s) => s + 1)}>
                  Continue
                </Button>
              ) : (
                <Button variant="hero" size="lg" onClick={finish} disabled={saving}>
                  Build My SkillGraph
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

function SelectCard({
  title,
  desc,
  selected,
  onClick,
}: {
  title: string;
  desc?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all ${
        selected
          ? "border-primary bg-primary-soft shadow-[var(--shadow-card)]"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <span className="flex items-center justify-between gap-2 font-semibold">
        {title}
        {selected ? <Check className="size-4 text-primary" /> : null}
      </span>
      {desc ? <span className="mt-1 block text-sm text-muted-foreground">{desc}</span> : null}
    </button>
  );
}

function SkillChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
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

function Completion({ draft, onGo }: { draft: Draft; onGo: () => void }) {
  return (
    <div className="min-h-screen bg-hero-mesh px-4 py-12">
      <div className="card-surface mx-auto max-w-xl animate-rise p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success-soft text-success">
          <Sparkles className="size-7" />
        </div>
        <h1 className="mt-5 text-3xl font-extrabold">Your SkillGraph is ready.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your profile becomes more powerful as you add proof.
        </p>

        <div className="mt-6 space-y-4 text-left">
          <Summary label="Skills" items={draft.skills} />
          <Summary label="Experience" items={draft.level ? [draft.level] : []} />
          <Summary label="Goals" items={draft.goals} />
          <Summary label="Opportunity preferences" items={draft.preferences} />
        </div>

        <div className="mt-8 rounded-2xl border border-border p-4 text-left">
          <div className="flex justify-between text-sm font-medium">
            <span>Complete your profile</span>
            <span className="text-primary">40% complete</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-700" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="hero" size="lg" onClick={onGo}>
            Add your first proof
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/home">Explore SkillGraph</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Summary({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((i) => (
          <Badge key={i} variant="soft">
            {i}
          </Badge>
        ))}
      </div>
    </div>
  );
}
