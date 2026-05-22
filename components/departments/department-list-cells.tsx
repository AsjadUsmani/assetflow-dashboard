"use client";

import { Building2, Mail, MapPin, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Department, DepartmentVenueContact } from "@/lib/services/departments";

/** Above table rows, sticky header, and sidebar overlays */
const DROPDOWN_PANEL_CLASS =
  "z-[200] max-h-[min(20rem,70vh)] overflow-hidden border bg-popover p-0 shadow-lg";

export function DepartmentVenuesCell({ dept }: { dept: Department }) {
  const venues = dept.venue_contacts.length > 0
    ? dept.venue_contacts.map((v) => v.location_name)
    : dept.location_names;
  const count = venues.length;

  if (count === 0) {
    return <span className="text-sm text-muted-foreground">No venues</span>;
  }

  if (count === 1) {
    return (
      <div className="flex max-w-[220px] items-center gap-2">
        <MapPin className="size-3.5 shrink-0 text-primary/70" />
        <span className="truncate text-sm" title={venues[0]}>
          {venues[0]}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 max-w-full gap-1.5 border-dashed px-2.5 font-normal hover:border-primary/40 hover:bg-primary/5"
        >
          <Building2 className="size-3.5 shrink-0 text-primary" />
          <span className="truncate">
            <span className="font-medium text-foreground">{count}</span>
            <span className="text-muted-foreground"> venues</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={12}
        className={`${DROPDOWN_PANEL_CLASS} w-80`}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b bg-popover px-3 py-2.5">
          <p className="text-sm font-medium">{dept.name}</p>
          <p className="text-xs text-muted-foreground">
            Mapped to {count} location{count !== 1 ? "s" : ""}
          </p>
        </div>
        <ul className="max-h-56 divide-y overflow-y-auto overscroll-contain bg-popover p-1">
          {venues.map((name, i) => (
            <li
              key={`${dept.id}-${i}-${name}`}
              className="flex items-start gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted/60"
            >
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <span className="leading-snug">{name}</span>
            </li>
          ))}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function contactsWithDetails(contacts: DepartmentVenueContact[]) {
  return contacts.filter((c) => c.phone || c.email);
}

export function DepartmentContactsCell({ dept }: { dept: Department }) {
  const contacts = dept.venue_contacts;
  const count = contacts.length;
  const withDetails = contactsWithDetails(contacts);

  if (count === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  if (count === 1) {
    const c = contacts[0]!;
    return (
      <div className="flex max-w-[240px] flex-col gap-1 text-sm">
        {c.phone && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="size-3.5 shrink-0" />
            <span className="truncate text-foreground">{c.phone}</span>
          </span>
        )}
        {c.email && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate text-foreground">{c.email}</span>
          </span>
        )}
        {!c.phone && !c.email && (
          <span className="text-muted-foreground">No contact set</span>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-dashed px-2.5 font-normal hover:border-primary/40 hover:bg-primary/5"
        >
          <span className="text-muted-foreground">Per venue</span>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
            {withDetails.length}/{count}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={12}
        className={`${DROPDOWN_PANEL_CLASS} w-[min(24rem,90vw)]`}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b bg-popover px-3 py-2.5">
          <p className="text-sm font-medium">Venue-wise contact</p>
          <p className="text-xs text-muted-foreground">{dept.name}</p>
        </div>
        <div className="max-h-64 divide-y overflow-y-auto overscroll-contain bg-popover">
          {contacts.map((vc) => (
            <div key={vc.location_id} className="space-y-1 px-3 py-2.5">
              <p className="text-xs font-medium text-foreground">{vc.location_name}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {vc.phone ? (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3" />
                    {vc.phone}
                  </span>
                ) : null}
                {vc.email ? (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-3" />
                    <span className="max-w-[180px] truncate">{vc.email}</span>
                  </span>
                ) : null}
                {!vc.phone && !vc.email && (
                  <span className="italic">Not configured</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
