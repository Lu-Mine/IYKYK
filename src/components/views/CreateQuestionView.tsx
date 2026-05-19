import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, ListPlus, Check, ArrowUp, X } from "lucide-react";
import { PRESET_QUESTIONS } from "../../constants";
import { getScoreStyles } from "../../lib/quizUtils";

interface Props {
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  questions: string[];
  hostScores: number[];
  updateQuestion: (index: number, text: string) => void;
  updateScore: (index: number, score: number) => void;
  addNewQuestion: () => void;
  finishQuiz: () => void;
  onGoToInfo: () => void;
}

export default function CreateQuestionView({
  currentQuestionIndex,
  setCurrentQuestionIndex,
  questions,
  hostScores,
  updateQuestion,
  updateScore,
  addNewQuestion,
  finishQuiz,
  onGoToInfo,
}: Props) {
  const [showPreset, setShowPreset] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [direction, setDirection] = useState(1);
  const prevIndex = useRef(currentQuestionIndex);
  
  if (currentQuestionIndex !== prevIndex.current) {
    setDirection(currentQuestionIndex > prevIndex.current ? 1 : -1);
    prevIndex.current = currentQuestionIndex;
  }

  const qText = questions[currentQuestionIndex] || "";

  // auto-height removed: textarea is fixed to 3 rows

  const currentScore = hostScores[currentQuestionIndex] || 0;

  const handleNext = () => {
    if (!qText.trim() || currentScore === 0) return;
    if (currentQuestionIndex === questions.length - 1) {
      addNewQuestion();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If modal is open
      if (showPreset) {
         if (e.key === "Escape") setShowPreset(false);
         return;
      }
      
      if (e.key === "Home") {
         onGoToInfo();
      }

      // Ignore arrow keys when typing in input or textarea
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [currentQuestionIndex, qText, currentScore, showPreset, onGoToInfo, handleNext, handlePrev]);

  const hasAtLeastOneValidQuestion = questions.some((q, i) => q.trim() !== '' && hostScores[i] !== 0);

  return (
    <>
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          layout
          key={`create_q_${currentQuestionIndex}`}
          custom={direction}
          initial={(d: number) => ({ opacity: 0, x: d === 1 ? 50 : -50, filter: "blur(5px)" })}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={(d: number) => ({ opacity: 0, x: d === 1 ? -50 : 50, filter: "blur(5px)" })}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="flex flex-col flex-1 w-full min-h-0 overflow-hidden relative"
        >
          {/* Header */}
          <div className="pt-6 px-6 sm:pt-8 sm:px-8 pb-4 flex items-center justify-between z-10 shrink-0">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-klein-blue/5 text-klein-blue hover:bg-klein-blue/10 disabled:opacity-30 disabled:hover:bg-klein-blue/5 transition-all flex items-center gap-1"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm font-medium">上一题</span>
            </button>
            <div className="flex-1 text-center absolute left-1/2 -translate-x-1/2">
              <span className="font-sans font-bold text-klein-blue tracking-widest text-lg sm:text-xl whitespace-nowrap">
                第 {currentQuestionIndex + 1} 题
              </span>
            </div>
            <button
              onClick={handleNext}
              disabled={!qText.trim() || currentScore === 0}
              className="px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-klein-blue/5 text-klein-blue hover:bg-klein-blue/10 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm font-medium">{currentQuestionIndex === questions.length - 1 ? '添加下一题' : '下一题'}</span>
              <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-8 pb-6 flex flex-col items-center flex-grow justify-center">
        <div className="w-full relative min-h-[160px] bg-white/50 backdrop-blur-sm border border-klein-blue/20 hover:border-klein-blue/50 focus-within:border-klein-blue/50 rounded-xl shadow-sm transition-colors flex flex-col items-center justify-center p-4 pb-12">
          <textarea
            ref={textareaRef}
            value={qText}
            onChange={(e) => updateQuestion(currentQuestionIndex, e.target.value)}
            placeholder="在这里输入你的题目..."
            rows={3}
            className="w-full text-lg sm:text-xl font-medium text-gray-800 text-center leading-relaxed focus:outline-none bg-transparent resize-none placeholder-gray-400 py-1 overflow-y-auto custom-scrollbar"
          />
          <button
            onClick={() => setShowPreset(true)}
            className="absolute bottom-2 right-2 text-[13px] font-medium text-klein-blue hover:text-klein-blue-light flex items-center gap-1.5 transition-colors bg-klein-blue/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-klein-blue/20 active:scale-95"
          >
            <ListPlus size={14} /> 预设题库
          </button>
        </div>

        {/* 1-7 Rating */}
        <div className="mt-8 w-full max-w-sm">
          <div className="text-center text-sm text-gray-500 mb-4 font-medium select-none">
            这道题我给自己的评分是
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-3 px-1">
            <span>完全不符合</span>
            <span>完全符合</span>
          </div>
          <div className="flex justify-between flex-nowrap gap-1.5 sm:gap-2 mb-4 w-full">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => {
              const selected = currentScore === num;
              return (
                <button
                  key={num}
                  onClick={() => updateScore(currentQuestionIndex, num)}
                  className={`flex-1 aspect-square max-h-[3rem] sm:max-h-[3.5rem] rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black transition-all duration-[220ms] box-border shadow-sm
                  ${getScoreStyles(num, selected)}`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="relative pb-6 px-6 sm:px-8 flex justify-between items-center bg-transparent mt-2">
        <button
          onClick={finishQuiz}
          disabled={!hasAtLeastOneValidQuestion}
          className="flex items-center gap-2 bg-klein-blue hover:bg-klein-blue-light text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-klein-blue/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
        >
          <Check size={18} /> 完成试卷
        </button>

        <button
          onClick={onGoToInfo}
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-600 hover:text-klein-blue hover:bg-white border border-gray-200 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          回到卷首 <ArrowUp size={18} />
        </button>
      </div>
      </motion.div>
    </AnimatePresence>

      {/* Preset Modal */}
      {createPortal(
        <AnimatePresence>
          {showPreset && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreset(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 sm:p-8 pointer-events-auto"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2, type: "spring", bounce: 0.3 }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="bg-white/95 backdrop-blur-xl w-full max-w-2xl h-[85%] sm:h-[80%] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white/50">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <ListPlus size={18} className="text-klein-blue" />
                    预设题库
                  </h3>
                  <button onClick={() => setShowPreset(false)} className="text-gray-400 hover:text-gray-600 px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium transition-colors hover:bg-gray-100 rounded-lg">
                    关闭 <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3">
                  {PRESET_QUESTIONS.map((pq, idx) => {
                    const usedIn = questions.lastIndexOf(pq);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          updateQuestion(currentQuestionIndex, pq);
                          setShowPreset(false);
                        }}
                        className="w-full text-left p-4 rounded-xl bg-gray-50/80 hover:bg-klein-blue/5 border border-gray-100 hover:border-klein-blue/20 transition-all text-sm text-gray-700 leading-relaxed group relative pb-8"
                      >
                        <span className="block mb-2">{pq}</span>
                        {usedIn !== -1 && (
                          <div className="absolute bottom-2 right-2 flex gap-1">
                            <span className="text-[12px] bg-klein-blue/10 text-klein-blue px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                              在第 {usedIn + 1} 题用过
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
