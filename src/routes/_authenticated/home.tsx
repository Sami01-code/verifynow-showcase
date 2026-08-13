import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, Search, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { OpportunityCard, PersonCard, ProofCard } from "@/components/cards";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile, useSession } from "@/hooks/use-auth";
import { greeting, type Opportunity, type Profile, type Proof } from "@/lib/skillgraph";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Home — SkillGraph" },
      { name: "description", content: "Discover verified work, people and opportunities matched to your skills." },
      { property: "og:title", content: "Home — SkillGraph" },
      { property: "og:description", content: "Discover verified work, people and opportunities matched to your skills." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user } = useSession();
  const { data: profile } = useMyProfile(user);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["home-feed"],
    queryFn: async () => {
      const [proofs, people, opps] = await Promise.all([
        supabase
          .from("proofs")
          .select("*, profiles(*)")
          .order("created_at", { ascending: false })
          .limit(12),
        supabase.from("profiles").select("*").order("reputation_score", { ascending: false }).limit(6),
        supabase.from("opportunities").select("*, profiles(*)").order("created_at", { ascending: false }).limit(6),
      ]);
      return {
        proofs: (proofs.data ?? []) as Proof[],
        people: (people.data ?? []) as Profile[],
        opportunities: (opps.data ?? []) as Opportunity[],
      };
    },
  });

  return (
    <AppShell>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">
            {greeting()}, {profile?.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-sm text-muted-foreground">Proof. Trust. Opportunity.</p>
        </div>
        <Button asChild variant="ghost" size="icon" aria-label="Notifications">
          <Link to="/notifications">
            <Bell className="size-5" />
          </Link>
        </Button>
      </header>

      <form
        className="relative mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q") as string;
          navigate({ to: "/search", search: { q } });
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" placeholder="Search people, skills, projects or opportunities" className="h-12 pl-9" />
      </form>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          <FeedSection title="Recommended for you" hint="Matched to your skills, goals and location">
            <div className="grid gap-3 sm:grid-cols-2">
              {data?.people
                .filter((p) => p.id !== user?.id)
                .slice(0, 4)
                .map((p) => (
                  <PersonCard key={p.id} person={p} skills={[]} />
                ))}
            </div>
          </FeedSection>

          <FeedSection title="Verified work today" hint="Real projects, verified by real people">
            <div className="space-y-4">
              {data?.proofs.length ? (
                data.proofs.map((p) => <ProofCard key={p.id} proof={p} />)
              ) : (
                <EmptyState
                  icon={<Sparkles className="size-5" />}
                  title="No proof yet"
                  description="Your first proof is the beginning of your reputation."
                  action={
                    <Button asChild variant="hero">
                      <Link to="/add-proof">Add your first proof</Link>
                    </Button>
                  }
                />
              )}
            </div>
          </FeedSection>

          <FeedSection title="Opportunities for you" hint="Based on your skills, location and goals">
            <div className="grid gap-3 sm:grid-cols-2">
              {data?.opportunities.slice(0, 4).map((o) => (
                <OpportunityCard key={o.id} opp={o} />
              ))}
            </div>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/opportunities">See all opportunities</Link>
            </Button>
          </FeedSection>
        </>
      )}
    </AppShell>
  );
}

function FeedSection({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{hint}</p>
      {children}
    </section>
  );
}
