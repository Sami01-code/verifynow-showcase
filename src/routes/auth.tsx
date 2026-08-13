import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const searchSchema = z.object({
  mode: z.enum(["login", "signup", "forgot"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Join SkillGraph — Create your proof-of-skill profile" },
      {
        name: "description",
        content: "Create your SkillGraph account and start building a reputation from real, verified work.",
      },
      { property: "og:title", content: "Join SkillGraph" },
      { property: "og:description", content: "Create your proof-of-skill profile in minutes." },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
  country: z.string().trim().min(2, "Enter your country").max(60),
  city: z.string().trim().min(2, "Enter your city").max(60),
});

function AuthPage() {
  const { mode = "login" } = Route.useSearch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", country: "", city: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Google sign-in failed. Try email instead.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/home" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const email = z.string().email().parse(form.email.trim());
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setEmailSent(email);
        return;
      }
      if (mode === "signup") {
        const parsed = signupSchema.parse(form);
        const { data, error } = await supabase.auth.signUp({
          email: parsed.email,
          password: parsed.password,
          options: { emailRedirectTo: window.location.origin, data: { name: parsed.name } },
        });
        if (error) throw error;
        if (!data.session) {
          setEmailSent(parsed.email);
          return;
        }
        await supabase
          .from("profiles")
          .update({ name: parsed.name, country: parsed.country, city: parsed.city })
          .eq("id", data.user!.id);
        toast.success("Account created");
        navigate({ to: "/onboarding" });
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (error) throw error;
      navigate({ to: "/home" });
    } catch (err) {
      const message = err instanceof z.ZodError ? err.issues[0].message : (err as Error).message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero-mesh px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" /> Back
        </Link>
        <div className="card-surface p-6 sm:p-8">
          <BrandLockup />
          {emailSent ? (
            <div className="mt-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Mail className="size-6" />
              </div>
              <h1 className="mt-4 text-xl font-bold">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a link to <span className="font-medium text-foreground">{emailSent}</span>. Confirm it to
                continue building your SkillGraph.
              </p>
              <Button variant="outline" className="mt-6 w-full" onClick={() => setEmailSent(null)}>
                Back
              </Button>
            </div>
          ) : (
            <>
              <h1 className="mt-6 text-2xl font-extrabold">
                {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signup"
                  ? "Then we'll build your SkillGraph in 5 quick questions."
                  : mode === "forgot"
                    ? "We'll email you a secure reset link."
                    : "Sign in to your proof-of-skill profile."}
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                {mode === "signup" && (
                  <Field label="Full name" value={form.name} onChange={set("name")} placeholder="Amanuel Tesfaye" />
                )}
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                />
                {mode !== "forgot" && (
                  <Field label="Password" type="password" value={form.password} onChange={set("password")} />
                )}
                {mode === "signup" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Country" value={form.country} onChange={set("country")} placeholder="Ethiopia" />
                    <Field label="City" value={form.city} onChange={set("city")} placeholder="Addis Ababa" />
                  </div>
                )}
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                  {mode === "signup" ? "Continue" : mode === "forgot" ? "Send reset link" : "Log in"}
                </Button>
              </form>

              {mode !== "forgot" && (
                <>
                  <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
                  </div>
                  <Button variant="outline" size="lg" className="w-full" onClick={handleGoogle}>
                    Continue with Google
                  </Button>
                </>
              )}

              <div className="mt-6 space-y-2 text-center text-sm">
                {mode === "login" && (
                  <>
                    <Link to="/auth" search={{ mode: "forgot" }} className="block text-muted-foreground hover:underline">
                      Forgot password?
                    </Link>
                    <Link to="/auth" search={{ mode: "signup" }} className="block font-medium text-primary">
                      Create your SkillGraph
                    </Link>
                  </>
                )}
                {mode !== "login" && (
                  <Link to="/auth" search={{ mode: "login" }} className="font-medium text-primary">
                    I already have an account
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input required {...props} />
    </div>
  );
}
