import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { useSession } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Notification } from "@/lib/skillgraph";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — SkillGraph" },
      { name: "description", content: "Verifications, opportunities and connection activity." },
      { property: "og:title", content: "Notifications — SkillGraph" },
      { property: "og:description", content: "Verifications, opportunities and connection activity." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useSession();
  const { data } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return (data ?? []) as Notification[];
    },
  });

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold">Notifications</h1>
      {data?.length ? (
        <div className="mt-5 space-y-3">
          {data.map((n) => (
            <div key={n.id} className="card-surface flex gap-3 p-4">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bell className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            icon={<Bell className="size-5" />}
            title="You're all caught up"
            description="Verifications, matches and messages will show up here."
          />
        </div>
      )}
    </AppShell>
  );
}
