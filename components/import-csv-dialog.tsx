"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { apiService } from "@/lib/services/api-service";
import { Loader2, Upload, FileSpreadsheet } from "lucide-react";

export type ImportCsvResult = {
  created: number;
  errors: { row: number; message: string }[];
};

type ImportCsvDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpoint: string;
  title: string;
  description?: string;
  sampleFilename?: string;
  onSuccess?: () => void;
};

export function ImportCsvDialog({
  open,
  onOpenChange,
  endpoint,
  title,
  description = "Upload a CSV file to bulk import. Column headers must match the sample CSV.",
  sampleFilename = "sample.csv",
  onSuccess,
}: ImportCsvDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ImportCsvResult | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({ variant: "destructive", title: "Please select a CSV file" });
      return;
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast({ variant: "destructive", title: "Please select a .csv file" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await apiService.uploadFile<ImportCsvResult>(endpoint, file);
      const data = res.data ?? { created: 0, errors: [] };
      setResult(data);
      if (data.errors.length === 0) {
        toast({
          title: "Import complete",
          description: `${data.created} record(s) created.`,
        });
        onSuccess?.();
        if (data.created > 0) onOpenChange(false);
      } else if (data.created > 0) {
        toast({
          title: "Import completed with errors",
          description: `Created: ${data.created}. ${data.errors.length} row(s) had errors.`,
          variant: "destructive",
        });
        onSuccess?.();
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Import failed",
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setFile(null);
      setResult(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="size-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-2">
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
            >
              <Upload className="mr-2 size-4" />
              {file ? file.name : "Choose CSV file"}
            </Button>
          </div>
          {result && result.errors.length > 0 && (
            <div className="max-h-40 overflow-auto rounded-md border bg-muted/50 p-3 text-sm">
              <p className="mb-1 font-medium">Row errors:</p>
              <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                {result.errors.slice(0, 10).map((err, i) => (
                  <li key={i}>
                    Row {err.row}: {err.message}
                  </li>
                ))}
                {result.errors.length > 10 && (
                  <li>… and {result.errors.length - 10} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Importing…
              </>
            ) : (
              "Import"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
