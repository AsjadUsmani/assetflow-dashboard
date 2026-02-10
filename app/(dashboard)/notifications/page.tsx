import { AppHeader } from "@/components/app-header";
import { NotificationsList } from "@/components/notifications/notifications-list";

export default function NotificationsPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Notifications" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Notifications
          </h1>
          <p className="text-muted-foreground">
            View and manage your notifications and acknowledgements
          </p>
        </div>

        <NotificationsList />
      </div>
    </>
  );
}
