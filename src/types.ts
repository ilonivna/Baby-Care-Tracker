/**
 * Type declarations for the Baby Tracker application
 */

export interface BabyDetails {
  id: string;
  name: string;
  birthDate?: string;
  weight?: number; // in kg
}

export type FoodType = "breastmilk" | "formula" | "solids";

export interface FeedLog {
  id: string;
  timestamp: string; // ISO string
  amount: number; // in ml
  type: FoodType;
  notes?: string;
}

export type DiaperStatus = "wet" | "dirty" | "mixed" | "dry";

export interface DiaperLog {
  id: string;
  timestamp: string; // ISO string
  status: DiaperStatus;
  notes?: string;
}

export interface SleepLog {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  notes?: string;
}

export type RoutineType = "feed" | "diaper" | "sleep";

export interface ScheduledRoutine {
  id: string;
  name: string;
  type: RoutineType;
  time: string; // Hour/minute string, e.g. "14:30"
  enabled: boolean;
  notes?: string;
}

export type NotificationType = "routine" | "trend" | "info";

export interface SystemNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
}
