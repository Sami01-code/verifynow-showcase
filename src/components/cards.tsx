import { Link } from "@tanstack/react-router";
import { BadgeCheck, Heart, MapPin, MessageCircle, Bookmark, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { initials, timeAgo, type Opportunity, type Profile, type Proof } from "@/lib/skillgraph";

export function VerifiedBadge({ label = "Verified" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
      <BadgeCheck className="size-3.5" /> {label}
    </span>
  );
}

export function ScoreChip({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-semibold text-foreground">
      ★ Skill Score {score}
    </span>
  );
}

export function PersonCard({ person, skills = [] }: { person: Profile; skills?: string[] }) {
  return (
    <div className="card-surface flex flex-col gap-3 p-4 transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-start gap-3">
        <Avatar className="size-12">
          <AvatarImage src={person.avatar_url ?? undefined} alt={person.name} />
          <AvatarFallback>{initials(person.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{person.name}</p>
          <p className="truncate text-sm text-muted-foreground">{person.headline}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {person.city}, {person.country}
          </p>
        </div>
        <ScoreChip score={person.reputation_score} />
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((s) => (
            <Badge key={s} variant="soft">
              {s}
            </Badge>
          ))}
        </div>
      )}
      <Button asChild variant="outline" size="sm" className="self-start">
        <Link to="/u/$username" params={{ username: person.username ?? person.id }}>
          View profile
        </Link>
      </Button>
    </div>
  );
}

export function ProofCard({ proof }: { proof: Proof }) {
  const author = proof.profiles;
  return (
    <article className="card-surface overflow-hidden transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-center gap-3 p-4">
        <Avatar className="size-10">
          <AvatarImage src={author?.avatar_url ?? undefined} alt={author?.name ?? ""} />
          <AvatarFallback>{initials(author?.name ?? "SG")}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{author?.name ?? "SkillGraph member"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {author?.city ?? ""} · {timeAgo(proof.created_at)}
          </p>
        </div>
        {proof.verification_status === "verified" ? (
          <VerifiedBadge label={`Verified by ${proof.verifier_type ?? "peer"}`} />
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Awaiting verification
          </span>
        )}
      </div>
      <Link to="/proof/$proofId" params={{ proofId: proof.id }} className="block">
        <div className="px-4 pb-3">
          <h3 className="font-semibold leading-snug">{proof.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{proof.description}</p>
        </div>
        {proof.media_urls[0] ? (
          <img
            src={proof.media_urls[0]}
            alt={proof.title}
            loading="lazy"
            className="h-52 w-full object-cover sm:h-64"
          />
        ) : null}
      </Link>
      <div className="flex flex-wrap items-center gap-1.5 px-4 pt-3">
        {proof.skills.map((s) => (
          <Badge key={s} variant="soft">
            {s}
          </Badge>
        ))}
        <Badge variant="outline">{proof.project_type}</Badge>
      </div>
      <div className="flex items-center gap-1 p-3">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Heart className="size-4" /> Appreciate {proof.appreciations}
        </Button>
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link to="/proof/$proofId" params={{ proofId: proof.id }}>
            <MessageCircle className="size-4" /> Discuss
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground">
          <Bookmark className="size-4" /> Save
        </Button>
      </div>
    </article>
  );
}

export function OpportunityCard({ opp }: { opp: Opportunity }) {
  return (
    <div className="card-surface flex flex-col gap-3 p-4 transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="soft">{opp.type}</Badge>
            {opp.verified_poster ? <VerifiedBadge label="Verified poster" /> : null}
          </div>
          <h3 className="mt-2 font-semibold leading-snug">{opp.title}</h3>
          <p className="text-sm text-muted-foreground">
            {opp.organization ?? opp.profiles?.name ?? "SkillGraph member"}
          </p>
        </div>
        {opp.compensation ? <span className="shrink-0 text-sm font-semibold">{opp.compensation}</span> : null}
      </div>
      <p className="line-clamp-2 text-sm text-muted-foreground">{opp.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {opp.required_skills.map((s) => (
          <Badge key={s} variant="outline">
            {s}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="size-3" /> {opp.remote ? "Remote" : opp.location}
        </span>
        {opp.deadline ? (
          <span className="flex items-center gap-1">
            <Clock className="size-3" /> Closes {new Date(opp.deadline).toLocaleDateString()}
          </span>
        ) : null}
      </div>
      <Button variant="hero" size="sm" className="self-start">
        View opportunity
      </Button>
    </div>
  );
}
