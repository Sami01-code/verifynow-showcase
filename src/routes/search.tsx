import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Search as SearchIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { OpportunityCard, PersonCard, ProofCard } from "@/components/cards";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ALL_SKILLS, type Opportunity, type Profile, type Proof } from "@/lib/skillgraph";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional(), skill: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Search verified talent — SkillGraph" },
      { name: "description", content: "Search people, skills, proof of work and opportunities across Africa." },
      { property: "og:title", content: "Search verified talent — SkillGraph" },
      { property: "og:description", content: "Search people, skills, proof of work and opportunities." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q = "", skill } = Route.useSearch();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["search", q, skill],
    queryFn: async () => {
      const term = `%${q}%`;
      const [people, proofs, opps] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .or(`name.ilike.${term},headline.ilike.${term},city.ilike.${term},country.ilike.${term}`)
          .limit(12),
        supabase.from("proofs").select("*, profiles(*)").ilike("title", term).limit(8),
        supabase.from("opportunities").select("*, profiles(*)").ilike("title", term).limit(8),
      ]);
      return {
        people: (people.data ?? []) as Profile[],
        proofs: (proofs.data ?? []) as Proof[],
        opportunities: (opps.data ?? []) as Opportunity[],
      };
    },
  });

  const empty = !data || (!data.people.length && !data.proofs.length && !data.opportunities.length);

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold">Search</h1>
      <p className="text-sm text-muted-foreground">People, skills, proof and opportunities.</p>
      <div className="relative mt-4">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={q}
          placeholder="e.g. Python developer Addis Ababa"
          className="h-12 pl-9"
          onChange={(e) => navigate({ to: "/search", search: { q: e.target.value }, replace: true })}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {ALL_SKILLS.slice(0, 10).map((s) => (
          <button key={s} onClick={() => navigate({ to: "/search", search: { q: s } })}>
            <Badge variant="soft">{s}</Badge>
          </button>
        ))}
      </div>

      {empty ? (
        <div className="mt-8">
          <EmptyState
            icon={<SearchIcon className="size-5" />}
            title="Nothing found yet"
            description="Try a skill, a city or a name — for example “GIS Kigali” or “Selam”."
          />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {data.people.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">People</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.people.map((p) => (
                  <PersonCard key={p.id} person={p} />
                ))}
              </div>
            </section>
          )}
          {data.proofs.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Proof of work</h2>
              <div className="space-y-4">
                {data.proofs.map((p) => (
                  <ProofCard key={p.id} proof={p} />
                ))}
              </div>
            </section>
          )}
          {data.opportunities.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Opportunities</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.opportunities.map((o) => (
                  <OpportunityCard key={o.id} opp={o} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </AppShell>
  );
}
