import { type ReactNode, useEffect } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Wrench,
  Users,
  FolderTree,
  FileText,
  Settings,
  LogOut,
  CreditCard,
  Bell,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useRoles } from "@/hooks/use-role";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";

const NAV = [
  { title: "Dashboard", url: "/admin/dashboard", icon: BarChart3 },
  { title: "Tools", url: "/admin/tools", icon: Wrench },
  { title: "Categories", url: "/admin/categories", icon: FolderTree },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Blog", url: "/admin/blog", icon: FileText },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
  { title: "Settings", url: "/admin/settings", icon: Settings },
] as const;

export function AdminShell({ children, title, breadcrumb }: { children: ReactNode; title: string; breadcrumb?: string[] }) {
  const { isAdmin, loading } = useRoles();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !isAdmin) router.navigate({ to: "/admin/login" });
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
            <Link to="/" className="font-bold text-lg text-sidebar-foreground">Nexatools Admin</Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Manage</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => {
                    const active = pathname === item.url || pathname.startsWith(item.url + "/");
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild isActive={active}>
                          <Link to={item.url} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.navigate({ to: "/admin/login" });
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col bg-background text-foreground">
          <header className="h-14 flex items-center gap-3 border-b bg-card text-card-foreground px-4">
            <SidebarTrigger />
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold leading-tight">{title}</h1>
              {breadcrumb && breadcrumb.length > 0 && (
                <nav className="flex items-center text-xs text-muted-foreground gap-1">
                  <Link to="/admin/dashboard" className="hover:underline">Admin</Link>
                  {breadcrumb.map((b, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <ChevronRight className="h-3 w-3" />
                      <span>{b}</span>
                    </span>
                  ))}
                </nav>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Input placeholder="Search…" className="hidden md:block h-9 w-56" />
              <button
                type="button"
                aria-label="Notifications"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-foreground transition hover:bg-accent"
              >
                <Bell className="h-4 w-4" />
              </button>
              <ThemeToggle />
              <span className="hidden sm:inline text-xs text-muted-foreground max-w-[180px] truncate">
                {user?.email}
              </span>
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}