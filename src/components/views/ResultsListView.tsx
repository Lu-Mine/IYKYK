import { motion } from "motion/react";
import { ArrowLeft, User, Clock } from "lucide-react";
import { ScrollArea } from "../ui/ScrollArea";
import { calculateResultScore, getPercentageTheme } from "../../lib/quizUtils";
import { HOST_SCORES } from "../../lib/constants";

interface ResultRecord {
  id?: string;
  responseId?: string;
  participantName: string;
  participantScores: number[];
  createdAt: string;
}

interface ResultsListViewProps {
  results: ResultRecord[];
  onBack: () => void;
  onReview: (record: ResultRecord) => void;
  hostScores?: number[];
}

export default function ResultsListView({ results, onBack, onReview, hostScores = HOST_SCORES }: ResultsListViewProps) {
  // Helper to format date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Sort results by date descending
  const sortedResults = [...results].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <motion.div
      layout
      key="results-list"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.17 } }}
      transition={{ duration: 0.33 }}
      className="flex flex-col flex-1 w-full min-h-0 relative select-none overflow-hidden"
    >
      <div className="flex flex-col items-center mb-2 mt-6 shrink-0">
        <p className="text-sm text-gray-400 mb-1 uppercase tracking-[0.2em] font-bold">
          作答记录
        </p>
        <p style={{ fontSize: '10px' }} className="text-gray-300 font-semibold tracking-[0.15em] uppercase font-sans">
          Response Records
        </p>
      </div>

      <ScrollArea className="flex-1 custom-scrollbar w-full" contentClassName="px-6 pb-6 relative">
        <div className="space-y-4 mt-2">
          {sortedResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <User size={48} className="opacity-20 mb-4" />
              <p>暂无作答记录</p>
            </div>
          ) : (
            sortedResults.map((record, idx) => {
              const pScores = record.participantScores || [];
              const score = calculateResultScore(pScores, hostScores, pScores.length || hostScores.length);
              const theme = getPercentageTheme(score);
              const recordKey = record.responseId || record.id || `record-${idx}`;
              return (
                <div
                  key={recordKey}
                  onClick={() => onReview(record)}
                  className="relative bg-white/50 backdrop-blur-sm border border-white/50 hover:border-klein-blue/30 hover:bg-white/80 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-colors shadow-sm group z-auto active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="font-display font-black text-2xl text-gray-200 group-hover:text-klein-blue/40 transition-colors shrink-0 w-8 text-center">
                       {results.length - idx}
                    </div>
                    
                    <div className="flex flex-col text-left min-w-0">
                      <div className="text-base sm:text-lg font-bold text-gray-700 truncate">{record.participantName}</div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                        <Clock size={12} />
                        <span>{formatDate(record.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-0.5">Score</span>
                      <div className="flex items-baseline justify-end font-display font-extrabold tracking-tighter mt-[-4px]">
                        <span className={`text-xl sm:text-2xl bg-gradient-to-br ${theme.gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform`}>
                          {Math.round(score)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="p-6 bg-white/40 border-t border-white/40 flex-shrink-0 z-30 w-full backdrop-blur-md">
        <button
          onClick={onBack}
          className="w-full py-3.5 bg-white text-gray-500 border border-gray-100 rounded-xl font-bold text-lg shadow-sm hover:bg-gray-50 hover:text-klein-blue transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} /> 返回主页
        </button>
      </div>
    </motion.div>
  );
}
