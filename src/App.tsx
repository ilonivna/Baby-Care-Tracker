import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Baby, 
  Bell, 
  Sparkles, 
  Trash2, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  X, 
  CheckCircle, 
  PlusCircle, 
  TrendingUp, 
  TrendingDown,
  Info,
  Sun,
  Moon
} from "lucide-react";

import { FeedLog, DiaperLog, SleepLog, ScheduledRoutine, SystemNotification } from "./types";
import { getSampleLogs, initialRoutines, calculateWeeklyFeedingTrend } from "./utils/analytics";

import StatsOverview from "./components/StatsOverview";
import LogsManager from "./components/LogsManager";
import RoutineScheduler from "./components/RoutineScheduler";
import AISuggestions from "./components/AISuggestions";
import ChartsPanel from "./components/ChartsPanel";
import BabyInfoBanner from "./components/BabyInfoBanner";

export default function App() {
  // Theme Toggle state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem("baby_tracker_theme") as 'light' | 'dark') || "light";
  });

  useEffect(() => {
    localStorage.setItem("baby_tracker_theme", theme);
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Baby profile details states
  const [babyName, setBabyName] = useState<string>(() => {
    return localStorage.getItem("baby_tracker_name") || "Leo";
  });

  const [babyBirthDate, setBabyBirthDate] = useState<string>(() => {
    // Falls back to a date exactly 3 months & 22 days ago so there is a realistic initial age
    const fallbackDate = new Date();
    fallbackDate.setMonth(fallbackDate.getMonth() - 3);
    fallbackDate.setDate(fallbackDate.getDate() - 22);
    return localStorage.getItem("baby_tracker_birth_date") || fallbackDate.toISOString().substring(0, 10);
  });

  const [babyPhoto, setBabyPhoto] = useState<string | null>(() => {
    return localStorage.getItem("baby_tracker_photo");
  });
  // Try loading from localStorage first, fallback to preloaded sample logs
  const [feedLogs, setFeedLogs] = useState<FeedLog[]>(() => {
    const saved = localStorage.getItem("baby_tracker_feed_logs");
    return saved ? JSON.parse(saved) : getSampleLogs().feedLogs;
  });

  const [diaperLogs, setDiaperLogs] = useState<DiaperLog[]>(() => {
    const saved = localStorage.getItem("baby_tracker_diaper_logs");
    return saved ? JSON.parse(saved) : getSampleLogs().diaperLogs;
  });

  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(() => {
    const saved = localStorage.getItem("baby_tracker_sleep_logs");
    return saved ? JSON.parse(saved) : getSampleLogs().sleepLogs;
  });

  const [routines, setRoutines] = useState<ScheduledRoutine[]>(() => {
    const saved = localStorage.getItem("baby_tracker_routines");
    return saved ? JSON.parse(saved) : initialRoutines;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem("baby_tracker_notifications");
    if (saved) return JSON.parse(saved);
    
    // Initial welcome trends notification preloaded
    return [
      {
        id: "notif-welcome",
        timestamp: new Date().toISOString(),
        title: "Welcome to Baby Care Tracker!",
        message: "We preloaded sample newborn data. View feeding increase charts and click 'Generate Pediatric Report' below to see AI insights. Click 'Start Fresh' above to log your baby's actual routines.",
        type: "info",
        read: false
      }
    ];
  });

  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [lastCheckedMinute, setLastCheckedMinute] = useState<string>("");

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("baby_tracker_feed_logs", JSON.stringify(feedLogs));
  }, [feedLogs]);

  useEffect(() => {
    localStorage.setItem("baby_tracker_diaper_logs", JSON.stringify(diaperLogs));
  }, [diaperLogs]);

  useEffect(() => {
    localStorage.setItem("baby_tracker_sleep_logs", JSON.stringify(sleepLogs));
  }, [sleepLogs]);

  useEffect(() => {
    localStorage.setItem("baby_tracker_routines", JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem("baby_tracker_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("baby_tracker_name", babyName);
  }, [babyName]);

  useEffect(() => {
    localStorage.setItem("baby_tracker_birth_date", babyBirthDate);
  }, [babyBirthDate]);

  useEffect(() => {
    if (babyPhoto) {
      localStorage.setItem("baby_tracker_photo", babyPhoto);
    } else {
      localStorage.removeItem("baby_tracker_photo");
    }
  }, [babyPhoto]);

  // Dynamic automatic scheduler checker running every 20 seconds.
  // It checks if current local time matches any enabled care routine and pops an alert
  useEffect(() => {
    const checkScheduleRoutines = () => {
      const now = new Date();
      const currentHr = String(now.getHours()).padStart(2, "0");
      const currentMin = String(now.getMinutes()).padStart(2, "0");
      const currentHmStr = `${currentHr}:${currentMin}`;

      // Prevent triggering multiple times in the same minute
      if (currentHmStr === lastCheckedMinute) return;
      setLastCheckedMinute(currentHmStr);

      routines.forEach((routine) => {
        if (!routine.enabled) return;
        
        // Match condition: exact scheduled time
        if (routine.time === currentHmStr) {
          triggerInAppAlert(
            `Care Reminder: ${routine.name}`,
            `Your scheduled baby ${routine.type} routine is due right now (${routine.time}). ${routine.notes || ""}`,
            "routine"
          );
        }
      });
    };

    const interval = setInterval(checkScheduleRoutines, 20000);
    checkScheduleRoutines(); // initial call
    return () => clearInterval(interval);
  }, [routines, lastCheckedMinute]);

  const triggerInAppAlert = (title: string, message: string, type: "routine" | "trend" | "info") => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title,
      message,
      type,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // HTML5 Audio or visual prompt in title
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: message });
    }
  };

  // Add individual logs
  const handleAddFeed = (feed: Omit<FeedLog, "id">) => {
    const newFeedLog: FeedLog = {
      ...feed,
      id: `feed-${Date.now()}`
    };
    setFeedLogs(prev => [newFeedLog, ...prev]);

    // Check feeding trend comparison whenever user logs new food!
    // Dynamically calculate and emit if feeding increased or decreased
    const currentTrend = calculateWeeklyFeedingTrend([newFeedLog, ...feedLogs]);
    if (Math.abs(currentTrend.percentChange) >= 5 && currentTrend.lastWeekDailyAvg > 0) {
      const icon = currentTrend.percentChange > 0 ? "📈" : "📉";
      triggerInAppAlert(
        "Food Intake Shift Detected!",
        `Weekly food consumption is shifting! Average milk volume changed by ${currentTrend.percentChange}% (${currentTrend.thisWeekDailyAvg} ml vs ${currentTrend.lastWeekDailyAvg} ml last week) ${icon}.`,
        "trend"
      );
    }
  };

  const handleAddDiaper = (diaper: Omit<DiaperLog, "id">) => {
    const newDiaperLog: DiaperLog = {
      ...diaper,
      id: `diaper-${Date.now()}`
    };
    setDiaperLogs(prev => [newDiaperLog, ...prev]);
  };

  const handleAddSleep = (sleep: Omit<SleepLog, "id">) => {
    const newSleepLog: SleepLog = {
      ...sleep,
      id: `sleep-${Date.now()}`
    };
    setSleepLogs(prev => [newSleepLog, ...prev]);
  };

  const handleDeleteLog = (id: string, category: "feed" | "diaper" | "sleep") => {
    if (category === "feed") {
      setFeedLogs(prev => prev.filter(l => l.id !== id));
    } else if (category === "diaper") {
      setDiaperLogs(prev => prev.filter(l => l.id !== id));
    } else if (category === "sleep") {
      setSleepLogs(prev => prev.filter(l => l.id !== id));
    }
  };

  // Routine triggers
  const handleAddRoutine = (routine: Omit<ScheduledRoutine, "id">) => {
    const newRoutine: ScheduledRoutine = {
      ...routine,
      id: `routine-${Date.now()}`
    };
    setRoutines(prev => [...prev, newRoutine].sort((a,b) => a.time.localeCompare(b.time)));
    triggerInAppAlert(
      "Routine Schedule Enabled",
      `Successfully scheduled "${routine.name}" daily for ${routine.time}. Reminders are active.`,
      "info"
    );
  };

  const handleToggleRoutine = (id: string) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleDeleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  };

  const handleResetToFresh = () => {
    if (window.confirm("Would you like to start completely fresh and delete all preloaded sample logs? This will erase all history.")) {
      setFeedLogs([]);
      setDiaperLogs([]);
      setSleepLogs([]);
      setNotifications([
        {
          id: `notif-fresh-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: "Fresh Logger Initiated",
          message: "Empty slate successfully prepared! Record your newborn's feeds, sleeps, and diapers.",
          type: "info",
          read: false
        }
      ]);
      setShowNotificationDrawer(false);
    }
  };

  const handleResetToDemo = () => {
    setFeedLogs(getSampleLogs().feedLogs);
    setDiaperLogs(getSampleLogs().diaperLogs);
    setSleepLogs(getSampleLogs().sleepLogs);
    setRoutines(initialRoutines);
    setNotifications([
      {
        id: `notif-demo-${Date.now()}`,
        timestamp: new Date().toISOString(),
        title: "Seed Sample Data Restored",
        message: "High-fidelity sample logs and charts successfully restored, showcasing growth metrics.",
        type: "info",
        read: false
      }
    ]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getBabyAgeMonths = (dateStr: string) => {
    if (!dateStr) return 3;
    const birth = new Date(dateStr);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (now.getDate() < birth.getDate()) {
      months--;
    }
    if (months < 0) {
      months += 12;
      years--;
    }
    return Math.max(0, years * 12 + months);
  };

  const babyAgeMonths = getBabyAgeMonths(babyBirthDate);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A443F] pb-16 font-sans antialiased selection:bg-[#E9E1D6] selection:text-[#4A443F]">
      
      {/* Upper Navigation Rail */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E9E1D6] px-4 md:px-8 py-4.5 shadow-xs">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7E8C78] text-white flex items-center justify-center shadow-xs">
              <Baby size={20} className="stroke-[2]" />
            </div>
            <div>
              <h1 className="font-serif italic text-2xl text-[#5C6658] font-semibold tracking-tight flex items-center gap-2">
                Nurture & Bloom
              </h1>
              <p className="text-[11px] text-[#A69E94] uppercase tracking-widest font-semibold">Care & Feeding Companion</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Quick clean slates controls */}
            <div className="hidden sm:flex items-center gap-2.5">
              <button
                onClick={handleResetToFresh}
                className="px-4 py-2 rounded-full border border-[#E9E1D6] text-[#4A443F] hover:bg-[#FAF7F2] text-xs font-sans font-semibold transition-all cursor-pointer"
              >
                Start Fresh
              </button>
              <button
                onClick={handleResetToDemo}
                className="px-4 py-2 rounded-full text-white bg-[#7E8C78] hover:bg-[#5C6658] text-xs font-sans font-semibold transition-all cursor-pointer"
              >
                Restore Demo Logs
              </button>
            </div>

            {/* Color Scheme Toggle */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#E9E1D6]/40 text-[#4A443F] transition-all border border-[#E9E1D6] cursor-pointer flex items-center justify-center shadow-xs"
              title={theme === "light" ? "Switch to Dark Theme" : "Switch to Light Theme"}
              id="color-scheme-toggle"
            >
              {theme === "light" ? (
                <Moon size={18} className="text-[#9E86A8]" />
              ) : (
                <Sun size={18} className="text-[#D4A373] animate-pulse-subtle" />
              )}
            </button>

            {/* Notification bell center trigger */}
            <button
              onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
              className="relative p-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#E9E1D6]/40 text-[#4A443F] transition-all border border-[#E9E1D6] cursor-pointer"
              id="bell-icon-trigger"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4A373] text-white text-[10px] font-mono font-bold flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Workspace Grid */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-6">
        
        {/* Central Baby Profile Header */}
        <BabyInfoBanner
          babyName={babyName}
          onChangeName={setBabyName}
          birthDate={babyBirthDate}
          onChangeBirthDate={setBabyBirthDate}
          babyPhoto={babyPhoto}
          onChangePhoto={setBabyPhoto}
        />

        {/* Statistics Metric Cards */}
        <StatsOverview feedLogs={feedLogs} diaperLogs={diaperLogs} sleepLogs={sleepLogs} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Live logger forms and schedule routines (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Log inputs module holding feeding (ml), diapers, bedtime timer */}
            <LogsManager
              feedLogs={feedLogs}
              diaperLogs={diaperLogs}
              sleepLogs={sleepLogs}
              onAddFeed={handleAddFeed}
              onAddDiaper={handleAddDiaper}
              onAddSleep={handleAddSleep}
              onDeleteLog={handleDeleteLog}
            />

            {/* Recharts trend statistics graphs */}
            <ChartsPanel
              feedLogs={feedLogs}
              diaperLogs={diaperLogs}
              sleepLogs={sleepLogs}
            />

          </div>

          {/* Right Column: AI Analysis & Routine Schedules (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Scheduled Routine countdowns list */}
            <RoutineScheduler
              routines={routines}
              onAddRoutine={handleAddRoutine}
              onToggleRoutine={handleToggleRoutine}
              onDeleteRoutine={handleDeleteRoutine}
            />

            {/* AI Pediatric nurse generator */}
            <AISuggestions
              feedLogs={feedLogs}
              diaperLogs={diaperLogs}
              sleepLogs={sleepLogs}
              babyName={babyName}
              babyAgeMonths={babyAgeMonths}
            />

          </div>

        </div>
      </main>

      {/* In-app Notification Drawer Panel popout */}
      <AnimatePresence>
        {showNotificationDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotificationDrawer(false)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-[#FAF7F2] z-50 shadow-2xl border-l border-[#E9E1D6] flex flex-col"
              id="notifications-drawer"
            >
              {/* Drawer Title header */}
              <div className="p-5 border-b border-[#E9E1D6] flex justify-between items-center bg-white">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-[#8B8378]" />
                  <h3 className="font-serif italic font-semibold text-[#4A443F] text-[16px]">Notification Stream</h3>
                  <span className="px-2 py-0.5 font-mono text-xs bg-[#FAF7F2] rounded text-[#4A443F] font-bold border border-[#E9E1D6]">
                    {notifications.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowNotificationDrawer(false)}
                  className="p-1 hover:bg-[#FAF7F2] rounded-full text-[#A69E94] hover:text-[#4A443F] transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Toolbar utility controls */}
              <div className="p-3 bg-white/60 border-b border-[#E9E1D6] flex justify-between text-xs font-sans">
                <button
                  onClick={markAllAsRead}
                  className="text-[#7E8C78] font-semibold hover:text-[#5C6658] cursor-pointer"
                >
                  Mark all read
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="text-[#A69E94] font-semibold hover:text-[#4A443F] cursor-pointer"
                >
                  Clear all history
                </button>
              </div>

              {/* Notification Scroller List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-20 text-[#A69E94]">
                    <span className="text-4xl">🔔</span>
                    <p className="text-xs font-sans font-medium mt-3">No notifications received.</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isRoutine = notif.type === "routine";
                    const isTrend = notif.type === "trend";

                    return (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-2xl border transition-all text-xs leading-relaxed flex items-start gap-3.5 relative ${
                          notif.read ? "bg-white border-[#FAF7F2] text-[#A69E94]" : "bg-white border-[#E9E1D6] text-[#4A443F]"
                        }`}
                      >
                        <div className={`p-2 rounded-full ${
                          isRoutine
                            ? "bg-[#FAF7F2] text-[#D4A373] border border-[#E9E1D6]"
                            : isTrend
                            ? "bg-[#FAF7F2] text-[#7E8C78] border border-[#E9E1D6]"
                            : "bg-[#FAF7F2] text-[#9E86A8] border border-[#E9E1D6]"
                        }`}>
                          {isRoutine ? <Clock size={14} /> : isTrend ? <TrendingUp size={14} /> : <Info size={14} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`font-serif italic font-bold text-[#4A443F] text-sm ${notif.read ? "opacity-60" : ""}`}>
                              {notif.title}
                            </h4>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-[#D4A373] absolute top-3 right-3" />
                            )}
                          </div>
                          <p className={`mt-1 text-xs leading-relaxed ${notif.read ? "text-[#A69E94]" : "text-[#4A443F]"}`}>{notif.message}</p>
                          <span className="block text-[10px] text-[#A69E94] font-mono mt-2">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick Access Mobile Slates Footer Control Block */}
      <footer className="w-full text-center mt-12 py-6 border-t border-[#E9E1D6] text-[11px] text-[#A69E94] font-sans tracking-wide bg-white/40">
        <div className="w-full max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Nurture & Bloom — Natural care tracker designed with active reminder modules.</span>
          <div className="flex gap-2 sm:hidden">
            <button onClick={handleResetToFresh} className="text-[#D4A373] font-bold">Start Fresh</button>
            <span>•</span>
            <button onClick={handleResetToDemo} className="text-[#7E8C78] font-bold">Restore Demo</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
