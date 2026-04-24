"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { createDesignation } from "@/lib/services/designations"
import { useToast } from "@/components/ui/use-toast"

export default function CreateDesignationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = React.useState("")
  const [code, setCode] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Designation name is required" })
      return
    }

    setIsSaving(true)
    try {
      await createDesignation({
        name: name.trim(),
        code: code.trim() || null,
        description: description.trim() || null,
      })
      toast({ title: "Designation created", description: "New designation has been added." })
      router.push("/designations")
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to create designation",
        description: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Overview", href: "/dashboard" },
          { label: "Designations", href: "/designations" },
          { label: "Create" },
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
              <h1 className="text-2xl font-semibold tracking-tight">Create Designation</h1>
              <p className="text-muted-foreground">Add a new designation to the master list.</p>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Designation details</CardTitle>
                <CardDescription>Provide the basic information for the designation.</CardDescription>
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
                    Create Designation
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
