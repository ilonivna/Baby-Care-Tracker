import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Plus, BellRing, BellOff, Trash2 } from "lucide-react";
import { ScheduledRoutine, RoutineType } from "../types";

interface RoutineSchedulerProps {
  routines: ScheduledRoutine[];
  onAddRoutine: (routine: Omit<ScheduledRoutine, "id">) => void;
  onToggleRoutine: (id: string) => void;
  onDeleteRoutine: (id: string) => void;
}

export default function RoutineScheduler({
  routines,
  onAddRoutine,
  onToggleRoutine,
  onDeleteRoutine,
}: RoutineSchedulerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<RoutineType>("feed");
  const [time, setTime] = useState("12:00");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddRoutine({
      name,
      type,
      time,
      enabled: true,
      notes: notes || undefined
    });
    setName("");
    setNotes("");
    setShowAddForm(false);
  };

  /**
   * Calculates dynamic countdown description for a daily scheduled time (e.g. "14:30")
   */
  const getCountdownString = (timeStr: string, isEnabled: boolean) => {
    if (!isEnabled) return "Notifications Disabled";

    const [hours, minutes] = timeStr.split(":").map(Number);
    const now = new Date();
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);

    // If target time has already passed today, scheduled for tomorrow
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const diffMs = target.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `✦ Due in ${diffMins} mins`;
    } else {
      const diffHrs = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;
      return `✦ Due in ${diffHrs}h ${remainingMins}m`;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#F0EBE3] shadow-sm p-6" id="routine-scheduler">
      <div className="flex justify-between items-center mb-5">
        <div className="flex gap-3 md:items-center">
          <span className="p-3.5 rounded-full bg-[#FAF7F2] border border-[#E9E1D6] text-[#7E8C78] block h-fit">
            <Clock size={18} />
          </span>
          <div>
            <h2 className="font-serif italic font-bold text-[#4A443F] text-base">
              Scheduled Care Routines
            </h2>
            <p className="text-[#A69E94] text-xs mt-0.5">Automatic alert reminders trigger when scheduled events are near.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4.5 py-2.5 bg-[#7E8C78] hover:bg-[#5C6658] text-white font-serif italic font-semibold text-xs rounded-full transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} />
          {showAddForm ? "Cancel" : "Add Routine"}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="p-5 border border-[#E9E1D6] rounded-2xl bg-[#DEFAULT_BG] bg-[#FAF7F2]/40 mb-5 space-y-3 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#7E8C78] font-sans mb-1.5">
                  Routine Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midday Nap, Evening Feed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#E9E1D6] focus:border-[#7E8C78] rounded-xl px-3.5 py-2 text-sm text-[#4A443F] outline-hidden transition-all"
                  required
                />
              </div>

              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-[#7E8C78] font-sans mb-1.5">
                      Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as RoutineType)}
                      className="w-full bg-white border border-[#E9E1D6] rounded-xl px-2.5 py-2 text-sm text-[#4A443F] outline-hidden"
                    >
                      <option value="feed">🥛 Feeding</option>
                      <option value="sleep">🛌 Sleep</option>
                      <option value="diaper">👶 Diaper</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-[#7E8C78] font-sans mb-1.5">
                      Time Daily
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-white border border-[#E9E1D6] rounded-xl px-2.5 py-1.5 text-sm font-mono text-[#4A443F] outline-hidden"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#7E8C78] font-sans mb-1.5">
                Instruction / Target (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 120ml Breastmilk"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-[#E9E1D6] focus:border-[#7E8C78] rounded-xl px-3.5 py-2 text-sm text-[#4A443F] outline-hidden transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#7E8C78] hover:bg-[#5C6658] text-white font-serif font-bold text-xs rounded-full shadow-sm transition-all cursor-pointer italic"
            >
              Add Schedule Routine
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {routines.map((routine) => (
          <div
            key={routine.id}
            className={`p-3.5 rounded-3xl border flex items-center justify-between transition-all bg-white border-[#F0EBE3] hover:bg-[#FAF7F2]/40 ${
              routine.enabled ? "" : "opacity-60"
            }`}
          >
            <div className="flex gap-3.5">
              <button
                onClick={() => onToggleRoutine(routine.id)}
                className={`p-2 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                  routine.enabled
                    ? "bg-[#FAF7F2] border-[#E9E1D6] text-[#7E8C78] hover:bg-[#7E8C78]/10"
                    : "bg-white/50 border-[#F0EBE3] text-stone-300"
                }`}
                title={routine.enabled ? "Mute reminders" : "Enable reminders"}
              >
                {routine.enabled ? <BellRing size={16} /> : <BellOff size={16} />}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#4A443F] text-xs bg-[#FAF7F2] px-2 py-0.5 rounded-lg border border-[#E9E1D6]">
                    {routine.time}
                  </span>
                  <span className={`font-sans font-semibold text-sm ${routine.enabled ? "text-[#4A443F]" : "text-[#A69E94] line-through"}`}>
                    {routine.name}
                  </span>
                </div>
                <div className="flex gap-2.5 items-center mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A69E94]">
                    {routine.type === "feed" ? "🥛 FEEDING" : routine.type === "sleep" ? "🛌 SLEEP CYCLE" : "💩 DIAPER FRESH"}
                  </span>
                  <span className="text-[3px] text-gray-300">•</span>
                  <span className={`text-[11px] font-mono font-semibold ${routine.enabled ? "text-[#7E8C78]" : "text-[#A69E94]"}`}>
                    {getCountdownString(routine.time, routine.enabled)}
                  </span>
                </div>
                {routine.notes && (
                  <p className="text-xs text-[#A69E94] italic mt-1 font-sans">
                    Notes: {routine.notes}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => onDeleteRoutine(routine.id)}
              className="p-2 hover:bg-[#FAF7F2] rounded-full text-[#A69E94] hover:text-red-500 transition-all cursor-pointer border border-transparent hover:border-[#E9E1D6]"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
