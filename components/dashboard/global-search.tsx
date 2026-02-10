"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Package,
  User,
  MapPin,
  FolderTree,
  X,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { assets, users, locations, departments } from "@/lib/mock-data";

interface SearchResult {
  id: string;
  type: "asset" | "user" | "location" | "department";
  title: string;
  subtitle: string;
  metadata?: string;
  href: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search assets by name, serial number, hostname, username
    assets.forEach((asset) => {
      const hostname = asset.properties?.hostname as string | undefined;
      const username = asset.properties?.username as string | undefined;
      
      if (
        asset.name.toLowerCase().includes(searchQuery) ||
        asset.serialNumber?.toLowerCase().includes(searchQuery) ||
        hostname?.toLowerCase().includes(searchQuery) ||
        username?.toLowerCase().includes(searchQuery)
      ) {
        searchResults.push({
          id: asset.id,
          type: "asset",
          title: asset.name,
          subtitle: asset.serialNumber || "No serial number",
          metadata: asset.status,
          href: `/assets/${asset.id}`,
        });
      }
    });

    // Search users
    users.forEach((user) => {
      if (
        user.name.toLowerCase().includes(searchQuery) ||
        user.email.toLowerCase().includes(searchQuery)
      ) {
        searchResults.push({
          id: user.id,
          type: "user",
          title: user.name,
          subtitle: user.email,
          metadata: user.role.replace("_", " "),
          href: `/users?search=${user.name}`,
        });
      }
    });

    // Search locations
    locations.forEach((location) => {
      if (
        location.name.toLowerCase().includes(searchQuery) ||
        location.address.toLowerCase().includes(searchQuery)
      ) {
        searchResults.push({
          id: location.id,
          type: "location",
          title: location.name,
          subtitle: location.address,
          href: `/locations/${location.id}`,
        });
      }
    });

    // Search departments
    departments.forEach((dept) => {
      if (dept.name.toLowerCase().includes(searchQuery)) {
        searchResults.push({
          id: dept.id,
          type: "department",
          title: dept.name,
          subtitle: `Location: ${locations.find((l) => l.id === dept.locationId)?.name || "Unknown"}`,
          href: `/departments/${dept.id}`,
        });
      }
    });

    setResults(searchResults.slice(0, 10));
  }, [query]);

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "asset":
        return Package;
      case "user":
        return User;
      case "location":
        return MapPin;
      case "department":
        return FolderTree;
    }
  };

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm text-muted-foreground sm:pr-12 md:w-64 lg:w-80"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 size-4" />
        <span className="hidden lg:inline-flex">Search assets, users, locations...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
          <span className="text-xs">Cmd</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Global Search</DialogTitle>
          </DialogHeader>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 size-4 shrink-0 opacity-50" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by hostname, serial number, username..."
              className="flex h-12 w-full rounded-none border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="size-6 p-0"
                onClick={() => setQuery("")}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          <ScrollArea className="max-h-[300px]">
            {results.length === 0 && query && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found for &quot;{query}&quot;
              </div>
            )}

            {results.length === 0 && !query && (
              <div className="px-4 py-6">
                <p className="text-sm text-muted-foreground mb-3">
                  Search by:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Hostname</Badge>
                  <Badge variant="secondary">Serial Number</Badge>
                  <Badge variant="secondary">Username</Badge>
                  <Badge variant="secondary">Asset Name</Badge>
                  <Badge variant="secondary">Location</Badge>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="p-2">
                {results.map((result) => {
                  const Icon = getIcon(result.type);
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                    >
                      <div className="flex size-8 items-center justify-center rounded-md bg-secondary">
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium">{result.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {result.subtitle}
                        </p>
                      </div>
                      {result.metadata && (
                        <Badge variant="outline" className="capitalize text-xs">
                          {result.metadata}
                        </Badge>
                      )}
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="flex items-center justify-between border-t bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <div className="flex gap-2">
              <span>Press</span>
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono">Enter</kbd>
              <span>to select</span>
            </div>
            <div className="flex gap-2">
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono">Esc</kbd>
              <span>to close</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
