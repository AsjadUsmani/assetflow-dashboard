"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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
  Bell,
  ChevronDown,
  GitBranch,
  ClipboardList,
} from "lucide-react";

// import { cn } from "@/lib/utils";
// import type { UserRole } from "@/lib/types";
import {
  Sidebar,
  SidebarContent,
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
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { getWorkspaceMenus, type WorkspaceMenu, type WorkspaceMenuGroup } from "@/lib/services/menu"
import { loadWorkspaceMenusAndCapabilities } from "@/lib/services/capabilities"

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

function normalizeMenuLabel(label: string): string {
  return label === "Users & Roles" ? "Users" : label;
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
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [menuGroups, setMenuGroups] = React.useState<WorkspaceMenuGroup[]>([]);
  const [menusError, setMenusError] = React.useState<string | null>(null);

  const menuGroupsWithEmployees = React.useMemo(() => {
    return menuGroups.map(group => {
      const hasUsersMenu = group.menus.some(item => item.path === '/users');
      const hasEmployeesMenu = group.menus.some(item => item.path === '/employees');

      if (!hasUsersMenu || hasEmployeesMenu) {
        return group;
      }

      const employeeMenu: WorkspaceMenu = {
        id: -1001,
        path: '/employees',
        label: 'Employee',
        icon: 'Users',
        sort_order: 0,
        children: [],
      };

      const menusWithEmployee: WorkspaceMenu[] = [];
      for (const item of group.menus) {
        if (item.path === '/users') {
          menusWithEmployee.push(employeeMenu);
        }
        menusWithEmployee.push(item);
      }

      return {
        ...group,
        menus: menusWithEmployee,
      };
    });
  }, [menuGroups]);

  React.useEffect(() => {
    let cancelled = false;
    loadWorkspaceMenusAndCapabilities()
      .then(({ groups }) => {
        if (!cancelled) {
          setMenuGroups(groups);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load menus";
          setMenusError(message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex size-8 items-center justify-center overflow-hidden rounded-lg bg-sidebar-accent/40 p-1">
            <Image
              src="/icon-logo-light.png"
              alt="Icon Logo"
              width={24}
              height={24}
              className="block dark:hidden"
              priority
            />
            <Image
              src="/icon-logo-dark.png"
              alt="Icon Logo"
              width={24}
              height={24}
              className="hidden dark:block"
              priority
            />
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
        {menuGroupsWithEmployees.map((group) => (
          <React.Fragment key={group.id}>
            <SidebarGroup>
              <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.menus.map((item) => {
                    const Icon =
                      item.icon && iconMap[item.icon]
                        ? iconMap[item.icon]
                        : LayoutDashboard

                    return item.children.length > 0 ? (
                      <Collapsible
                        key={item.id}
                        asChild
                        defaultOpen={pathname.startsWith(item.path)}
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              isActive={pathname.startsWith(item.path)}
                              tooltip={item.label ?? item.path}
                              onClick={() => {
                                router.push(item.path);
                              }}
                            >
                              <Icon className="size-4" />
                              <span>{normalizeMenuLabel(item.label ?? item.path)}</span>
                              <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children.map((sub) => (
                                <SidebarMenuSubItem key={sub.id}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname === sub.path}
                                  >
                                    <Link href={sub.path}>
                                      <span>{normalizeMenuLabel(sub.label ?? sub.path)}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    ) : (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.path}
                          tooltip={item.label ?? item.path}
                        >
                          <Link href={item.path}>
                            <Icon className="size-4" />
                            <span>{normalizeMenuLabel(item.label ?? item.path)}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
          </React.Fragment>
        ))}
      </SidebarContent>

    </Sidebar>
  );
}
