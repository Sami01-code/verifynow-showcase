import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { OpportunityCard } from "@/components/cards";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { OPPORTUNITY_TYPES, type Opportunity } from "@/lib/skillgraph";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — SkillGraph" },
      { name: "description", content: "Jobs, freelance projects, collaborations, mentorship and learning." },
      { property: "og:title", content: "Opportunities — SkillGraph" },
      { property: "og:description", content: "Jobs, projects, collaborations, mentorship and learning." },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const [filter, setFilter] = useState("All");
  const { data } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("opportunities")
        .select("*, profiles(*)")
        .order("created_at", { ascending: false });
      return (data ?? []) as Opportunity[];
    },
  });

  const list = (data ?? []).filter((o) => filter === "All" || o.type === filter);

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold">Opportunities near you</h1>
      <p className="text-sm text-muted-foreground">Matched by verified ability, not follower count.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {["All", ...OPPORTUNITY_TYPES].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {list.length ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {list.map((o) => (
            <OpportunityCard key={o.id} opp={o} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={<Briefcase className="size-5" />}
            title="No opportunities here yet"
            description="We're looking for opportunities that match your skills."
          />
        </div>
      )}
    </AppShell>
  );
}
