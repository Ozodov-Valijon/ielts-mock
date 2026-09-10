'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';
import { Section, SectionState, Test } from './types';

export const sections: Section[] = ['reading', 'listening', 'writing', 'speaking'];
export function nextExamRoute(test: Test, after?: Section): string {
  const selected = test.test_mode && test.test_mode !== 'full' ? sections.filter(s => s === test.test_mode) : sections;
  const remaining = selected.filter(s => !test.section_state?.[s]?.submitted_at && (!after || sections.indexOf(s) > sections.indexOf(after)));
  return test.status !== 'in_progress' || !remaining.length
    ? `/test/${test.id}/results`
    : `/test/${test.id}/${remaining[0]}`;
}

export function useExamSession(testId: string, section: Section) {
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [state, setState] = useState<SectionState | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const details = await api.getTestDetails(testId);
        if (cancelled) return;
        if (details.status !== 'in_progress' || details.section_state?.[section]?.submitted_at || (details.test_mode !== 'full' && details.test_mode !== section)) {
          router.replace(nextExamRoute(details));
          return;
        }
        const session = await api.startSection(testId, section);
        if (!cancelled) { setTest(details); setState(session); }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Test yuklanmadi');
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [testId, section, router]);
  return { test, state, error, ready: !!state };
}

export function readDraft<T>(key: string, fallback: T): T {
  try { const stored = localStorage.getItem(key); return stored ? JSON.parse(stored) as T : fallback; }
  catch { return fallback; }
}
export function saveDraft(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage may be full; current answers remain in memory. */ }
}
export function clearDraft(key: string): void {
  try { localStorage.removeItem(key); } catch { /* Best-effort local cleanup. */ }
}
export function utcTime(value: string): number {
  return Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`);
}
