import { FeedLog, DiaperLog, SleepLog, ScheduledRoutine } from "../types";

/**
 * Computes the weekly milk consumption average for the current 7 days vs prior 7 days
 */
export function calculateWeeklyFeedingTrend(feedLogs: FeedLog[]) {
  const now = new Date();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  
  const startOfThisWeek = new Date(now.getTime() - 7 * ONE_DAY_MS);
  const startOfLastWeek = new Date(now.getTime() - 14 * ONE_DAY_MS);

  // Group readings
  let thisWeekTotal = 0;
  let lastWeekTotal = 0;

  feedLogs.forEach((log) => {
    const logTime = new Date(log.timestamp).getTime();
    if (logTime >= startOfThisWeek.getTime()) {
      thisWeekTotal += log.amount;
    } else if (logTime >= startOfLastWeek.getTime() && logTime < startOfThisWeek.getTime()) {
      lastWeekTotal += log.amount;
    }
  });

  const thisWeekDailyAvg = Math.round(thisWeekTotal / 7);
  const lastWeekDailyAvg = Math.round(lastWeekTotal / 7);

  let percentChange = 0;
  if (lastWeekDailyAvg > 0) {
    percentChange = Number((((thisWeekDailyAvg - lastWeekDailyAvg) / lastWeekDailyAvg) * 100).toFixed(1));
  }

  return {
    thisWeekDailyAvg,
    lastWeekDailyAvg,
    percentChange,
    thisWeekTotal,
    lastWeekTotal
  };
}

/**
 * High-quality seed sample data so the app displays beautiful charts and alerts on launch
 */
export function getSampleLogs() {
  const now = new Date();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  // Let's generate logs spanning 14 days ago up to today
  const feedLogs: FeedLog[] = [];
  const diaperLogs: DiaperLog[] = [];
  const sleepLogs: SleepLog[] = [];

  // Diaper states
  const statuses: ("wet" | "dirty" | "mixed")[] = ["wet", "dirty", "mixed", "wet", "wet"];

  for (let i = 14; i >= 0; i--) {
    const day = new Date(now.getTime() - i * ONE_DAY_MS);
    
    // Feeds: Let's simulate a slight increase in consumption as the baby grows
    // Or slight variations. Week -2: ~520ml/day. Week -1: ~580ml/day.
    const isPriorWeek = i > 7;
    const baseAmount = isPriorWeek ? 70 : 85; 
    const feedsCount = isPriorWeek ? 7 : 8; // feeds per day

    for (let f = 0; f < feedsCount; f++) {
      const feedTime = new Date(day);
      feedTime.setHours(6 + f * 2, Math.floor(Math.random() * 45), 0, 0);
      
      const type: ("breastmilk" | "formula") = f % 2 === 0 ? "breastmilk" : "formula";
      const actualAmount = baseAmount + Math.floor(Math.random() * 20 - 10);
      
      feedLogs.push({
        id: `feed-seed-${i}-${f}`,
        timestamp: feedTime.toISOString(),
        amount: actualAmount,
        type,
        notes: f === 0 ? "Woke up very hungry" : undefined
      });
    }

    // Diapers: 5 to 7 diaper changes a day
    const diaperDays = 5 + Math.floor(Math.random() * 3);
    for (let d = 0; d < diaperDays; d++) {
      const diaperTime = new Date(day);
      diaperTime.setHours(7 + d * 3, Math.floor(Math.random() * 60), 0 , 0);
      diaperLogs.push({
        id: `diaper-seed-${i}-${d}`,
        timestamp: diaperTime.toISOString(),
        status: statuses[(i + d) % statuses.length],
        notes: d === 1 ? "Normal color" : undefined
      });
    }

    // Sleep: 3 naps a day + 1 long night sleep
    // Night sleep (start end)
    const nightStart = new Date(day);
    nightStart.setHours(20, 0, 0, 0);
    const nightEnd = new Date(day.getTime() + ONE_DAY_MS);
    nightEnd.setHours(6, 30, 0, 0);

    sleepLogs.push({
      id: `sleep-seed-night-${i}`,
      startTime: nightStart.toISOString(),
      endTime: nightEnd.toISOString(),
      notes: "Slept through the night with 2 brief wakes"
    });

    // Daytime naps
    const nap1Start = new Date(day);
    nap1Start.setHours(9, 30, 0, 0);
    const nap1End = new Date(day);
    nap1End.setHours(11, 0, 0, 0);
    sleepLogs.push({
      id: `sleep-seed-nap1-${i}`,
      startTime: nap1Start.toISOString(),
      endTime: nap1End.toISOString(),
      notes: "Mid-morning nap"
    });

    const nap2Start = new Date(day);
    nap2Start.setHours(14, 0, 0, 0);
    const nap2End = new Date(day);
    nap2End.setHours(15, 30, 0, 0);
    sleepLogs.push({
      id: `sleep-seed-nap2-${i}`,
      startTime: nap2Start.toISOString(),
      endTime: nap2End.toISOString(),
      notes: "Afternoon nap"
    });
  }

  return { feedLogs, diaperLogs, sleepLogs };
}

export const initialRoutines: ScheduledRoutine[] = [
  { id: "r1", name: "Early Morning Feeding", type: "feed", time: "07:00", enabled: true, notes: "80ml breastmilk/formula" },
  { id: "r2", name: "Morning Nap Time", type: "sleep", time: "09:30", enabled: true, notes: "Wind down in crib" },
  { id: "r3", name: "Midday Fresh Diaper", type: "diaper", time: "12:30", enabled: true, notes: "Verify change before lunch feed" },
  { id: "r4", name: "Afternoon Feed", type: "feed", time: "15:00", enabled: true, notes: "90ml formula" },
  { id: "r5", name: "Bedtime Sleep Preparation", type: "sleep", time: "19:30", enabled: true, notes: "Storybook reading" }
];
