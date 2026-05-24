import { useState } from "react";
import { Sparkles, Brain, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { FeedLog, DiaperLog, SleepLog } from "../types";

interface AISuggestionsProps {
  feedLogs: FeedLog[];
  diaperLogs: DiaperLog[];
  sleepLogs: SleepLog[];
  babyName: string;
  babyAgeMonths: number;
}

export default function AISuggestions({ feedLogs, diaperLogs, sleepLogs, babyName, babyAgeMonths }: AISuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/insights/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedLogs,
          diaperLogs,
          sleepLogs,
          babyDetails: {
            name: babyName,
            age: `${babyAgeMonths} months`
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to compile AI insights diagnostics.");
      }

      const data = await response.json();
      setSuggestions(data.text);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Could not retrieve medical insights. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper to render markdown text safely with rich styling
   */
  const renderFormattedSuggestions = (text: string) => {
    const lines = text.split("\n");

    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Bold titles/headings e.g. ### Heading or **Heading**
      if (trimmed.startsWith("###")) {
        const title = trimmed.replace(/###\s*/g, "").replace(/\*\*/g, "");
        return (
          <h4 key={idx} className="text-sm font-semibold text-teal-800 font-sans tracking-tight pt-3 pb-1 flex items-center gap-1.5 border-b border-teal-50 mt-4 mb-2">
            <span className="w-1.5 h-3.5 bg-teal-500 rounded-sm inline-block"></span>
            {title}
          </h4>
        );
      }

      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        const clean = trimmed.replace(/\*\*/g, "");
        return (
          <h5 key={idx} className="text-xs uppercase font-bold text-gray-400 font-mono tracking-wider pt-2 mb-1">
            {clean}
          </h5>
        );
      }

      if (trimmed.startsWith("- **")) {
        // Line like "- **Weekly Feeding**: Analyze milk requirements..."
        const match = trimmed.match(/^-\s+\*\*(.*?)\*\*:(.*)$/);
        if (match) {
          const [, boldWord, restOfText] = match;
          return (
            <div key={idx} className="flex gap-2 pl-2 py-0.5 text-sm font-sans items-start text-gray-700 leading-relaxed">
              <span className="text-teal-500 mt-1 select-none text-[10px]">●</span>
              <span>
                <b className="font-semibold text-gray-800">{boldWord}:</b>
                {restOfText}
              </span>
            </div>
          );
        }
      }

      // Standard list items starting with '-' or '*'
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const cleanVal = trimmed.replace(/^[-*]\s*/, "");
        return (
          <div key={idx} className="flex gap-2 pl-2 py-0.5 text-sm font-sans items-start text-gray-750 leading-relaxed">
            <span className="text-teal-400 mt-1 select-none text-[12px]">•</span>
            <span>{cleanVal}</span>
          </div>
        );
      }

      // Ordered list numbered recommendations
      const numMatch = trimmed.match(/^(\d+)\.\s+\*\*(.*?)\*\*:(.*)$/);
      if (numMatch) {
         const [, digit, boldWord, restOfText] = numMatch;
         return (
           <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100/60 shadow-xs flex gap-3.5 items-start my-2">
             <span className="w-6 h-6 flex items-center justify-center rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-xs font-mono font-bold shrink-0">
               {digit}
             </span>
             <div className="text-sm">
               <span className="font-semibold text-gray-950 font-sans block mb-0.5">{boldWord}</span>
               <span className="text-gray-600 leading-relaxed">{restOfText}</span>
             </div>
           </div>
         );
      }

      // Standard text line
      if (trimmed.length > 0) {
        // Check for inline strong markers internally
        const parts = trimmed.split("**");
        if (parts.length > 1) {
          return (
            <p key={idx} className="text-sm text-gray-600 leading-relaxed my-2.5">
              {parts.map((p, pIdx) => (pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-gray-900">{p}</strong> : p))}
            </p>
          );
        }
        return (
          <p key={idx} className="text-sm text-gray-600 leading-relaxed my-2.5">
            {trimmed}
          </p>
        );
      }

      return <div key={idx} className="h-1" />;
    });
  };

  return (
    <div className="bg-white text-[#4A443F] rounded-3xl p-6 shadow-sm border border-[#F0EBE3]" id="ai-insights-panel">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E9E1D6] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-full bg-[#FAF7F2] text-[#7E8C78] border border-[#E9E1D6]">
            <Brain size={22} className="animate-pulse" />
          </div>
          <div>
            <h2 className="font-serif italic font-bold text-lg text-[#4A443F] flex items-center gap-2.5">
              Gemini AI Care Insights
              <span className="px-2.5 py-0.5 text-[9px] uppercase font-mono tracking-widest bg-[#FAF7F2] text-[#7E8C78] border border-[#E9E1D6] rounded-full font-bold">Smart AI</span>
            </h2>
            <p className="text-[#A69E94] text-xs mt-0.5 leading-relaxed">Scans breastmilk, formula, sleep depth, and diaper frequencies to identify nursing trends.</p>
          </div>
        </div>

        {/* Baby Setup context config */}
        <div className="flex items-center gap-2 bg-[#FAF7F2] p-3 rounded-2xl border border-[#E9E1D6] self-start md:self-auto text-xs text-[#4A443F] font-semibold font-sans">
          <span>👶🏼 {babyName}</span>
          <span className="text-[#A69E94]">•</span>
          <span className="font-mono text-[#7E8C78] font-bold">{babyAgeMonths} {babyAgeMonths === 1 ? "mo" : "mo"}</span>
        </div>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <RefreshCw size={28} className="text-[#7E8C78] animate-spin" />
            <p className="text-sm font-medium text-[#4A443F] mt-4 font-serif italic">Analyzing milk levels & sleep hygiene...</p>
            <p className="text-[#A69E94] text-xs mt-1 max-w-sm leading-relaxed">
              Evaluating current logs vs Pediatric standards to compile report.
            </p>
          </div>
        ) : suggestions ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E9E1D6] text-[#4A443F]">
              {renderFormattedSuggestions(suggestions)}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center bg-[#FAF7F2]/50 p-4 rounded-2xl border border-[#E9E1D6]/80 mt-3 gap-3">
              <span className="text-[#A69E94] text-xs font-sans flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={14} className="text-[#7E8C78]" />
                Updated with most recent logs
              </span>
              <button
                onClick={fetchInsights}
                className="flex items-center gap-1.5 text-xs text-white bg-[#7E8C78] hover:bg-[#5C6658] px-4.5 py-2.5 rounded-full transition-all font-serif italic font-semibold cursor-pointer shadow-xs"
              >
                <Sparkles size={12} />
                Regenerate Insights
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-[#FAF7F2]/40 rounded-3xl border border-dashed border-[#E9E1D6]">
            <span className="text-3xl">💡</span>
            <h3 className="text-sm font-serif italic font-semibold text-[#4A443F] mt-3">No AI suggestions generated yet</h3>
            <p className="text-[#A69E94] text-xs mt-1.5 max-w-xs mx-auto leading-relaxed px-4">
              Click the button below to compile and transfer baby log history to the Gemini Pediatric Specialist.
            </p>
            <button
              onClick={fetchInsights}
              className="mt-5 px-6 py-3 bg-[#7E8C78] hover:bg-[#5C6658] text-white text-xs font-serif font-extrabold rounded-full shadow-xs hover:shadow-sm transition-all flex items-center gap-2 mx-auto cursor-pointer italic"
            >
              <Sparkles size={14} />
              Generate Pediatric Care Report
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
