import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { useSession } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileView } from "@/routes/u.$username";
import type { Profile, Proof, UserSkill } from "@/lib/skillgraph";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My profile — SkillGraph" },
      { name: "description", content: "Your verified skills, proof of work and reputation score." },
      { property: "og:title", content: "My profile — SkillGraph" },
      { property: "og:description", content: "Your verified skills, proof of work and reputation." },
    ],
  }),
  component: MyProfile,
});

function MyProfile() {
  const { user } = useSession();
  const { data } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [person, skills, proofs] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
        supabase.from("user_skills").select("*").eq("user_id", user!.id),
        supabase
          .from("proofs")
          .select("*, profiles(*)")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
      ]);
      return {
        person: person.data as Profile | null,
        skills: (skills.data ?? []) as UserSkill[],
        proofs: (proofs.data ?? []) as Proof[],
      };
    },
  });

  if (!data?.person) return <AppShell>Loading your profile…</AppShell>;
  return <ProfileView person={data.person} skills={data.skills} proofs={data.proofs} isOwn />;
}
