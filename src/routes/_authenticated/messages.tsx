import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { initials, type Message, type Profile } from "@/lib/skillgraph";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({
    meta: [
      { title: "Messages — SkillGraph" },
      { name: "description", content: "Talk to clients, mentors and collaborators on SkillGraph." },
      { property: "og:title", content: "Messages — SkillGraph" },
      { property: "og:description", content: "Talk to clients, mentors and collaborators." },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const [active, setActive] = useState<string | null>(null);
  const [text, setText] = useState("");

  const { data } = useQuery({
    queryKey: ["messages", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [msgs, people] = await Promise.all([
        supabase
          .from("messages")
          .select("*")
          .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
          .order("created_at", { ascending: true }),
        supabase.from("profiles").select("*").neq("id", user!.id).limit(8),
      ]);
      return { messages: (msgs.data ?? []) as Message[], people: (people.data ?? []) as Profile[] };
    },
  });

  const people = data?.people ?? [];
  const current = active ?? people[0]?.id ?? null;
  const thread = (data?.messages ?? []).filter(
    (m) => m.sender_id === current || m.receiver_id === current,
  );

  async function send() {
    if (!text.trim() || !current || !user) return;
    await supabase.from("messages").insert({ sender_id: user.id, receiver_id: current, message: text.trim() });
    setText("");
    qc.invalidateQueries({ queryKey: ["messages", user.id] });
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold">Messages</h1>
      <p className="text-sm text-muted-foreground">Conversations that start from real work.</p>

      {people.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<MessageCircle className="size-5" />}
            title="No conversations yet"
            description="Connect with people whose work you admire and start a conversation."
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="card-surface divide-y divide-border overflow-hidden">
            {people.map((p) => (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={`flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/60 ${
                  current === p.id ? "bg-muted/70" : ""
                }`}
              >
                <Avatar className="size-9">
                  <AvatarImage src={p.avatar_url ?? undefined} alt={p.name} />
                  <AvatarFallback>{initials(p.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.headline}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="card-surface flex min-h-[420px] flex-col p-4">
            <div className="flex-1 space-y-3 overflow-y-auto">
              {thread.length === 0 && (
                <p className="text-sm text-muted-foreground">Say hello — mention the work that impressed you.</p>
              )}
              {thread.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    m.sender_id === user?.id
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.message}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a message…"
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <Button variant="hero" onClick={send}>
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
