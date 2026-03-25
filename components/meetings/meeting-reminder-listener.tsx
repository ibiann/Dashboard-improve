"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-context";

type Reminder = {
  id: string;
  targetRole: "CEO";
  fireAt: number; // epoch ms
  meeting: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    duration: number;
  };
  fired?: boolean;
};

const STORAGE_KEY = "meeting_reminders_v1";
const POLL_MS = 15_000;

function readReminders(): Reminder[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Reminder[];
  } catch {
    return [];
  }
}

function writeReminders(items: Reminder[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function MeetingReminderListener() {
  const { role } = useAuth();
  const runningRef = useRef(false);

  const process = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      if (role !== "CEO") return;
      const now = Date.now();
      const items = readReminders();
      let changed = false;

      for (const r of items) {
        if (r.targetRole !== "CEO") continue;
        if (r.fired) continue;
        if (r.fireAt > now) continue;

        r.fired = true;
        changed = true;
        toast({
          title: "Sắp đến cuộc họp",
          description: `${r.meeting.title} · ${r.meeting.date} ${r.meeting.time} · ${r.meeting.location}`,
        });
      }

      // Cleanup fired reminders older than 24h
      const keepAfter = now - 24 * 60 * 60 * 1000;
      const next = items.filter((r) => !(r.fired && r.fireAt < keepAfter));
      if (next.length !== items.length) changed = true;

      if (changed) writeReminders(next);
    } finally {
      runningRef.current = false;
    }
  }, [role]);

  useEffect(() => {
    process();
    const t = window.setInterval(process, POLL_MS);
    return () => window.clearInterval(t);
  }, [process]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      process();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [process]);

  return null;
}

