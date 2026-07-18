import { type ReactNode, useEffect } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  History,
  Key,
  Star,
  CreditCard,
  Settings,
  LogOut,
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
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const NAV = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "History", url: "/dashboard/history", icon: History },
  { title: "API Keys", url: "/dashboard/api-keys", icon: Key },
  { title: "Favorites", url: "/dashboard/favorites", icon: Star },
  { title: "Subscription", url: "/dashboard/subscription", icon: CreditCard },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
] as const;

export function DashboardShell({ children, title }: { children: ReactNode; title: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) router.navigate({ to: "/auth/login" });
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b px-4 py-3">
            <Link to="/" className="font-bold text-lg">Nexatools</Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => {
                    const active =
                      item.url === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.url);
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
          <SidebarFooter className="border-t p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.navigate({ to: "/" });
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-3 border-b bg-white px-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">{title}</h1>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}