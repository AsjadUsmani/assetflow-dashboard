"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { GlobalSearch } from "@/components/dashboard/global-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAuthUser, logout } from "@/lib/services/auth";

interface AppHeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
  const router = useRouter();
  const [authUser, setAuthUser] = React.useState<ReturnType<typeof getAuthUser>>(null);
  const [loggingOut, setLoggingOut] = React.useState(false);

  React.useEffect(() => {
    setAuthUser(getAuthUser());
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

  const displayName =
    authUser?.first_name && authUser?.last_name
      ? `${authUser.first_name} ${authUser.last_name}`
      : authUser?.username ?? "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {breadcrumbs.length > 0 && (
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <span key={crumb.label} className="contents">
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href || "#"}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </span>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="ml-auto flex items-center gap-1">
        <div className="hidden md:block">
          <GlobalSearch />
        </div>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 py-1.5 h-auto shrink-0"
              aria-label="Profile menu"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium truncate max-w-[120px]">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-2">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {authUser?.email ?? "No email"}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="mr-2 size-4" />
              {loggingOut ? "Signing out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
