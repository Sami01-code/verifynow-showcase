import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Calendar, Link2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { initials, type Proof, type Verification } from "@/lib/skillgraph";

export const Route = createFileRoute("/proof/$proofId")({
  head: () => ({
    meta: [
      { title: "Proof of work — SkillGraph" },
      { name: "description", content: "A verified piece of real work on SkillGraph." },
      { property: "og:title", content: "Proof of work — SkillGraph" },
      { property: "og:description", content: "A verified piece of real work on SkillGraph." },
    ],
  }),
  component: ProofDetail,
});

function ProofDetail() {
  const { proofId } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["proof", proofId],
    queryFn: async () => {
      const [proof, verifications] = await Promise.all([
        supabase.from("proofs").select("*, profiles(*)").eq("id", proofId).maybeSingle(),
        supabase.from("verifications").select("*").eq("proof_id", proofId),
      ]);
      return {
        proof: proof.data as Proof | null,
        verifications: (verifications.data ?? []) as Verification[],
      };
    },
  });

  const proof = data?.proof;
  if (!proof) return <AppShell>Loading…</AppShell>;

  return (
    <AppShell>
      <article className="card-surface overflow-hidden">
        {proof.media_urls[0] ? (
          <img src={proof.media_urls[0]} alt={proof.title} className="h-64 w-full object-cover sm:h-80" />
        ) : null}
        <div className="space-y-5 p-6">
          <div>
            <h1 className="text-2xl font-extrabold">{proof.title}</h1>
            <div className="mt-3 flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={proof.profiles?.avatar_url ?? undefined} alt={proof.profiles?.name ?? ""} />
                <AvatarFallback>{initials(proof.profiles?.name ?? "SG")}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{proof.profiles?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {proof.profiles?.city}, {proof.profiles?.country}
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="ml-auto">
                <Link to="/u/$username" params={{ username: proof.profiles?.username ?? proof.user_id }}>
                  View profile
                </Link>
              </Button>
            </div>
          </div>

          <p className="whitespace-pre-line text-muted-foreground">{proof.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {proof.skills.map((s) => (
              <Badge key={s} variant="soft">
                {s}
              </Badge>
            ))}
            <Badge variant="outline">{proof.project_type}</Badge>
          </div>

          {proof.links.length > 0 && (
            <div className="space-y-1 text-sm">
              {proof.links.map((l) => (
                <a key={l} href={l} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary">
                  <Link2 className="size-4" /> {l}
                </a>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-border p-4">
            <p className="flex items-center gap-2 font-semibold">
              <BadgeCheck className="size-5 text-success" />
              {proof.verification_status === "verified"
                ? `Verified by ${proof.verifier_type ?? "peer"}`
                : "Awaiting verification"}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              <li>✓ Work submitted</li>
              {proof.verification_status === "verified" && <li>✓ Completed</li>}
              {data?.verifications.map((v) => (
                <li key={v.id}>
                  ✓ {v.type} confirmed — {v.verifier_name}
                  {v.comment ? `: “${v.comment}”` : ""}
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" /> Submitted {new Date(proof.created_at).toLocaleDateString()}
            </p>
            <Button asChild variant="soft" size="sm" className="mt-4">
              <Link to="/verify/$proofId" params={{ proofId: proof.id }}>
                Verify this work
              </Link>
            </Button>
          </div>
        </div>
      </article>
    </AppShell>
  );
}
