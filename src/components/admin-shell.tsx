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
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const NAV = [
  { title: "Overview", url: "/admin", icon: BarChart3 },
  { title: "Tools", url: "/admin/tools", icon: Wrench },
  { title: "Categories", url: "/admin/categories", icon: FolderTree },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Blog", url: "/admin/blog", icon: FileText },
  { title: "Settings", url: "/admin/settings", icon: Settings },
] as const;

export function AdminShell({ children, title }: { children: ReactNode; title: string }) {
  const { isAdmin, loading } = useRoles();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !isAdmin) router.navigate({ to: "/" });
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon" className="border-r border-slate-800 bg-slate-950 text-slate-100">
          <SidebarHeader className="border-b border-slate-800 px-4 py-3">
            <Link to="/" className="font-bold text-lg text-white">ToolHub Admin</Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-400">Manage</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => {
                    const active =
                      item.url === "/admin" ? pathname === "/admin" : pathname.startsWith(item.url);
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
          <SidebarFooter className="border-t border-slate-800 p-2">
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
        <div className="flex-1 flex flex-col bg-slate-50">
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