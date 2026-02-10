"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  FolderTree,
  Boxes,
  Puzzle,
  Package,
  ArrowLeftRight,
  UserCheck,
  FileText,
  Users,
  Settings,
  ChevronDown,
  LogOut,
  Bell,
  GitPullRequest,
  FileCheck,
  GitBranch,
  ClipboardList,
} from "lucide-react";

// import { cn } from "@/lib/utils";
// import type { UserRole } from "@/lib/types";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAuthUser, logout } from "@/lib/services/auth"
import { getWorkspaceMenus, type WorkspaceMenu, type WorkspaceMenuGroup } from "@/lib/services/menu"

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  // roles?: UserRole[]; // reserved for future ACL
  children?: NavItem[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Building2,
  MapPin,
  FolderTree,
  Boxes,
  Puzzle,
  Package,
  ArrowLeftRight,
  UserCheck,
  FileText,
  Users,
  Settings,
  Bell,
  GitBranch,
  ClipboardList,
};

function getIcon(iconName: string | null): React.ComponentType<{ className?: string }> {
  if (!iconName) return LayoutDashboard;
  return iconMap[iconName] ?? LayoutDashboard;
}

function menuToNavItem(menu: WorkspaceMenu): NavItem {
  return {
    title: menu.label ?? menu.path,
    href: menu.path,
    icon: getIcon(menu.icon),
    children: menu.children.map(menuToNavItem),
  };
}

function canAccessItem(item: NavItem): boolean {
  // Backend already filtered menus by ACL; always allow here.
  return true;
}

function NavItemComponent({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  if (item.children) {
    return (
      <Collapsible defaultOpen={isActive} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title}>
              <item.icon className="size-4" />
              <span>{item.title}</span>
              <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => (
                <SidebarMenuSubItem key={child.href}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === child.href}
                  >
                    <Link href={child.href}>{child.title}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <Link href={item.href}>
          <item.icon className="size-4" />
          <span>{item.title}</span>
          {item.badge && (
            <Badge
              variant="secondary"
              className="ml-auto bg-primary/20 text-primary text-xs"
            >
              {item.badge}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const router = useRouter();

  const [loggingOut, setLoggingOut] = React.useState(false);
  const [menuGroups, setMenuGroups] = React.useState<WorkspaceMenuGroup[]>([]);
  const [menusError, setMenusError] = React.useState<string | null>(null);
  const [authUser, setAuthUser] = React.useState<any | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setAuthUser(getAuthUser());
    getWorkspaceMenus()
      .then(data => {
        if (!cancelled) {
          setMenuGroups(data);
        }
      })
      .catch(err => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load menus";
          setMenusError(message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      router.replace("/login");
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="size-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">AssetFlow</span>
              <span className="text-xs text-muted-foreground">
                Enterprise Asset Manager
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menusError && (
          <div className="px-4 py-2 text-xs text-destructive">
            {menusError}
          </div>
        )}
        {menuGroups.map(group => (
          <SidebarGroup key={group.id}>
            <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.menus.map(menu => (
                  <NavItemComponent key={menu.id} item={menuToNavItem(menu)} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {(authUser?.first_name ?? authUser?.username ?? "U")
                        .toString()
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex flex-1 flex-col text-left text-sm">
                      <span className="font-medium truncate">
                        {authUser?.first_name && authUser?.last_name
                          ? `${authUser.first_name} ${authUser.last_name}`
                          : authUser?.username ?? "User"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {authUser?.role?.name ?? "Role"}
                      </span>
                    </div>
                  )}
                  {!isCollapsed && <ChevronDown className="size-4" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-56"
              >
                <DropdownMenuItem>
                  <Bell className="mr-2 size-4" />
                  Notifications
                  <Badge variant="secondary" className="ml-auto">
                    5
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut className="mr-2 size-4" />
                  {loggingOut ? "Signing out..." : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
