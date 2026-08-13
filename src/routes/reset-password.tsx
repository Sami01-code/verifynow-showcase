import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — SkillGraph" },
      { name: "description", content: "Choose a new password for your SkillGraph account." },
      { property: "og:title", content: "Set a new password — SkillGraph" },
      { property: "og:description", content: "Choose a new password for your SkillGraph account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Use at least 8 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/home" });
  }

  return (
    <div className="min-h-screen bg-hero-mesh px-4 py-16">
      <form onSubmit={submit} className="card-surface mx-auto max-w-md p-8">
        <BrandLockup />
        <h1 className="mt-6 text-2xl font-extrabold">Set a new password</h1>
        <div className="mt-6 space-y-1.5">
          <Label>New password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" variant="hero" size="lg" className="mt-6 w-full" disabled={loading}>
          Update password
        </Button>
      </form>
    </div>
  );
}
