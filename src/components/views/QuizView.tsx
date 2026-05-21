import { useEffect } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
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
  handleNext?: () => void;
  isReviewMode?: boolean;
  correctScores?: number[];
  onBackToOverview?: () => void;
  isOverlay?: boolean;
  shuffledOrder?: number[];
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
  handleNext,
  isReviewMode,
  correctScores,
  onBackToOverview,
  isOverlay,
  shuffledOrder,
}: QuizViewProps) {


  const getReviewStyles = (score: number) => {
    const isRespondentChoice = userScores[currentQuestion] === score;
    const isCorrectChoice = correctScores && correctScores[currentQuestion] === score;

    // If viewing in the floating window/popover and they got it wrong, highlight correct answer differently
    if (isOverlay) {
      const respondentChoice = userScores[currentQuestion];
      const correctChoice = correctScores ? correctScores[currentQuestion] : null;
      const isIncorrect = correctChoice !== null && respondentChoice !== correctChoice;

      if (isIncorrect) {
        if (score === correctChoice) {
          // Empty/hollow design with only colored numbers and border (空心且只有带颜色的数字和边框)
          const hollowStyles: Record<number, string> = {
            1: "text-[#eb776c] border-[#eb776c] bg-transparent border-2 border-solid font-black",
            2: "text-[#edab85] border-[#edab85] bg-transparent border-2 border-solid font-black",
            3: "text-[#f3cd82] border-[#f3cd82] bg-transparent border-2 border-solid font-black",
            4: "text-[#a6ad91] border-[#a6ad91] bg-transparent border-2 border-solid font-black",
            5: "text-[#8cb8b3] border-[#8cb8b3] bg-transparent border-2 border-solid font-black",
            6: "text-[#8397c4] border-[#8397c4] bg-transparent border-2 border-solid font-black",
            7: "text-[#9783ba] border-[#9783ba] bg-transparent border-2 border-solid font-black",
          };
          return `${hollowStyles[score] || "text-gray-400 border-gray-400 bg-transparent border-2 border-solid"}`;
        }

        if (score === respondentChoice) {
          // The block chosen by the respondent is styled with a filled solid block
          return getScoreStyles(score, true);
        }

        return "text-gray-200 border-transparent bg-white/20";
      }
    }

    if (isCorrectChoice) {
      return getScoreStyles(score, true);
    }

    if (isRespondentChoice) {
      // Swapped highlight: respondent's choice is now outline/low-intensity
      const styles: Record<number, string> = {
        1: "text-[#eb776c] border-[#eb776c] ring-2 ring-[#eb776c]/40",
        2: "text-[#edab85] border-[#edab85] ring-2 ring-[#edab85]/40",
        3: "text-[#f3cd82] border-[#f3cd82] ring-2 ring-[#f3cd82]/40",
        4: "text-[#a6ad91] border-[#a6ad91] ring-2 ring-[#a6ad91]/40",
        5: "text-[#8cb8b3] border-[#8cb8b3] ring-2 ring-[#8cb8b3]/40",
        6: "text-[#8397c4] border-[#8397c4] ring-2 ring-[#8397c4]/40",
        7: "text-[#9783ba] border-[#9783ba] ring-2 ring-[#9783ba]/40",
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
              className={`h-2 rounded-full transition-all duration-[550ms] ease-out ${isReviewMode ? 'bg-klein-blue' : 'bg-green-forest'}`}
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
              className={`${isReviewMode ? "bg-gradient-to-br from-blue-50/85 via-blue-50/50 to-indigo-50/70 border-blue-200/60 shadow-lg shadow-blue-100/20" : "bg-green-50/60 border-green-100/50 shadow-sm"} backdrop-blur-md p-6 rounded-2xl border text-lg leading-relaxed text-center font-medium w-full text-balance transition-colors`}
            >
              {(shuffledOrder && shuffledOrder[currentQuestion] !== undefined)
                ? questions[shuffledOrder[currentQuestion]]
                : questions[currentQuestion]}
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="p-4 sm:p-6 bg-white/40 border-t border-white/40 flex flex-col flex-shrink-0 z-20 w-full backdrop-blur-md">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3 px-1">
          <span>完全不符合</span>
          <span>完全符合</span>
        </div>
        <div className={`flex justify-between flex-nowrap gap-1.5 sm:gap-2 w-full ${isOverlay ? "" : "mb-4"}`}>
          {[1, 2, 3, 4, 5, 6, 7].map((score) => {
            const isSelected = userScores[currentQuestion] === score;
            return (
              <button
                key={score}
                onClick={() => !isReviewMode && handleScore(score)}
                disabled={isTransitioning || isReviewMode}
                className={`flex-1 aspect-square max-h-[3rem] sm:max-h-[3.5rem] rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black transition-all duration-[220ms] box-border
              ${isReviewMode ? getReviewStyles(score) : getScoreStyles(score, isSelected)} ${isTransitioning ? "opacity-80" : ""} ${isReviewMode ? "cursor-default" : ""}`}
              >
                {score}
              </button>
            );
          })}
        </div>

        {isOverlay && isReviewMode && correctScores && userScores[currentQuestion] !== correctScores[currentQuestion] && (
          <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-gray-500 font-medium select-none bg-blue-50/20 py-1.5 px-3 rounded-lg border border-blue-50/30 w-fit mx-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-500 shrink-0"></span>
              <span>实心: 对方选择</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border-2 border-solid border-blue-500 bg-transparent shrink-0"></span>
              <span>空心: 正确答案</span>
            </div>
          </div>
        )}

        {!isOverlay && (
          <div className="w-full sm:mt-2 h-10">
            {isReviewMode ? (
              <div className="grid grid-cols-3 items-center w-full h-full">
                {/* Left: Previous button */}
                <div className="flex justify-start">
                  {!isOverlay && (
                    <button
                      onClick={handlePrev}
                      disabled={currentQuestion === 0 || isTransitioning}
                      className={`flex items-center gap-1.5 text-sm transition-colors py-2 px-3 rounded-lg flex-shrink-0 ${
                        currentQuestion === 0 || isTransitioning
                          ? "opacity-30 cursor-not-allowed text-gray-400"
                          : "text-gray-500 hover:text-klein-blue hover:bg-white border border-transparent hover:border-gray-200"
                      }`}
                    >
                      <ArrowLeft size={16} />
                      <span>上一题</span>
                    </button>
                  )}
                </div>

                {/* Center: Confirm button */}
                <div className="flex justify-center">
                  {onBackToOverview && (
                    <button
                      onClick={onBackToOverview}
                      disabled={isTransitioning}
                      className="px-5 py-2 bg-klein-blue hover:bg-klein-blue-light text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-100/30 transition-all flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>确认</span>
                    </button>
                  )}
                </div>

                {/* Right: Next button */}
                <div className="flex justify-end">
                  {!isOverlay && handleNext && (
                    <button
                      onClick={handleNext}
                      disabled={currentQuestion === totalQuestions - 1 || isTransitioning}
                      className={`flex items-center gap-1.5 text-sm transition-colors py-2 px-3 rounded-lg flex-shrink-0 ${
                        currentQuestion === totalQuestions - 1 || isTransitioning
                          ? "opacity-30 cursor-not-allowed text-gray-400"
                          : "text-gray-500 hover:text-klein-blue hover:bg-white border border-transparent hover:border-gray-200"
                      }`}
                    >
                      <span>下一题</span>
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center w-full h-full">
                {!isOverlay && (
                  <button
                    onClick={handlePrev}
                    disabled={currentQuestion === 0 || isTransitioning}
                    className={`flex items-center gap-1.5 text-sm transition-colors py-2 px-3 rounded-lg flex-shrink-0 ${
                      currentQuestion === 0 || isTransitioning
                        ? "opacity-40 cursor-not-allowed text-gray-400"
                        : "text-gray-500 hover:text-green-dark hover:bg-white border border-transparent hover:border-gray-200"
                    }`}
                  >
                    <ArrowLeft size={16} />
                    上一题
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
