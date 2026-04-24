"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"

import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDesignationById, type Designation } from "@/lib/services/designations"
import { useToast } from "@/components/ui/use-toast"

export default function DesignationDetailsPage() {
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  const id = Number(params?.id)

  const [isLoading, setIsLoading] = React.useState(true)
  const [designation, setDesignation] = React.useState<Designation | null>(null)

  React.useEffect(() => {
    if (!id || Number.isNaN(id)) return
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      try {
        const row = await getDesignationById(id)
        if (controller.signal.aborted) return
        setDesignation(row)
      } catch (err) {
        if (!controller.signal.aborted) {
          toast({
            variant: "destructive",
            title: "Failed to load designation",
            description: err instanceof Error ? err.message : "Unknown error",
          })
          window.location.href = "/designations"
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [id, toast])

  if (isLoading) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: "Overview", href: "/dashboard" },
            { label: "Designations", href: "/designations" },
            { label: "Details" },
          ]}
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (!designation) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: "Overview", href: "/dashboard" },
            { label: "Designations", href: "/designations" },
            { label: "Details" },
          ]}
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Designation not found.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Overview", href: "/dashboard" },
          { label: "Designations", href: "/designations" },
          { label: "Details" },
        ]}
      />
      <div className="flex-1 p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/designations">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Designation Details</h1>
              <p className="text-muted-foreground">Read-only view of designation information.</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Designation details</CardTitle>
              <CardDescription>Master values used in user and employee profiles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={designation.name} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={designation.code ?? ""} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={designation.description ?? ""} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div>
                  <Badge variant={designation.is_active ? "default" : "secondary"}>
                    {designation.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Created At</Label>
                <Input value={new Date(designation.created_at).toLocaleString()} readOnly disabled />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
