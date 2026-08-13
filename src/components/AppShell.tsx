import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Home,
  Search,
  Briefcase,
  MessageSquare,
  Bell,
  Plus,
  User as UserIcon,
  Settings,
  LogOut,
} from "lucide-react";
import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <Link to="/home" className="px-2">
          <BrandLockup />
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
            >
              <item.icon className="size-[18px]" />
              {item.label}
            </Link>
          ))}
          <Button asChild variant="hero" className="mt-4">
            <Link to="/add-proof">
              <Plus className="size-4" /> Add Proof
            </Link>
          </Button>
        </nav>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/" });
          }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent"
        >
          <LogOut className="size-[18px]" /> Sign out
        </button>
        <p className="mt-4 px-3 text-xs text-muted-foreground">Proof. Trust. Opportunity.</p>
      </aside>

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-end justify-between px-4 py-2">
          <MobileItem to="/home" label="Home" icon={Home} />
          <MobileItem to="/search" label="Search" icon={Search} />
          <Link
            to="/add-proof"
            aria-label="Add Proof"
            className="-mt-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)] transition-transform active:scale-95"
          >
            <Plus className="size-6" />
          </Link>
          <MobileItem to="/opportunities" label="Work" icon={Briefcase} />
          <MobileItem to="/profile" label="Profile" icon={UserIcon} />
        </div>
      </nav>
    </div>
  );
}

function MobileItem({
  to,
  label,
  icon: Icon,
}: {
  to: "/home" | "/search" | "/opportunities" | "/profile";
  label: string;
  icon: typeof Home;
}) {
  return (
    <Link
      to={to}
      className="flex w-16 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-muted-foreground data-[status=active]:text-primary"
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
