import { PENALTY_PER_DAY } from '../constants/theme';

export const fmtShort = (iso: string) =>
  new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

export const fmtFull = (iso: string) =>
  new Date(iso).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

export function daysLeft(dueDate: string): number {
  const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
  const now = new Date();        now.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / 86400000);
}

export function calcPenalty(dueDate: string): number {
  const d = daysLeft(dueDate);
  return d < 0 ? Math.abs(d) * PENALTY_PER_DAY : 0;
}

export function isOverdue(dueDate: string): boolean {
  return daysLeft(dueDate) < 0;
}
