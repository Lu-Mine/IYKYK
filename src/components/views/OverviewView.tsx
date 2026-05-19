import { motion } from "motion/react";
import { getScoreStyles } from "../../lib/quizUtils";
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
      <ScrollArea className="flex-1 custom-scrollbar w-full" contentClassName="px-6 pb-6 relative min-h-full">
        <div className="flex flex-col items-center mb-4 mt-6">
          <p className="text-sm text-gray-400 mb-1 uppercase tracking-[0.2em] font-bold">
            {isReviewMode ? "作答详情" : "答题概览"}
          </p>
          <p style={{ fontSize: '10px' }} className="text-gray-300 font-semibold tracking-[0.15em] uppercase font-sans">
            {isReviewMode ? "Response Details" : "Quiz Overview"}
          </p>
          {isReviewMode && respondentName && (
            <p className="mt-2 text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              来自 <span className="font-bold underline">{respondentName}</span> 的答卷
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
                  className={`relative bg-white/50 backdrop-blur-sm border border-white/50 hover:border-green-300 hover:bg-white/80 p-2 sm:p-3 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors shadow-sm aspect-auto min-h-[8.5rem] sm:min-h-[9.5rem] group z-auto`}
                >
                  <div className="absolute top-1 left-2 font-display font-black text-lg sm:text-xl text-gray-300 group-hover:text-green-forest/40 transition-colors z-20">
                    {idx + 1}
                  </div>
                  {isReviewMode && hostScores && (
                    <div className="absolute top-1.5 right-2 text-[10px] sm:text-xs font-bold text-red-400 group-hover:text-red-500 transition-colors z-20">
                      差 {diff} 分
                    </div>
                  )}
                  <div className="text-xs sm:text-sm text-gray-600 font-medium text-left px-2 w-full relative z-10 line-clamp-3 mt-0">
                    {question}
                  </div>
                  <div 
                    className={`absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 text-xs sm:text-sm font-bold w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded-lg ${getScoreStyles(userScores[idx], true)} group-hover:scale-110 transition-transform z-30 opacity-100`}
                  >
                    {userScores[idx]}
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
                  className={`relative bg-white/50 backdrop-blur-sm border border-white/50 hover:border-green-300 hover:bg-white/80 p-2 sm:p-3 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors shadow-sm aspect-auto min-h-[8.5rem] sm:min-h-[9.5rem] group z-auto`}
                >
                  <div className="absolute top-1 left-2 font-display font-black text-lg sm:text-xl text-gray-300 group-hover:text-green-forest/40 transition-colors z-20">
                    {idx + 1}
                  </div>
                  {isReviewMode && hostScores && (
                    <div className="absolute top-1.5 right-2 text-[10px] sm:text-xs font-bold text-red-400 group-hover:text-red-500 transition-colors z-20">
                      差 {diff} 分
                    </div>
                  )}
                  <div className="text-xs sm:text-sm text-gray-600 font-medium text-left px-2 w-full relative z-10 line-clamp-3 mt-0">
                    {question}
                  </div>
                  <div 
                    className={`absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 text-xs sm:text-sm font-bold w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded-lg ${getScoreStyles(userScores[idx], true)} group-hover:scale-110 transition-transform z-30 opacity-100`}
                  >
                    {userScores[idx]}
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
          className="w-full py-3.5 bg-green-forest text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200/50 hover:bg-green-600 transition-colors"
        >
          {isReviewMode ? `完成查看 ${respondentName} 的答卷` : `提交 ${hostName} 的 Quiz`}
        </button>
      </div>
    </motion.div>
  );
}
