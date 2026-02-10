import { AppHeader } from "@/components/app-header";
import { AssetDetail } from "@/components/assets/asset-detail";
import { assets } from "@/lib/mock-data";
import { notFound } from "next/navigation";

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = assets.find((a) => a.id === id);

  if (!asset) {
    notFound();
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Assets", href: "/assets" },
          { label: asset.name },
        ]}
      />
      <AssetDetail asset={asset} />
    </>
  );
}
