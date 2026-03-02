"use client";

import { useState } from "react";
import { Search, Filter, Plus, Download, ArrowRightLeft, Trash2, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function WorkflowFilters() {
  const [createOpen, setCreateOpen] = useState(false);
  const [requestType, setRequestType] = useState<string>("");

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search requests..."
                className="pl-9 bg-secondary border-0"
              />
            </div>

            <Select defaultValue="all">
              <SelectTrigger className="w-[160px] bg-secondary border-0">
                <SelectValue placeholder="Request Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="disposal">Disposal</SelectItem>
                <SelectItem value="buyback">Buyback</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-[160px] bg-secondary border-0">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="cinema">Cinema</SelectItem>
                <SelectItem value="regional">Regional</SelectItem>
                <SelectItem value="ho">Head Office</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="size-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 size-4" />
              Export
            </Button>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 size-4" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Workflow Request</DialogTitle>
                  <DialogDescription>
                    Initiate a new transfer, disposal, or buyback request for an asset
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Request Type</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={requestType === "transfer" ? "default" : "outline"}
                        className="flex flex-col h-auto py-4 gap-2"
                        onClick={() => setRequestType("transfer")}
                      >
                        <ArrowRightLeft className="size-5" />
                        <span className="text-xs">Transfer</span>
                      </Button>
                      <Button
                        variant={requestType === "disposal" ? "default" : "outline"}
                        className="flex flex-col h-auto py-4 gap-2"
                        onClick={() => setRequestType("disposal")}
                      >
                        <Trash2 className="size-5" />
                        <span className="text-xs">Disposal</span>
                      </Button>
                      <Button
                        variant={requestType === "buyback" ? "default" : "outline"}
                        className="flex flex-col h-auto py-4 gap-2"
                        onClick={() => setRequestType("buyback")}
                      >
                        <DollarSign className="size-5" />
                        <span className="text-xs">Buyback</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Provide details for this request..."
                      className="bg-secondary border-0 min-h-[100px]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Serial Numbers (if applicable)</Label>
                    <Input
                      placeholder="Enter serial numbers, comma separated"
                      className="bg-secondary border-0"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setCreateOpen(false)}>
                    Submit Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
