import { motion } from "motion/react";
import { Baby, Moon, CircleAlert, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { FeedLog, DiaperLog, SleepLog } from "../types";
import { calculateWeeklyFeedingTrend } from "../utils/analytics";

interface StatsOverviewProps {
  feedLogs: FeedLog[];
  diaperLogs: DiaperLog[];
  sleepLogs: SleepLog[];
}

export default function StatsOverview({ feedLogs, diaperLogs, sleepLogs }: StatsOverviewProps) {
  // Compute today's values
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const feedsToday = feedLogs.filter(
    (log) => new Date(log.timestamp).getTime() >= startOfToday.getTime()
  );
  const totalVolumeToday = feedsToday.reduce((sum, log) => sum + log.amount, 0);

  const diapersToday = diaperLogs.filter(
    (log) => new Date(log.timestamp).getTime() >= startOfToday.getTime()
  );
  
  const sleepsToday = sleepLogs.filter(
    (log) => new Date(log.startTime).getTime() >= startOfToday.getTime()
  );
  const totalSleepTodayMs = sleepsToday.reduce((sum, log) => {
    const end = new Date(log.endTime).getTime();
    const start = new Date(log.startTime).getTime();
    return sum + (end - start);
  }, 0);
  const totalSleepTodayHrs = (totalSleepTodayMs / (1000 * 60 * 60)).toFixed(1);

  // Compute stats trends
  const trend = calculateWeeklyFeedingTrend(feedLogs);
  const isIncrease = trend.percentChange >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Dynamic Consumption Trend Alert Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-1 md:col-span-4 bg-[#F2EDE4] border border-[#E9E1D6] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        id="weekly-trend-banner"
      >
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-full bg-[#7E8C78]/10 text-[#7E8C78] border border-[#7E8C78]/20">
            {isIncrease ? <TrendingUp size={22} className="animate-pulse" /> : <TrendingDown size={22} />}
          </div>
          <div>
            <h3 className="font-serif italic font-semibold text-[#5C6658] text-lg">
              Weekly Feeding Consumption Report
            </h3>
            <p className="text-[#4A443F] text-sm mt-1 max-w-2xl leading-relaxed">
              Based on the logs, baby's average daily food consumption this week is{" "}
              <span className="font-mono font-bold text-[#4A443F] bg-white px-2 py-0.5 rounded-md border border-[#E9E1D6]">{trend.thisWeekDailyAvg} ml</span>. 
              {trend.lastWeekDailyAvg > 0 ? (
                <>
                  {" "}That is a{" "}
                  <span className={`font-semibold ${isIncrease ? "text-[#7E8C78]" : "text-[#D4A373]"}`}>
                    {isIncrease ? "increase" : "decrease"} of {Math.abs(trend.percentChange)}%
                  </span>{" "}
                  compared to last week's average of <span className="font-mono text-[#4A443F] font-semibold">{trend.lastWeekDailyAvg} ml/day</span>.
                </>
              ) : (
                " Solid logging behavior discovered! Chart comparisons will become dynamic as historical logs accrue."
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`text-xs font-semibold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 border ${
            isIncrease ? "bg-white border-[#E9E1D6] text-[#7E8C78]" : "bg-white border-[#E9E1D6] text-[#D4A373]"
          }`}>
            {isIncrease ? "Steady Growth" : "Intake Shifted"}
          </span>
        </div>
      </motion.div>

      {/* Feeding Overview Card */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white rounded-3xl border border-[#F0EBE3] p-6 shadow-sm flex flex-col justify-between"
        id="metric-card-feed"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#A69E94]">
              Food Consumed Today
            </span>
            <div className="text-4xl font-light text-[#7E8C78] mt-3 font-serif italic">
              {totalVolumeToday}<span className="text-sm ml-1 uppercase text-[#A69E94] font-sans font-medium">ml</span>
            </div>
          </div>
          <div className="p-3 bg-[#FAF7F2] text-[#7E8C78] rounded-full border border-[#E9E1D6]">
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="text-xs text-[#A69E94] border-t border-[#FAF7F2] pt-4 mt-5 flex justify-between items-center">
          <span>{feedsToday.length} feeding sessions</span>
          <span className="font-mono text-[#7E8C78] font-bold bg-[#FAF7F2] border border-[#E9E1D6] px-2 py-0.5 rounded-md">Today</span>
        </div>
      </motion.div>

      {/* Sleep Overview Card */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white rounded-3xl border border-[#F0EBE3] p-6 shadow-sm flex flex-col justify-between"
        id="metric-card-sleep"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#A69E94]">
              Slept Today
            </span>
            <div className="text-4xl font-light text-[#9E86A8] mt-3 font-serif italic">
              {totalSleepTodayHrs}<span className="text-sm ml-1 uppercase text-[#A69E94] font-sans font-medium">hrs</span>
            </div>
          </div>
          <div className="p-3 bg-[#FAF7F2] text-[#9E86A8] rounded-full border border-[#E9E1D6]">
            <Moon size={20} />
          </div>
        </div>
        <div className="text-xs text-[#A69E94] border-t border-[#FAF7F2] pt-4 mt-5 flex justify-between items-center">
          <span>{sleepsToday.length} sleep intervals</span>
          <span className="font-mono text-[#9E86A8] font-bold bg-[#FAF7F2] border border-[#E9E1D6] px-2 py-0.5 rounded-md">Today</span>
        </div>
      </motion.div>

      {/* Diaper Overview Card */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white rounded-3xl border border-[#F0EBE3] p-6 shadow-sm flex flex-col justify-between"
        id="metric-card-diaper"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#A69E94]">
              Diaper Changes
            </span>
            <div className="text-4xl font-light text-[#D4A373] mt-3 font-serif italic">
              {diapersToday.length}<span className="text-sm ml-1 uppercase text-[#A69E94] font-sans font-medium">times</span>
            </div>
          </div>
          <div className="p-3 bg-[#FAF7F2] text-[#D4A373] rounded-full border border-[#E9E1D6]">
            <RefreshCw size={20} />
          </div>
        </div>
        <div className="text-xs text-[#A69E94] border-t border-[#FAF7F2] pt-4 mt-5 flex justify-between items-center">
          <span className="space-x-1.5 flex items-center">
            <span className="text-[#D4A373] font-semibold">Wet: {diapersToday.filter(d => d.status === 'wet' || d.status === 'mixed').length}</span>
            <span className="text-[#E9E1D6]">•</span>
            <span className="text-[#4A443F] font-semibold">Dirty: {diapersToday.filter(d => d.status === 'dirty' || d.status === 'mixed').length}</span>
          </span>
          <span className="font-mono text-[#D4A373] font-bold bg-[#FAF7F2] border border-[#E9E1D6] px-2 py-0.5 rounded-md">Today</span>
        </div>
      </motion.div>

      {/* Logs Telemetry Insight */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white rounded-3xl border border-[#F0EBE3] p-6 shadow-sm flex flex-col justify-between"
        id="metric-card-insights"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#A69E94]">
              Routines Complete
            </span>
            <div className="text-4xl font-light text-[#5C6658] mt-3 font-serif italic">
              {Math.min(100, Math.round(((feedsToday.length + diapersToday.length) / 8) * 100))}%
            </div>
          </div>
          <div className="p-3 bg-[#FAF7F2] text-[#7E8C78] rounded-full border border-[#E9E1D6]">
            <Baby size={20} />
          </div>
        </div>
        <div className="text-xs text-[#A69E94] border-t border-[#FAF7F2] pt-4 mt-5 flex justify-between items-center">
          <span>Rhythm Tracker</span>
          <span className="font-mono text-[#7E8C78] font-bold bg-[#FAF7F2] border border-[#E9E1D6] px-2 py-0.5 rounded-md">Healthy</span>
        </div>
      </motion.div>
    </div>
  );
}
