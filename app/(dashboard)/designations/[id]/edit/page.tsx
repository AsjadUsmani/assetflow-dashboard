"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
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
import { getDesignationById, updateDesignation } from "@/lib/services/designations"
import { useToast } from "@/components/ui/use-toast"

export default function EditDesignationPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const id = Number(params?.id)

  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [name, setName] = React.useState("")
  const [code, setCode] = React.useState("")
  const [description, setDescription] = React.useState("")

  React.useEffect(() => {
    if (!id || Number.isNaN(id)) return
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      try {
        const row = await getDesignationById(id)
        if (controller.signal.aborted) return
        if (!row) {
          toast({ variant: "destructive", title: "Designation not found" })
          router.push("/designations")
          return
        }
        setName(row.name)
        setCode(row.code ?? "")
        setDescription(row.description ?? "")
      } catch (err) {
        if (!controller.signal.aborted) {
          toast({
            variant: "destructive",
            title: "Failed to load designation",
            description: err instanceof Error ? err.message : "Unknown error",
          })
          router.push("/designations")
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [id, router, toast])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Designation name is required" })
      return
    }

    setIsSaving(true)
    try {
      await updateDesignation(id, {
        name: name.trim(),
        code: code.trim() || null,
        description: description.trim() || null,
      })
      toast({ title: "Designation updated", description: "Changes have been saved." })
      router.push("/designations")
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to update designation",
        description: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: "Overview", href: "/dashboard" },
            { label: "Designations", href: "/designations" },
            { label: "Edit" },
          ]}
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
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
          { label: "Edit" },
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
              <h1 className="text-2xl font-semibold tracking-tight">Edit Designation</h1>
              <p className="text-muted-foreground">Update designation master values.</p>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Designation details</CardTitle>
                <CardDescription>Edit name, code, and description.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => router.push("/designations")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Save changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </>
  )
}
