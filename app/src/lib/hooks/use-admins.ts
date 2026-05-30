"use client";

import { useCallback, useEffect, useState } from "react";
import type { Admin } from "@/lib/types";
import { MOCK_ADMINS } from "@/lib/mock/admins";

type AdminsState = {
  admins: Admin[];
  loading: boolean;
};

const MOCK_LATENCY_MS = 150;

let _state: Admin[] = [...MOCK_ADMINS];
const _subscribers = new Set<(next: Admin[]) => void>();
function publish() {
  for (const s of _subscribers) s([..._state]);
}

export function useAdmins(): AdminsState & {
  addAdmin: (input: { name: string; email: string }) => void;
  removeAdmin: (id: string) => void;
} {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => {
      setAdmins([..._state]);
      setLoading(false);
    }, MOCK_LATENCY_MS);
    const onChange = (next: Admin[]) => setAdmins(next);
    _subscribers.add(onChange);
    return () => {
      clearTimeout(id);
      _subscribers.delete(onChange);
    };
  }, []);

  const addAdmin = useCallback(({ name, email }: { name: string; email: string }) => {
    const initials = name
      .split(/\s+/)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "??";
    const palette = ["#C8553D", "#5A8F5A", "#9DB4C0", "#E8A87C", "#6B6B6B"];
    const color = palette[_state.length % palette.length];
    const next: Admin = {
      id: `admin_${Date.now()}`,
      name,
      email,
      initials,
      color,
      active: true,
    };
    _state = [..._state, next];
    publish();
  }, []);

  const removeAdmin = useCallback((id: string) => {
    _state = _state.filter((a) => a.id !== id);
    publish();
  }, []);

  return { admins, loading, addAdmin, removeAdmin };
}

export function findAdmin(admins: Admin[], id: string | null): Admin | null {
  if (!id) return null;
  return admins.find((a) => a.id === id) ?? null;
}
