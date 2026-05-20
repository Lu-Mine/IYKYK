import { useEffect } from "react";
import { motion } from "motion/react";
import { getScoreStyles, getScoreColorText } from "../../lib/quizUtils";
import { ScrollArea } from "../ui/ScrollArea";

interface OverviewViewProps {
  questions: string[];
  userScores: number[];
  hostName: string;
  setCurrentQuestion: (index: number) => void;
  setView: (view: "quiz") => void;
  handleSubmit: () => void;
  isReviewMode?: boolean;
  respondentName?: string;
  hostScores?: number[];
  onBackToResults?: () => void;
}

export default function OverviewView({
  questions,
  userScores,
  hostName,
  setCurrentQuestion,
  setView,
  handleSubmit,
  isReviewMode,
  respondentName,
  hostScores,
  onBackToResults,
}: OverviewViewProps) {
  useEffect(() => {
    if (!isReviewMode || !onBackToResults) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onBackToResults();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isReviewMode, onBackToResults]);

  return (
    <motion.div
      layout
      key="overview"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.17 } }}
      transition={{ duration: 0.33 }}
      className="flex flex-col flex-1 w-full min-h-0 relative select-none overflow-hidden"
    >
      <ScrollArea className="mb-2 flex-1 custom-scrollbar w-full" contentClassName="px-6 pb-6 relative min-h-full">
        <div className="flex flex-col items-center mb-4 mt-6">
          <p className="text-sm text-gray-400 mb-1 uppercase tracking-[0.2em] font-bold">
            {isReviewMode ? "作答详情" : "答题概览"}
          </p>
          <p style={{ fontSize: '10px' }} className="text-gray-300 font-semibold tracking-[0.15em] uppercase font-sans">
            {isReviewMode ? "Response Details" : "Quiz Overview"}
          </p>
          {isReviewMode && respondentName && (
            <p className="mt-2 text-base sm:text-lg font-black text-klein-blue bg-klein-blue/5 px-5 py-2 rounded-full border border-klein-blue/20 shadow-sm">
              来自 <span className="underline decoration-klein-blue-light decoration-2 underline-offset-4">{respondentName}</span> 的问卷
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-3">
            {questions.slice(0, Math.ceil(questions.length / 2)).map((question, sliceIdx) => {
               const idx = sliceIdx;
               const diff = hostScores ? Math.abs(hostScores[idx] - userScores[idx]) : 0;
               return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentQuestion(idx);
                    setView("quiz");
                  }}
                  className={`relative cursor-pointer hover:bg-white/80 bg-white/50 backdrop-blur-sm border border-white/50 p-2 sm:p-3 rounded-2xl flex flex-col items-center justify-center transition-colors shadow-sm aspect-auto min-h-[8.5rem] sm:min-h-[9.5rem] group z-auto ${isReviewMode ? 'hover:border-klein-blue/30' : 'hover:border-green-300'}`}
                >
                  <div className={`absolute top-1 left-2 font-display font-black text-lg sm:text-xl text-gray-300 transition-colors z-20 ${isReviewMode ? 'group-hover:text-klein-blue/40' : 'group-hover:text-green-forest/40'}`}>
                    {idx + 1}
                  </div>
                  {isReviewMode && hostScores && diff > 0 && (
                    <div className="absolute top-1.5 right-2 text-[10px] sm:text-[11px] font-bold text-red-500 bg-red-50/80 border border-red-100 px-1.5 py-0.5 rounded whitespace-nowrap z-20 shadow-xs">
                      差 {diff} 分
                    </div>
                  )}
                  <div className="text-xs sm:text-sm text-gray-600 font-medium text-left px-2 w-full relative z-10 line-clamp-3 mt-0">
                    {question}
                  </div>
                  <div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 flex items-center gap-1.5 z-30 opacity-100">
                    <div className={`text-xs sm:text-sm font-bold w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded-lg ${getScoreStyles(userScores[idx], true)} ${isReviewMode ? '' : 'group-hover:scale-110'} transition-transform`}>
                      {userScores[idx]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="space-y-3">
            {questions.slice(Math.ceil(questions.length / 2)).map((question, sliceIdx) => {
               const idx = sliceIdx + Math.ceil(questions.length / 2);
               const diff = hostScores ? Math.abs(hostScores[idx] - userScores[idx]) : 0;
               return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentQuestion(idx);
                    setView("quiz");
                  }}
                  className={`relative cursor-pointer hover:bg-white/80 bg-white/50 backdrop-blur-sm border border-white/50 p-2 sm:p-3 rounded-2xl flex flex-col items-center justify-center transition-colors shadow-sm aspect-auto min-h-[8.5rem] sm:min-h-[9.5rem] group z-auto ${isReviewMode ? 'hover:border-klein-blue/30' : 'hover:border-green-300'}`}
                >
                  <div className={`absolute top-1 left-2 font-display font-black text-lg sm:text-xl text-gray-300 transition-colors z-20 ${isReviewMode ? 'group-hover:text-klein-blue/40' : 'group-hover:text-green-forest/40'}`}>
                    {idx + 1}
                  </div>
                  {isReviewMode && hostScores && diff > 0 && (
                    <div className="absolute top-1.5 right-2 text-[10px] sm:text-[11px] font-bold text-red-500 bg-red-50/80 border border-red-100 px-1.5 py-0.5 rounded whitespace-nowrap z-20 shadow-xs">
                      差 {diff} 分
                    </div>
                  )}
                  <div className="text-xs sm:text-sm text-gray-600 font-medium text-left px-2 w-full relative z-10 line-clamp-3 mt-0">
                    {question}
                  </div>
                  <div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 flex items-center gap-1.5 z-30 opacity-100">
                    <div className={`text-xs sm:text-sm font-bold w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded-lg ${getScoreStyles(userScores[idx], true)} ${isReviewMode ? '' : 'group-hover:scale-110'} transition-transform`}>
                      {userScores[idx]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      <div className="p-6 bg-white/40 border-t border-white/40 flex-shrink-0 z-30 w-full backdrop-blur-md">
        <button
          onClick={isReviewMode ? onBackToResults : handleSubmit}
          className={`w-full py-3.5 text-white rounded-xl font-bold text-lg shadow-lg transition-colors ${
            isReviewMode
              ? "bg-klein-blue hover:bg-klein-blue-light shadow-klein-blue/20"
              : "bg-green-forest hover:bg-green-600 shadow-green-200/50"
          }`}
        >
          {isReviewMode ? `完成查看 ${respondentName} 的答卷` : `提交 ${hostName} 的 Quiz`}
        </button>
      </div>
    </motion.div>
  );
}
