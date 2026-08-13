import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Search,
  Sparkles,
  Users,
  Briefcase,
  GraduationCap,
  Handshake,
  ArrowRight,
  ShieldCheck,
  Upload,
  EyeOff,
  FileText,
  Star,
} from "lucide-react";
import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillGraph — Show what you can actually do" },
      {
        name: "description",
        content:
          "SkillGraph is a proof-of-skill network. Upload real work, get it verified by clients and mentors, and be discovered for jobs, projects and mentorship.",
      },
      { property: "og:title", content: "SkillGraph — Show what you can actually do" },
      {
        property: "og:description",
        content: "Proof. Trust. Opportunity. Build reputation from real, verified work.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <BrandLockup />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/search">Explore talent</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Log in</Link>
            </Button>
            <Button asChild variant="hero" size="sm">
              <Link to="/auth" search={{ mode: "signup" }}>
                Create your SkillGraph
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-hero-mesh">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
            <div className="animate-rise">
              <Badge variant="soft" className="mb-5">
                <Sparkles className="mr-1 size-3.5" /> A proof-of-skill network
              </Badge>
              <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
                Your skills deserve <span className="text-gradient">proof</span>.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground">
                Build your reputation through real work, verified skills, and meaningful opportunities. Don&apos;t just
                tell people what you can do — show them.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="xl">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Create your SkillGraph <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <Link to="/search">Explore talent</Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                Proof &gt; likes · Verification &gt; followers · Reputation &gt; popularity
              </p>
            </div>

            <HeroVisual />
          </div>
        </section>

        {/* Problem */}
        <Section
          title="A CV tells people what you claim. Your work shows what you can do."
          subtitle="Talent is everywhere. Evidence of it is not."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: FileText, title: "Claims are easy", body: "Anyone can list a skill. Almost nobody can prove it." },
              {
                icon: ShieldCheck,
                title: "CVs don't show enough evidence",
                body: "A page of bullet points cannot show the system you actually built.",
              },
              {
                icon: EyeOff,
                title: "Talent is hidden",
                body: "Capable people stay invisible because nobody can see their work.",
              },
            ].map((p) => (
              <div key={p.title} className="card-surface p-6">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <p.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* How it works */}
        <Section title="How SkillGraph works" subtitle="Three steps. One growing reputation.">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { n: "01", t: "Show", d: "Upload your work.", icon: Upload },
              { n: "02", t: "Verify", d: "Let clients, teachers, mentors or peers verify it.", icon: BadgeCheck },
              { n: "03", t: "Connect", d: "Get discovered for jobs, projects and collaborations.", icon: Handshake },
            ].map((s) => (
              <div key={s.n} className="card-surface relative overflow-hidden p-6">
                <span className="text-sm font-bold text-primary">{s.n}</span>
                <h3 className="mt-2 text-xl font-bold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                <s.icon className="absolute -bottom-3 -right-3 size-20 text-primary-soft" />
              </div>
            ))}
          </div>
        </Section>

        {/* Proof vs popularity */}
        <Section title="Proof, not popularity" subtitle="SkillGraph is not built around attention.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-border bg-muted/60 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Traditional social media
              </h3>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                {["Followers", "Likes", "Views", "Attention"].map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-muted-foreground/60" /> {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-primary/25 bg-primary-soft p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">SkillGraph</h3>
              <ul className="mt-4 space-y-2 font-medium">
                {["Skills", "Proof", "Verification", "Reputation", "Opportunities"].map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <BadgeCheck className="size-4 text-primary" /> {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* Opportunities */}
        <Section title="Opportunities come to you" subtitle="Matched by verified ability, not by follower count.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { icon: Briefcase, t: "Jobs" },
              { icon: Sparkles, t: "Freelance projects" },
              { icon: Users, t: "Collaborations" },
              { icon: Handshake, t: "Mentorship" },
              { icon: GraduationCap, t: "Learning" },
            ].map((o) => (
              <div key={o.t} className="card-surface flex flex-col items-start gap-3 p-5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <o.icon className="size-5" />
                </div>
                <p className="font-semibold">{o.t}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Final CTA */}
        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-glow px-6 py-16 text-center text-primary-foreground shadow-[var(--shadow-glow)]">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold sm:text-4xl">
              Stop saying what you can do. Start showing it.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
              Your digital reputation should be based on what you can actually do — not how many followers you have.
            </p>
            <Button asChild size="xl" variant="secondary" className="mt-8">
              <Link to="/auth" search={{ mode: "signup" }}>
                Create your SkillGraph
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center sm:px-6">
          <BrandLockup />
          <p className="text-sm font-semibold text-primary">Proof. Trust. Opportunity.</p>
          <p className="max-w-md text-xs text-muted-foreground">
            Built for Africa first — Addis Ababa, Nairobi, Kigali, Lagos, Kampala, Accra — and usable everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-2xl font-extrabold sm:text-3xl lg:text-4xl">{title}</h2>
        {subtitle ? <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p> : null}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="animate-rise [animation-delay:120ms]">
      <div className="card-surface mx-auto max-w-md p-5 shadow-[var(--shadow-lift)]">
        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/300?img=12"
            alt="SkillGraph member profile preview"
            className="size-14 rounded-2xl object-cover"
          />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-semibold">
              Amanuel Tesfaye <BadgeCheck className="size-4 text-success" />
            </p>
            <p className="text-sm text-muted-foreground">Full Stack Developer · Addis Ababa</p>
          </div>
          <span className="ml-auto rounded-full bg-gold-soft px-2.5 py-1 text-xs font-bold">★ 82</span>
        </div>

        <div className="mt-5 space-y-3">
          {[
            { s: "Python", v: 4.5, w: "90%" },
            { s: "Web Development", v: 4.2, w: "84%" },
            { s: "UI/UX", v: 3.8, w: "76%" },
          ].map((k) => (
            <div key={k.s}>
              <div className="flex justify-between text-xs font-medium">
                <span>{k.s}</span>
                <span className="text-muted-foreground">{k.v}/5</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: k.w }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-border p-3">
          <img
            src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800"
            alt="Restaurant POS system project preview"
            className="h-28 w-full rounded-xl object-cover"
            loading="lazy"
          />
          <p className="mt-2 text-sm font-semibold">Restaurant POS System</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-success">
            <BadgeCheck className="size-3.5" /> Verified by client
          </p>
        </div>

        <div className="mt-4 rounded-2xl bg-primary-soft p-3">
          <p className="text-xs font-semibold text-primary">Opportunity match</p>
          <p className="mt-1 text-sm font-medium">Build website for local restaurant · $120</p>
        </div>
      </div>

      <div className="mx-auto mt-4 flex max-w-md items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Search className="size-3.5" /> Discovered by 3 recruiters
        </span>
        <span className="flex items-center gap-1.5">
          <Star className="size-3.5 text-gold" /> 8 verified skills
        </span>
      </div>
    </div>
  );
}
