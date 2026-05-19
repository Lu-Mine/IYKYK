import { motion } from "motion/react";
import { ArrowLeft, User, Clock } from "lucide-react";
import { ScrollArea } from "../ui/ScrollArea";
import { calculateResultScore } from "../../lib/quizUtils";
import { HOST_SCORES } from "../../lib/constants";

interface ResultRecord {
  id: string;
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

      <ScrollArea className="flex-1 custom-scrollbar w-full" contentClassName="px-6 pb-24 relative min-h-full">
        <div className="space-y-4 mt-6">
          {sortedResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <User size={48} className="opacity-20 mb-4" />
              <p>暂无作答记录</p>
            </div>
          ) : (
            sortedResults.map((record, idx) => {
              const score = calculateResultScore(record.participantScores, hostScores, record.participantScores.length);
              return (
                <div
                  key={record.id}
                  onClick={() => onReview(record)}
                  className="relative bg-white/50 backdrop-blur-sm border border-white/50 hover:border-green-300 hover:bg-white/80 p-5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm min-h-[9rem] group z-auto active:scale-[0.99]"
                >
                  {/* Top Left ID */}
                  <div className="absolute top-2 left-3 font-display font-black text-xl text-gray-200 group-hover:text-green-forest/40 transition-colors z-20">
                    {results.length - idx}
                  </div>
                  
                  {/* Center Content */}
                  <div className="text-center space-y-1">
                    <div className="text-lg font-bold text-gray-700">{record.participantName}</div>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>{formatDate(record.createdAt)}</span>
                    </div>
                  </div>

                  {/* Bottom Right Score Percentage */}
                  <div 
                    className="absolute bottom-3 right-4 flex flex-col items-end"
                  >
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Score</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-2xl font-black text-green-forest group-hover:scale-110 transition-transform">
                        {Math.round(score)}
                      </span>
                      <span className="text-xs font-bold text-gray-300">%</span>
                    </div>
                  </div>

                  {/* Subtle Record ID at Bottom Left */}
                  <div className="absolute bottom-3 left-4 font-mono text-[9px] text-gray-200 uppercase tracking-tighter">
                    ID: {record.id.slice(-6)}
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
          className="w-full py-3.5 bg-white text-gray-500 border border-gray-100 rounded-xl font-bold text-lg shadow-sm hover:bg-gray-50 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} /> 返回主页
        </button>
      </div>
    </motion.div>
  );
}
