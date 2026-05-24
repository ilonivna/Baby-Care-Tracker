import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line } from "recharts";
import { BarChart3, TrendingUp, RefreshCw, Moon } from "lucide-react";
import { FeedLog, DiaperLog, SleepLog } from "../types";

interface ChartsPanelProps {
  feedLogs: FeedLog[];
  diaperLogs: DiaperLog[];
  sleepLogs: SleepLog[];
}

export default function ChartsPanel({ feedLogs, diaperLogs, sleepLogs }: ChartsPanelProps) {
  const [chartMode, setChartMode] = useState<"milk" | "sleep" | "diapers">("milk");

  // Compile last 7 days metrics
  const getLast7DaysData = () => {
    const data = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dateVal = String(d.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${dateVal}`; // YYYY-MM-DD local

      const dayStr = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });

      // Feeds total
      const dayFeeds = feedLogs.filter((log) => {
        const logDate = new Date(log.timestamp);
        const lYear = logDate.getFullYear();
        const lMonth = String(logDate.getMonth() + 1).padStart(2, "0");
        const lDate = String(logDate.getDate()).padStart(2, "0");
        return `${lYear}-${lMonth}-${lDate}` === dateKey;
      });
      const milkMl = dayFeeds.reduce((sum, log) => sum + log.amount, 0);

      // Diapers Count
      const dayDiapers = diaperLogs.filter((log) => {
        const logDate = new Date(log.timestamp);
        const lYear = logDate.getFullYear();
        const lMonth = String(logDate.getMonth() + 1).padStart(2, "0");
        const lDate = String(logDate.getDate()).padStart(2, "0");
        return `${lYear}-${lMonth}-${lDate}` === dateKey;
      });
      const wetCount = dayDiapers.filter((log) => log.status === "wet" || log.status === "mixed").length;
      const dirtyCount = dayDiapers.filter((log) => log.status === "dirty" || log.status === "mixed").length;

      // Sleep Duration
      const daySleeps = sleepLogs.filter((log) => {
        const logDate = new Date(log.startTime);
        const lYear = logDate.getFullYear();
        const lMonth = String(logDate.getMonth() + 1).padStart(2, "0");
        const lDate = String(logDate.getDate()).padStart(2, "0");
        return `${lYear}-${lMonth}-${lDate}` === dateKey;
      });
      const sleepMs = daySleeps.reduce((sum, log) => {
        const start = new Date(log.startTime).getTime();
        const end = new Date(log.endTime).getTime();
        return sum + (end - start);
      }, 0);
      const sleepHours = Number((sleepMs / (1000 * 60 * 60)).toFixed(1));

      data.push({
        date: dayStr,
        "Milk Intake": milkMl,
        "Wet Changes": wetCount,
        "Dirty Changes": dirtyCount,
        "Sleep Hours": sleepHours,
      });
    }
    return data;
  };

  const chartData = getLast7DaysData();

  return (
    <div className="bg-white rounded-3xl border border-[#F0EBE3] shadow-sm p-6" id="charts-panel">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-3 md:items-center">
          <span className="p-3.5 rounded-full bg-[#FAF7F2] border border-[#E9E1D6] text-[#7E8C78] block h-fit">
            <BarChart3 size={18} />
          </span>
          <div>
            <h2 className="font-serif italic font-bold text-[#4A443F] text-base">
              Care Insights & Historical Trends
            </h2>
            <p className="text-[#A69E94] text-xs mt-0.5">Daily variations in feeding volumes, diaper frequencies, and sleep blocks.</p>
          </div>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-[#FAF7F2] p-1 rounded-2xl self-start sm:self-auto border border-[#E9E1D6] gap-0.5">
          <button
            onClick={() => setChartMode("milk")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer flex items-center gap-1 ${
              chartMode === "milk" ? "bg-white text-[#7E8C78] shadow-xs" : "text-[#A69E94] hover:text-[#4A443F]"
            }`}
          >
            <TrendingUp size={12} />
            Feeds (ml)
          </button>
          <button
            onClick={() => setChartMode("sleep")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer flex items-center gap-1 ${
              chartMode === "sleep" ? "bg-white text-[#9E86A8] shadow-xs" : "text-[#A69E94] hover:text-[#4A443F]"
            }`}
          >
            <Moon size={12} />
            Sleep (hrs)
          </button>
          <button
            onClick={() => setChartMode("diapers")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer flex items-center gap-1 ${
              chartMode === "diapers" ? "bg-white text-[#D4A373] shadow-xs" : "text-[#A69E94] hover:text-[#4A443F]"
            }`}
          >
            <RefreshCw size={12} />
            Diapers
          </button>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === "milk" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMilk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7E8C78" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7E8C78" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FAF7F2" />
              <XAxis dataKey="date" stroke="#A69E94" fontSize={11} tickLine={false} />
              <YAxis stroke="#A69E94" fontSize={11} tickLine={false} axisLine={false} unit="ml" />
              <Tooltip
                contentStyle={{ background: "#FAF7F2", border: "1px solid #E9E1D6", borderRadius: "16px", color: "#4A443F", fontFamily: "sans-serif" }}
                itemStyle={{ color: "#7E8C78" }}
              />
              <Area type="monotone" dataKey="Milk Intake" stroke="#7E8C78" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMilk)" />
            </AreaChart>
          ) : chartMode === "sleep" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9E86A8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#9E86A8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FAF7F2" />
              <XAxis dataKey="date" stroke="#A69E94" fontSize={11} tickLine={false} />
              <YAxis stroke="#A69E94" fontSize={11} tickLine={false} axisLine={false} unit="h" />
              <Tooltip
                contentStyle={{ background: "#FAF7F2", border: "1px solid #E9E1D6", borderRadius: "16px", color: "#4A443F", fontFamily: "sans-serif" }}
                itemStyle={{ color: "#9E86A8" }}
              />
              <Area type="monotone" dataKey="Sleep Hours" stroke="#9E86A8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSleep)" />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FAF7F2" />
              <XAxis dataKey="date" stroke="#A69E94" fontSize={11} tickLine={false} />
              <YAxis stroke="#A69E94" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#FAF7F2", border: "1px solid #E9E1D6", borderRadius: "16px", color: "#4A443F", fontFamily: "sans-serif" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#4A443F" }} />
              <Bar dataKey="Wet Changes" fill="#7E8C78" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="Dirty Changes" fill="#D4A373" radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
