"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Mail, MapPin, Phone, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Department, DepartmentVenueContact } from "@/lib/services/departments";

function normalizeContacts(dept: Department): DepartmentVenueContact[] {
  if (dept.venue_contacts.length > 0) return dept.venue_contacts;
  return dept.location_names.map((name, i) => ({
    location_id: dept.location_ids[i] ?? i,
    location_name: name,
    phone: null,
    email: null,
  }));
}

export function DepartmentVenuesPanel({ dept }: { dept: Department }) {
  const [search, setSearch] = useState("");
  const contacts = useMemo(() => normalizeContacts(dept), [dept]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (v) =>
        v.location_name.toLowerCase().includes(q) ||
        (v.phone?.toLowerCase().includes(q) ?? false) ||
        (v.email?.toLowerCase().includes(q) ?? false),
    );
  }, [contacts, search]);

  const configuredCount = contacts.filter((c) => c.phone || c.email).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary" className="gap-1.5 px-2.5 py-1">
          <Building2 className="size-3.5" />
          {contacts.length} venue{contacts.length !== 1 ? "s" : ""}
        </Badge>
        <Badge variant="outline" className="gap-1.5 px-2.5 py-1">
          <Phone className="size-3.5" />
          {configuredCount} with contact
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search venues, phone, or email..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {contacts.length === 0 ? (
        <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          No venues linked to this department yet.
        </p>
      ) : (
        <div className="rounded-lg border">
          <ScrollArea className="h-[min(420px,55vh)]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                <TableRow>
                  <TableHead className="w-[45%]">Venue</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No venues match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((vc) => (
                    <TableRow key={vc.location_id} className="hover:bg-muted/40">
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
                          <div className="min-w-0">
                            <p className="font-medium leading-snug">{vc.location_name}</p>
                            <Link
                              href={`/locations/${vc.location_id}`}
                              className="text-xs text-primary hover:underline"
                            >
                              View location
                            </Link>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {vc.phone ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="size-3.5 shrink-0" />
                            {vc.phone}
                          </span>
                        ) : (
                          <span className="text-xs italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {vc.email ? (
                          <a
                            href={`mailto:${vc.email}`}
                            className="inline-flex items-center gap-1.5 truncate text-primary hover:underline"
                          >
                            <Mail className="size-3.5 shrink-0" />
                            <span className="truncate">{vc.email}</span>
                          </a>
                        ) : (
                          <span className="text-xs italic text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          {search.trim() && (
            <p className="border-t px-3 py-2 text-xs text-muted-foreground">
              Showing {filtered.length} of {contacts.length} venues
            </p>
          )}
        </div>
      )}
    </div>
  );
}
