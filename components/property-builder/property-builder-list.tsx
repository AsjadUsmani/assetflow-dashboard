"use client";

import {
  Type,
  Hash,
  Calendar,
  ChevronDown,
  ToggleLeft,
  FileUp,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const typeIcons = {
  text: Type,
  number: Hash,
  date: Calendar,
  dropdown: ChevronDown,
  boolean: ToggleLeft,
  file: FileUp,
};

const properties = [
  {
    id: "1",
    name: "Brand",
    type: "text" as const,
    required: true,
    usedIn: ["Laptop", "Monitor", "Phone"],
    createdAt: "Jan 15, 2024",
  },
  {
    id: "2",
    name: "Model",
    type: "text" as const,
    required: true,
    usedIn: ["Laptop", "Monitor", "Phone", "Printer"],
    createdAt: "Jan 15, 2024",
  },
  {
    id: "3",
    name: "RAM (GB)",
    type: "number" as const,
    required: true,
    usedIn: ["Laptop", "Desktop"],
    validation: { min: 1, max: 256 },
    createdAt: "Jan 15, 2024",
  },
  {
    id: "4",
    name: "Storage (GB)",
    type: "number" as const,
    required: true,
    usedIn: ["Laptop", "Desktop", "Server"],
    validation: { min: 1, max: 10000 },
    createdAt: "Jan 15, 2024",
  },
  {
    id: "5",
    name: "Operating System",
    type: "dropdown" as const,
    required: true,
    usedIn: ["Laptop", "Desktop"],
    options: ["Windows 11", "macOS", "Linux"],
    createdAt: "Jan 16, 2024",
  },
  {
    id: "6",
    name: "License Key",
    type: "text" as const,
    required: true,
    usedIn: ["Software License"],
    createdAt: "Jan 20, 2024",
  },
  {
    id: "7",
    name: "Renewal Date",
    type: "date" as const,
    required: true,
    usedIn: ["Software License", "Subscription"],
    createdAt: "Jan 20, 2024",
  },
  {
    id: "8",
    name: "Is Active",
    type: "boolean" as const,
    required: false,
    usedIn: ["Software License", "Subscription", "Equipment"],
    defaultValue: true,
    createdAt: "Jan 22, 2024",
  },
  {
    id: "9",
    name: "Documentation",
    type: "file" as const,
    required: false,
    usedIn: ["Equipment", "Vehicle"],
    createdAt: "Jan 25, 2024",
  },
];

export function PropertyBuilderList() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Property Name</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Required</TableHead>
              <TableHead className="text-muted-foreground">Used In</TableHead>
              <TableHead className="text-muted-foreground">Created</TableHead>
              <TableHead className="text-muted-foreground w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => {
              const TypeIcon = typeIcons[property.type];

              return (
                <TableRow key={property.id} className="border-border">
                  <TableCell className="font-medium text-foreground">
                    {property.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1.5 bg-secondary border-border">
                      <TypeIcon className="size-3" />
                      <span className="capitalize">{property.type}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={property.required ? "default" : "secondary"}
                      className={
                        property.required
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-secondary text-muted-foreground"
                      }
                    >
                      {property.required ? "Required" : "Optional"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {property.usedIn.slice(0, 2).map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="text-xs bg-secondary text-muted-foreground"
                        >
                          {type}
                        </Badge>
                      ))}
                      {property.usedIn.length > 2 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-secondary text-muted-foreground"
                        >
                          +{property.usedIn.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {property.createdAt}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 size-4" />
                          Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 size-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
