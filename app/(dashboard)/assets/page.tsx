import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { AssetsView } from "@/components/assets/assets-view";

export default function AssetsPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Assets" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <AssetsView />
        </Suspense>
      </div>
    </>
  );
}
