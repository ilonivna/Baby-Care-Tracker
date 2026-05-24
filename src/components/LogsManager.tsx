import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Clock, Milk, Baby, Moon, ShieldAlert, Timer, Play, Compass } from "lucide-react";
import { FeedLog, DiaperLog, SleepLog, FoodType, DiaperStatus } from "../types";

interface LogsManagerProps {
  feedLogs: FeedLog[];
  diaperLogs: DiaperLog[];
  sleepLogs: SleepLog[];
  onAddFeed: (feed: Omit<FeedLog, "id">) => void;
  onAddDiaper: (diaper: Omit<DiaperLog, "id">) => void;
  onAddSleep: (sleep: Omit<SleepLog, "id">) => void;
  onDeleteLog: (id: string, category: "feed" | "diaper" | "sleep") => void;
}

export default function LogsManager({
  feedLogs,
  diaperLogs,
  sleepLogs,
  onAddFeed,
  onAddDiaper,
  onAddSleep,
  onDeleteLog,
}: LogsManagerProps) {
  const [activeTab, setActiveTab] = useState<"feed" | "diaper" | "sleep" | "list">("feed");

  // Feeding Form States
  const [feedAmount, setFeedAmount] = useState<number>(90);
  const [feedType, setFeedType] = useState<FoodType>("breastmilk");
  const [feedNotes, setFeedNotes] = useState("");
  const [feedTime, setFeedTime] = useState(new Date().toISOString().substring(0, 16));

  // Diaper Form States
  const [diaperStatus, setDiaperStatus] = useState<DiaperStatus>("wet");
  const [diaperNotes, setDiaperNotes] = useState("");
  const [diaperTime, setDiaperTime] = useState(new Date().toISOString().substring(0, 16));

  // Sleep Form States
  const [sleepStart, setSleepStart] = useState(new Date(Date.now() - 3600000).toISOString().substring(0, 16)); // default 1 hour ago
  const [sleepEnd, setSleepEnd] = useState(new Date().toISOString().substring(0, 16));
  const [sleepNotes, setSleepNotes] = useState("");

  // Live Sleep Timer States
  const [timerActive, setTimerActive] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timerStartTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - timerStartTime) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerStartTime]);

  const handleStartSleepTimer = () => {
    setTimerStartTime(Date.now());
    setTimerActive(true);
  };

  const handleStopAndLogSleep = () => {
    if (!timerStartTime) return;
    const nowStr = new Date().toISOString();
    const startStr = new Date(timerStartTime).toISOString();
    onAddSleep({
      startTime: startStr,
      endTime: nowStr,
      notes: "Logged via live bedtime assistant timer"
    });
    setTimerActive(false);
    setTimerStartTime(null);
    setActiveTab("list");
  };

  const submitFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedAmount <= 0) return;
    onAddFeed({
      timestamp: new Date(feedTime).toISOString(),
      amount: Number(feedAmount),
      type: feedType,
      notes: feedNotes || undefined
    });
    setFeedNotes("");
    setActiveTab("list");
  };

  const submitDiaper = (e: React.FormEvent) => {
    e.preventDefault();
    onAddDiaper({
      timestamp: new Date(diaperTime).toISOString(),
      status: diaperStatus,
      notes: diaperNotes || undefined
    });
    setDiaperNotes("");
    setActiveTab("list");
  };

  const submitSleep = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(sleepEnd).getTime() <= new Date(sleepStart).getTime()) {
      alert("Wake up date cannot be earlier than sleep start date.");
      return;
    }
    onAddSleep({
      startTime: new Date(sleepStart).toISOString(),
      endTime: new Date(sleepEnd).toISOString(),
      notes: sleepNotes || undefined
    });
    setSleepNotes("");
    setActiveTab("list");
  };

  const formatHrsMins = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Compile combined logs sorted by date descending for lists
  const allLogsSorted = [
    ...feedLogs.map(l => ({ ...l, logType: "feed" as const })),
    ...diaperLogs.map(l => ({ ...l, logType: "diaper" as const })),
    ...sleepLogs.map(l => ({ ...l, logType: "sleep" as const, timestamp: l.startTime })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="bg-white rounded-3xl border border-[#F0EBE3] shadow-sm overflow-hidden" id="logs-manager-panel">
      {/* Category Tabs */}
      <div className="flex bg-[#FAF7F2] p-2 border-b border-[#E9E1D6] gap-1">
        <button
          onClick={() => { setActiveTab("feed"); setFeedTime(new Date().toISOString().substring(0, 16)); }}
          className={`flex-1 py-3 text-sm font-sans font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "feed" ? "bg-white text-[#7E8C78] shadow-xs border border-[#E9E1D6]" : "text-[#A69E94] hover:text-[#4A443F]"
          }`}
        >
          <Milk size={16} />
          Feeding
        </button>
        <button
          onClick={() => { setActiveTab("diaper"); setDiaperTime(new Date().toISOString().substring(0, 16)); }}
          className={`flex-1 py-3 text-sm font-sans font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "diaper" ? "bg-white text-[#D4A373] shadow-xs border border-[#E9E1D6]" : "text-[#A69E94] hover:text-[#4A443F]"
          }`}
        >
          <Baby size={16} />
          Diapers
        </button>
        <button
          onClick={() => { setActiveTab("sleep"); setSleepEnd(new Date().toISOString().substring(0, 16)); }}
          className={`flex-1 py-3 text-sm font-sans font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "sleep" ? "bg-white text-[#9E86A8] shadow-xs border border-[#E9E1D6]" : "text-[#A69E94] hover:text-[#4A443F]"
          }`}
        >
          <Moon size={16} />
          Sleep
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 py-3 text-sm font-sans font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "list" ? "bg-white text-[#5C6658] shadow-xs border border-[#E9E1D6]" : "text-[#A69E94] hover:text-[#4A443F]"
          }`}
        >
          <Compass size={16} />
          Journal ({allLogsSorted.length})
        </button>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* FEED TAB */}
          {activeTab === "feed" && (
            <motion.form
              key="feed-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={submitFeed}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-[#A69E94] font-sans mb-2">
                  Amount Eaten (ml)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={feedAmount}
                    onChange={(e) => setFeedAmount(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#E9E1D6] focus:border-[#7E8C78] focus:bg-white rounded-2xl px-4 py-3.5 text-lg font-mono font-bold text-[#4A443F] transition-all outline-hidden"
                    required
                    min={1}
                    max={1000}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A69E94] font-semibold font-mono">ml</span>
                </div>
                {/* Visual Quick Presets for Easy Tapping */}
                <div className="flex gap-2 flex-wrap mt-2.5">
                  {[30, 60, 90, 120, 150, 180, 240].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFeedAmount(preset)}
                      className="px-3 py-1 text-xs font-mono font-bold text-[#7E8C78] bg-[#FAF7F2] hover:bg-[#E9E1D6]/50 rounded-full border border-[#E9E1D6] cursor-pointer"
                    >
                      {preset}ml
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-[#A69E94] font-sans mb-2">
                    Food Type
                  </label>
                  <select
                    value={feedType}
                    onChange={(e) => setFeedType(e.target.value as FoodType)}
                    className="w-full bg-[#FAF7F2] border border-[#E9E1D6] hover:border-[#A69E94] focus:bg-white rounded-2xl px-4 py-3 text-sm text-[#4A443F] outline-hidden transition-all cursor-pointer font-medium"
                  >
                    <option value="breastmilk">Breastmilk 🍼</option>
                    <option value="formula">Formula 🍼</option>
                    <option value="solids">Baby Solids 🫛</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-[#A69E94] font-sans mb-2">
                    Log Timestamp
                  </label>
                  <input
                    type="datetime-local"
                    value={feedTime}
                    onChange={(e) => setFeedTime(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E9E1D6] focus:bg-white rounded-2xl px-4 py-2.5 font-mono text-xs text-[#4A443F] outline-hidden transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-[#A69E94] font-sans mb-2">
                  Session Notes (Optional)
                </label>
                <textarea
                  placeholder="e.g. Fed perfectly well, didn't spit up"
                  value={feedNotes}
                  onChange={(e) => setFeedNotes(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E9E1D6] focus:bg-white rounded-2xl px-4 py-3 placeholder-[#A69E94]/70 text-sm text-[#4A443F] transition-all outline-hidden resize-none h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#7E8C78] hover:bg-[#5C6658] text-white font-serif italic text-base font-semibold rounded-full transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={18} />
                Save Feeding Log
              </button>
            </motion.form>
          )}

          {/* DIAPER TAB */}
          {activeTab === "diaper" && (
            <motion.form
              key="diaper-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={submitDiaper}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-[#A69E94] font-sans mb-3">
                  Diaper Wetness & Soiling Status
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {(["wet", "dirty", "mixed", "dry"] as DiaperStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setDiaperStatus(status)}
                      className={`py-4 rounded-2xl border font-sans font-semibold text-sm transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        diaperStatus === status
                          ? "bg-[#FAF7F2] shadow-xs border-[#D4A373] text-[#D4A373] font-bold"
                          : "bg-white border-[#E9E1D6] text-[#A69E94] hover:bg-[#FAF7F2]"
                      }`}
                    >
                      <span className="text-xl">
                        {status === "wet" ? "💧" : status === "dirty" ? "💩" : status === "mixed" ? "💧💩" : "🛡️"}
                      </span>
                      <span className="capitalize text-xs">{status}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-[#A69E94] font-sans mb-2">
                    Timestamp of Change
                  </label>
                  <input
                    type="datetime-local"
                    value={diaperTime}
                    onChange={(e) => setDiaperTime(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E9E1D6] focus:bg-white rounded-2xl px-4 py-3 font-mono text-sm text-[#4A443F] outline-hidden transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-[#A69E94] font-sans mb-2">
                  Diaper Notes (Optional)
                </label>
                <textarea
                  placeholder="e.g. Mild redness, applied nappy cream"
                  value={diaperNotes}
                  onChange={(e) => setDiaperNotes(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E9E1D6] focus:bg-white rounded-2xl px-4 py-3 placeholder-[#A69E94]/70 text-sm text-[#4A443F] transition-all outline-hidden resize-none h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#D4A373] hover:bg-[#b08051] text-white font-serif italic text-base font-semibold rounded-full transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={18} />
                Save Diaper Log
              </button>
            </motion.form>
          )}

          {/* SLEEP TAB */}
          {activeTab === "sleep" && (
            <motion.div
              key="sleep-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              {/* Bedtime Stop Watch Widget for Instant Tracking */}
              <div className="p-5 rounded-3xl bg-[#F2EDE4] border border-[#E9E1D6] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`p-4 rounded-full border border-[#E9E1D6] text-[#9E86A8] ${timerActive ? "bg-white animate-pulse" : "bg-white"}`}>
                    <Timer size={22} />
                  </div>
                  <div>
                    <h4 className="font-serif italic font-semibold text-[#4A443F] text-sm">Real-time Bedtime Assistant</h4>
                    <p className="text-[#A69E94] text-xs mt-0.5 leading-relaxed">
                      {timerActive ? "Recording sleep duration active..." : "Put baby to sleep now and compute timing automatically."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {timerActive ? (
                    <div className="flex items-center gap-3 w-full justify-between sm:justify-end">
                      <div className="font-mono font-bold text-[#9E86A8] tracking-tight bg-white border border-[#E9E1D6] px-3.5 py-1.5 rounded-xl text-xs">
                        {formatHrsMins(elapsedSeconds)}
                      </div>
                      <button
                        type="button"
                        onClick={handleStopAndLogSleep}
                        className="px-5 py-2.5 bg-[#9E86A8] hover:bg-[#856c8f] text-white text-xs font-sans font-bold rounded-full shadow-xs transition-all cursor-pointer"
                      >
                        Wake Up & Log
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartSleepTimer}
                      className="w-full md:w-auto px-5 py-2.5 bg-white hover:bg-[#FAF7F2] text-[#9E86A8] text-xs font-sans font-bold rounded-full border border-[#E9E1D6] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play size={14} />
                      Start Sleep Timer
                    </button>
                  )}
                </div>
              </div>

              {/* Manual Entry Form */}
              <form onSubmit={submitSleep} className="space-y-4 pt-1">
                <div className="text-xs uppercase tracking-widest font-bold text-[#A69E94] font-sans border-b border-[#E9E1D6] pb-2">
                  Or Log Manually
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-[#A69E94] font-sans mb-2">
                      Sleep Start
                    </label>
                    <input
                      type="datetime-local"
                      value={sleepStart}
                      onChange={(e) => setSleepStart(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E9E1D6] focus:bg-white rounded-2xl px-4 py-2.5 font-mono text-xs text-[#4A443F] outline-hidden transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-[#A69E94] font-sans mb-2">
                      Baby Woke Up
                    </label>
                    <input
                      type="datetime-local"
                      value={sleepEnd}
                      onChange={(e) => setSleepEnd(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E9E1D6] focus:bg-white rounded-2xl px-4 py-2.5 font-mono text-xs text-[#4A443F] outline-hidden transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-[#A69E94] font-sans mb-2">
                    Sleep Notes (Optional)
                  </label>
                  <textarea
                    placeholder="e.g. Dreamy sleep, woke up smiling"
                    value={sleepNotes}
                    onChange={(e) => setSleepNotes(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E9E1D6] focus:bg-white rounded-2xl px-4 py-3 placeholder-[#A69E94]/70 text-sm text-[#4A443F] transition-all outline-hidden resize-none h-20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#9E86A8] hover:bg-[#856c8f] text-white font-serif italic text-base font-semibold rounded-full transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={18} />
                  Save Sleep Duration
                </button>
              </form>
            </motion.div>
          )}

          {/* HISTORY LOGS LIST */}
          {activeTab === "list" && (
            <motion.div
              key="history-list"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#E9E1D6]">
                <span className="text-xs uppercase tracking-widest font-bold text-[#A69E94] font-sans">
                  Continuous Journal Entries
                </span>
                <span className="text-xs text-[#A69E94] font-mono">{allLogsSorted.length} items logged</span>
              </div>

              {allLogsSorted.length === 0 ? (
                <div className="text-center py-10">
                  <span className="text-3xl">📭</span>
                  <p className="text-[#A69E94] text-sm mt-2 font-serif italic">No baby logs logged yet. Feed details will appear here once saved.</p>
                </div>
              ) : (
                <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1.5" id="history-scrollable">
                  {allLogsSorted.map((log) => {
                    const date = new Date(log.timestamp);
                    const isFeed = log.logType === "feed";
                    const isDiaper = log.logType === "diaper";
                    const isSleep = log.logType === "sleep";

                    return (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-3xl border border-[#F0EBE3] bg-white flex justify-between items-center transition-all hover:bg-[#FAF7F2]/40"
                      >
                        <div className="flex gap-3.5">
                          <div className={`p-2.5 rounded-full border h-fit flex items-center justify-center ${
                            isFeed
                              ? "bg-[#FAF7F2] border-[#E9E1D6] text-[#7E8C78]"
                              : isDiaper
                              ? "bg-[#FAF7F2] border-[#E9E1D6] text-[#D4A373]"
                              : "bg-[#FAF7F2] border-[#E9E1D6] text-[#9E86A8]"
                          }`}>
                            {isFeed ? <Milk size={18} /> : isDiaper ? <Baby size={18} /> : <Moon size={18} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {isFeed && (
                                <span className="font-sans font-medium text-[#4A443F] text-sm md:text-[14px]">
                                  Feeding Log: <span className="font-mono text-[#7E8C78] font-bold">{log.amount}ml</span> <span className="text-[#A69E94] text-xs">({log.type})</span>
                                </span>
                              )}
                              {isDiaper && (
                                <span className="font-sans font-medium text-[#4A443F] text-sm md:text-[14px]">
                                  Diaper Status: <span className="text-[#D4A373] font-bold capitalize">{log.status}</span>
                                </span>
                              )}
                              {isSleep && (
                                <span className="font-sans font-medium text-[#4A443F] text-sm md:text-[14px]">
                                  Slept for:{" "}
                                  <span className="font-mono text-[#9E86A8] font-bold">
                                    {/* Duration Calculation */}
                                    {((new Date((log as any).endTime).getTime() - new Date((log as any).startTime).getTime()) / (1000 * 60 * 60)).toFixed(1)} hrs
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#A69E94] font-mono mt-0.5 flex flex-wrap gap-x-2">
                              <span>
                                {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isSleep && (
                                <span className="text-[#A69E94]/85">
                                  ({new Date((log as any).startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date((log as any).endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                </span>
                              )}
                            </div>
                            {log.notes && (
                              <p className="text-xs text-[#4A443F]/80 mt-1 italic font-sans">
                                Notes: "{log.notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteLog(log.id, log.logType)}
                          className="p-2 hover:bg-[#FAF7F2] rounded-full text-[#A69E94] hover:text-red-500 transition-all cursor-pointer border border-transparent hover:border-[#E9E1D6]"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
