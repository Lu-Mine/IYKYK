import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getScoreStyles } from "../../lib/quizUtils";
import { ScrollArea } from "../ui/ScrollArea";

interface QuizViewProps {
  currentQuestion: number;
  totalQuestions: number;
  questions: string[];
  direction: number;
  userScores: number[];
  isTransitioning: boolean;
  handleScore: (score: number) => void;
  handlePrev: () => void;
  isReviewMode?: boolean;
  correctScores?: number[];
  onBackToOverview?: () => void;
}

export default function QuizView({
  currentQuestion,
  totalQuestions,
  questions,
  direction,
  userScores,
  isTransitioning,
  handleScore,
  handlePrev,
  isReviewMode,
  correctScores,
  onBackToOverview,
}: QuizViewProps) {
  const getReviewStyles = (score: number) => {
    const isRespondentChoice = userScores[currentQuestion] === score;
    const isCorrectChoice = correctScores && correctScores[currentQuestion] === score;

    if (isRespondentChoice) {
      return getScoreStyles(score, true);
    }

    if (isCorrectChoice) {
      // Highlight text and border only, no background
      const styles: Record<number, string> = {
        1: "text-[#eb776c] border-[#fdecea] ring-2 ring-[#eb776c]/40",
        2: "text-[#edab85] border-[#fdf3ec] ring-2 ring-[#edab85]/40",
        3: "text-[#f3cd82] border-[#fdf8ec] ring-2 ring-[#f3cd82]/40",
        4: "text-[#a6ad91] border-[#f6f7f4] ring-2 ring-[#a6ad91]/40",
        5: "text-[#8cb8b3] border-[#ecf3f2] ring-2 ring-[#8cb8b3]/40",
        6: "text-[#8397c4] border-[#ebedf4] ring-2 ring-[#8397c4]/40",
        7: "text-[#9783ba] border-[#efebf4] ring-2 ring-[#9783ba]/40",
      };
      return `${styles[score] || ""} bg-transparent border-[1.5px]`;
    }

    return "text-gray-200 border-transparent bg-white/20";
  };

  return (
    <motion.div
      layout
      key="quiz"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.17 } }}
      transition={{ duration: 0.33 }}
      className="flex flex-col flex-1 w-full min-h-0 select-none overflow-hidden"
    >
      <ScrollArea className="flex-1 custom-scrollbar w-full" contentClassName="p-6 flex flex-col relative min-h-full">
        <div className="mb-4 flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5 text-gray-500">
              <span className="text-sm font-medium">进度</span>
              <span style={{ fontSize: '10px' }} className="font-semibold tracking-[0.15em] text-gray-300 uppercase font-sans">
                Progress
              </span>
            </div>
            <span className="text-sm font-medium text-gray-500">
              {currentQuestion + 1} / {totalQuestions}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-[550ms] ease-out ${isReviewMode ? 'bg-green-500' : 'bg-green-forest'}`}
              style={{
                width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="flex-grow flex flex-col justify-center min-h-[160px] relative">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={currentQuestion}
              custom={direction}
              initial={{ opacity: 0, scale: 0.95, x: 20 * direction }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                x: -20 * direction,
                transition: { duration: 0.17 },
              }}
              transition={{
                duration: 0.28,
                type: "spring",
                stiffness: 350,
                damping: 25,
              }}
              className={`${isReviewMode ? 'bg-white/80 border-green-200 shadow-lg shadow-green-100/20' : 'bg-green-50/60 border-green-100/50 shadow-sm'} backdrop-blur-md p-6 rounded-2xl border text-lg leading-relaxed text-center font-medium w-full text-balance transition-colors`}
            >
              {questions[currentQuestion]}
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="p-4 sm:p-6 bg-white/40 border-t border-white/40 flex flex-col flex-shrink-0 z-20 w-full backdrop-blur-md">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3 px-1">
          <span>完全不符合</span>
          <span>完全符合</span>
        </div>
        <div className="flex justify-between flex-nowrap gap-1.5 sm:gap-2 mb-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7].map((score) => {
            const isSelected = userScores[currentQuestion] === score;
            return (
              <button
                key={score}
                onClick={() => !isReviewMode && handleScore(score)}
                disabled={isTransitioning || isReviewMode}
                className={`flex-1 aspect-square max-h-[3rem] sm:max-h-[3.5rem] rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black transition-all duration-[220ms] box-border shadow-sm
              ${isReviewMode ? getReviewStyles(score) : getScoreStyles(score, isSelected)} ${isTransitioning ? "opacity-80" : ""} ${isReviewMode ? "cursor-default" : ""}`}
              >
                {score}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center sm:mt-2 h-10 w-full">
          <button
            onClick={handlePrev}
            className={`flex items-center gap-2 text-sm transition-colors py-2 px-4 rounded-lg flex-shrink-0 ${
              currentQuestion === 0
                ? "opacity-40 cursor-not-allowed text-gray-400"
                : "text-gray-500 hover:text-green-dark hover:bg-white border border-transparent hover:border-gray-200"
            }`}
          >
            <ArrowLeft size={16} />
            上一题
          </button>

          {isReviewMode && onBackToOverview && (
            <button
              onClick={onBackToOverview}
              className="px-4 py-2 bg-white/80 border border-gray-100 text-gray-500 font-bold text-sm rounded-xl shadow-sm hover:text-green-600 transition-all flex items-center gap-1.5"
            >
              返回概览
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
