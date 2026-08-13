import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck, MapPin, Share2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProofCard, ScoreChip } from "@/components/cards";
import { EmptyState } from "@/components/EmptyState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  initials,
  profileCompletion,
  reputationBreakdown,
  type Profile,
  type Proof,
  type UserSkill,
} from "@/lib/skillgraph";

export const Route = createFileRoute("/u/$username")({
  head: () => ({
    meta: [
      { title: "SkillGraph profile — verified skills and proof" },
      { name: "description", content: "A SkillGraph profile: verified skills, proof of work and reputation." },
      { property: "og:title", content: "SkillGraph profile" },
      { property: "og:description", content: "Verified skills, proof of work and reputation." },
    ],
  }),
  component: PublicProfile,
});

function PublicProfile() {
  const { username } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data: person } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.eq.${username},id.eq.${username}`)
        .maybeSingle();
      if (!person) return null;
      const [skills, proofs] = await Promise.all([
        supabase.from("user_skills").select("*").eq("user_id", person.id),
        supabase.from("proofs").select("*, profiles(*)").eq("user_id", person.id).order("created_at", { ascending: false }),
      ]);
      return {
        person: person as Profile,
        skills: (skills.data ?? []) as UserSkill[],
        proofs: (proofs.data ?? []) as Proof[],
      };
    },
  });

  if (!data) return <AppShell>Loading profile…</AppShell>;
  return <ProfileView {...data} isOwn={false} />;
}

export function ProfileView({
  person,
  skills,
  proofs,
  isOwn,
}: {
  person: Profile;
  skills: UserSkill[];
  proofs: Proof[];
  isOwn: boolean;
}) {
  const verified = proofs.filter((p) => p.verification_status === "verified");
  const rep = reputationBreakdown({
    verifiedProofs: verified.length,
    clientVerifications: verified.filter((p) => p.verifier_type === "Client").length,
    peerVerifications: verified.filter((p) => p.verifier_type !== "Client").length,
    completedOpportunities: 0,
    skills: skills.length,
  });
  const score = person.reputation_score || rep.total;
  const completion = profileCompletion(person, proofs.length, skills.length);

  return (
    <AppShell>
      <div className="card-surface overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary to-primary-glow" />
        <div className="px-5 pb-5">
          <div className="-mt-10 flex items-end gap-4">
            <Avatar className="size-20 border-4 border-card">
              <AvatarImage src={person.avatar_url ?? undefined} alt={person.name} />
              <AvatarFallback>{initials(person.name)}</AvatarFallback>
            </Avatar>
            <ScoreChip score={score} />
          </div>
          <h1 className="mt-3 flex items-center gap-2 text-2xl font-extrabold">
            {person.name}
            {verified.length > 0 ? <BadgeCheck className="size-5 text-success" /> : null}
          </h1>
          <p className="text-sm text-muted-foreground">@{person.username}</p>
          <p className="mt-1 text-sm">{person.headline}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" /> {person.city}, {person.country}
          </p>
          {person.bio ? <p className="mt-3 text-sm text-muted-foreground">{person.bio}</p> : null}

          <div className="mt-5 grid grid-cols-3 gap-3 text-center sm:grid-cols-4">
            <Stat label="Verified skills" value={skills.length} />
            <Stat label="Projects" value={proofs.length} />
            <Stat label="Verified proof" value={verified.length} />
            <Stat label="Experience" value={person.experience_level ?? "—"} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {isOwn ? (
              <>
                <Button asChild variant="hero">
                  <Link to="/add-proof">Add proof</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/settings">Edit profile</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="hero">Connect</Button>
                <Button asChild variant="outline">
                  <Link to="/messages">Message</Link>
                </Button>
                <Button variant="outline">Hire</Button>
              </>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/u/${person.username}`);
                toast.success("Profile link copied");
              }}
            >
              <Share2 className="size-4" /> Share profile
            </Button>
          </div>

          {isOwn && (
            <div className="mt-5 rounded-2xl border border-border p-4">
              <div className="flex justify-between text-sm font-medium">
                <span>Profile completion</span>
                <span className="text-primary">{completion}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-700"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="font-bold">Skills</h2>
          {skills.length ? (
            <div className="mt-4 space-y-3">
              {skills.map((s) => (
                <div key={s.id}>
                  <div className="flex justify-between text-sm font-medium">
                    <span>{s.name}</span>
                    <span className="text-muted-foreground">{Number(s.rating).toFixed(1)}/5</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow"
                      style={{ width: `${(Number(s.rating) / 5) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.evidence_count} evidence · {s.verification_count} verifications
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No skills documented yet.</p>
          )}
        </div>

        <div className="card-surface p-5">
          <h2 className="font-bold">SkillGraph reputation</h2>
          <p className="mt-2 text-4xl font-extrabold text-gradient">{score}</p>
          <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
            {rep.rows.length ? (
              rep.rows.map((r) => (
                <li key={r.label}>
                  +{r.points} {r.label.toLowerCase()}
                </li>
              ))
            ) : (
              <li>Reputation is earned. Add proof and get it verified.</li>
            )}
          </ul>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">Proof of work</h2>
        {proofs.length ? (
          <div className="space-y-4">
            {proofs.map((p) => (
              <ProofCard key={p.id} proof={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No proof yet"
            description="Show the world what you can do. Your first proof is the beginning of your reputation."
            action={
              isOwn ? (
                <Button asChild variant="hero">
                  <Link to="/add-proof">Add Proof</Link>
                </Button>
              ) : undefined
            }
          />
        )}
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-muted/60 p-3">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
