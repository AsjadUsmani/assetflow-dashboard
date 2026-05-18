"use client";

import { useEffect, useState } from "react";
import { getWorkspaceCapabilities } from "@/lib/services/capabilities";

export function useCanCreate(): boolean {
  const [canCreate, setCanCreate] = useState(false);

  useEffect(() => {
    getWorkspaceCapabilities()
      .then((caps) => setCanCreate(caps.can_create))
      .catch(() => setCanCreate(false));
  }, []);

  return canCreate;
}
