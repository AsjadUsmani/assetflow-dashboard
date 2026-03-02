"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeft,
  Trash2,
  UserCheck,
  Bell,
  CheckCircle2,
  Clock,
  MailOpen,
  Mail,
  Filter,
  CheckCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Notification } from "@/lib/types";

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "transfer":
      return ArrowRightLeft;
    case "disposal":
      return Trash2;
    case "ownership_change":
      return UserCheck;
    case "approval_required":
      return Clock;
    case "acknowledgement":
      return CheckCircle2;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: Notification["type"]) => {
  switch (type) {
    case "transfer":
      return "bg-blue-500/20 text-blue-400";
    case "disposal":
      return "bg-red-500/20 text-red-400";
    case "ownership_change":
      return "bg-green-500/20 text-green-400";
    case "approval_required":
      return "bg-amber-500/20 text-amber-400";
    case "acknowledgement":
      return "bg-purple-500/20 text-purple-400";
    default:
      return "bg-secondary text-muted-foreground";
  }
};

function NotificationCard({
  notification,
  onAcknowledge,
  onMarkRead,
}: {
  notification: Notification;
  onAcknowledge: (id: string) => void;
  onMarkRead: (id: string) => void;
}) {
  const Icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);
  const timeAgo = getTimeAgo(notification.createdAt);

  return (
    <div
      className={`flex gap-4 rounded-lg border border-border p-4 transition-colors ${
        notification.read ? "bg-card" : "bg-accent/50"
      }`}
    >
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{notification.title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {notification.message}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!notification.read && (
              <Badge variant="secondary" className="text-xs">
                New
              </Badge>
            )}
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {timeAgo}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkRead(notification.id)}
            >
              <MailOpen className="mr-2 size-4" />
              Mark as read
            </Button>
          )}
          {notification.type === "acknowledgement" && !notification.acknowledged && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm">
                  <CheckCircle2 className="mr-2 size-4" />
                  Acknowledge
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Acknowledge Receipt</AlertDialogTitle>
                  <AlertDialogDescription>
                    By acknowledging, you confirm that you have received and are
                    now responsible for the asset mentioned in this notification.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onAcknowledge(notification.id)}>
                    Confirm Acknowledgement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {notification.acknowledged && (
            <Badge variant="outline" className="text-success border-success/50">
              <CheckCheck className="mr-1 size-3" />
              Acknowledged
              {notification.acknowledgedAt && (
                <span className="ml-1">
                  on {notification.acknowledgedAt.toLocaleDateString()}
                </span>
              )}
            </Badge>
          )}
          {notification.relatedWorkflowId && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/workflows/${notification.relatedWorkflowId}`}>
                View Request
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
  }
  return "Just now";
}

export function NotificationsList() {
  const [notificationState, setNotificationState] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("all");

  const unreadCount = notificationState.filter((n) => !n.read).length;
  const pendingAcknowledgements = notificationState.filter(
    (n) => n.type === "acknowledgement" && !n.acknowledged
  ).length;

  const handleMarkRead = (id: string) => {
    setNotificationState((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleAcknowledge = (id: string) => {
    setNotificationState((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, acknowledged: true, acknowledgedAt: new Date(), read: true }
          : n
      )
    );
  };

  const handleMarkAllRead = () => {
    setNotificationState((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifications = notificationState.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "pending") return n.type === "acknowledgement" && !n.acknowledged;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <Card className="bg-card border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20">
                <Mail className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{unreadCount}</p>
                <p className="text-xs text-muted-foreground">Unread</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/20">
                <Clock className="size-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{pendingAcknowledgements}</p>
                <p className="text-xs text-muted-foreground">Pending Ack.</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px] bg-secondary border-0">
              <Filter className="mr-2 size-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notifications</SelectItem>
              <SelectItem value="unread">Unread Only</SelectItem>
              <SelectItem value="pending">Pending Ack.</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-2 size-4" />
            Mark all read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-secondary">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="acknowledgements">
            Acknowledgements
            {pendingAcknowledgements > 0 && (
              <Badge variant="secondary" className="ml-2 bg-amber-500/20 text-amber-400">
                {pendingAcknowledgements}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">All Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="size-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onAcknowledge={handleAcknowledge}
                    onMarkRead={handleMarkRead}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Transfer Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredNotifications
                .filter((n) => n.type === "transfer" || n.type === "ownership_change")
                .map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onAcknowledge={handleAcknowledge}
                    onMarkRead={handleMarkRead}
                  />
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Approval Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredNotifications
                .filter((n) => n.type === "approval_required")
                .map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onAcknowledge={handleAcknowledge}
                    onMarkRead={handleMarkRead}
                  />
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acknowledgements" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Acknowledgements Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredNotifications
                .filter((n) => n.type === "acknowledgement")
                .map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onAcknowledge={handleAcknowledge}
                    onMarkRead={handleMarkRead}
                  />
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
