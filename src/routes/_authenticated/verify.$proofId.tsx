import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { VERIFIER_TYPES, type Proof } from "@/lib/skillgraph";

export const Route = createFileRoute("/_authenticated/verify/$proofId")({
  head: () => ({
    meta: [
      { title: "Verify work — SkillGraph" },
      { name: "description", content: "Confirm that this work was really delivered, and by whom." },
      { property: "og:title", content: "Verify work — SkillGraph" },
      { property: "og:description", content: "Confirm that this work was really delivered." },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const { proofId } = Route.useParams();
  const { user } = useSession();
  const navigate = useNavigate();
  const [type, setType] = useState<string>(VERIFIER_TYPES[0] ?? "Client");
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: proof } = useQuery({
    queryKey: ["proof", proofId],
    queryFn: async () => {
      const { data } = await supabase.from("proofs").select("*, profiles(*)").eq("id", proofId).maybeSingle();
      return data as Proof | null;
    },
  });

  async function submit() {
    if (!user) return;
    if (!name.trim()) {
      toast.error("Add your name so the verification means something");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("verifications").insert({
      proof_id: proofId,
      verifier_id: user.id,
      verifier_name: name.trim(),
      type,
      comment: comment.trim() || null,
    });
    if (!error) {
      await supabase
        .from("proofs")
        .update({ verification_status: "verified", verifier_type: type })
        .eq("id", proofId);
    }
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Verification submitted — thank you");
    navigate({ to: "/proof/$proofId", params: { proofId } });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-xl">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">
          <ShieldCheck className="size-6 text-success" /> Verify work
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {proof ? `“${proof.title}” by ${proof.profiles?.name ?? "a SkillGraph member"}` : "Loading…"}
        </p>

        <div className="card-surface mt-5 space-y-4 p-5">
          <div className="space-y-1.5">
            <Label>Your relationship to this work</Label>
            <div className="flex flex-wrap gap-2">
              {VERIFIER_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    type === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Your name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Selam Bekele" />
          </div>
          <div className="space-y-1.5">
            <Label>Comment (optional)</Label>
            <Textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did they deliver, and how well?"
            />
          </div>
          <Button variant="hero" className="w-full" onClick={submit} disabled={saving}>
            {saving ? "Submitting…" : "Confirm verification"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Verifications are public and permanently attached to this proof.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
