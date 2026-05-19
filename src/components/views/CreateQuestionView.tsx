import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, ListPlus, Check, ArrowUp, X, Filter, Search } from "lucide-react";
import { PRESET_QUESTIONS } from "../../constants";
import { getScoreStyles } from "../../lib/quizUtils";
import { ScrollArea } from "../ui/ScrollArea";

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
  hostName: string;
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
  hostName,
}: Props) {
  const [showPreset, setShowPreset] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [direction, setDirection] = useState(1);
  const prevIndex = useRef(currentQuestionIndex);
  
  if (currentQuestionIndex !== prevIndex.current) {
    setDirection(currentQuestionIndex > prevIndex.current ? 1 : -1);
    prevIndex.current = currentQuestionIndex;
  }

  const qText = questions[currentQuestionIndex] || "";

  const ALL_CATEGORIES = Array.from(new Set(PRESET_QUESTIONS.map(q => q.category)));

  const filteredPresets = PRESET_QUESTIONS.filter(pq => {
    const matchesSearch = pq.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(pq.category);
    return matchesSearch && matchesCategory;
  });

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

          <ScrollArea className="flex-1 custom-scrollbar" contentClassName="px-6 sm:px-8 pb-6 flex flex-col items-center flex-grow justify-center min-h-full">
        <div className="w-full relative min-h-[160px] bg-white/50 backdrop-blur-sm border border-klein-blue/20 hover:border-klein-blue/50 focus-within:border-klein-blue/50 rounded-xl shadow-sm transition-colors flex flex-col items-center justify-center p-4 pb-12">
          <textarea
            ref={textareaRef}
            value={qText}
            onChange={(e) => updateQuestion(currentQuestionIndex, e.target.value)}
            placeholder="在这里输入你的题目..."
            rows={3}
            className="w-full text-lg sm:text-xl font-medium text-gray-800 text-center leading-relaxed focus:outline-none bg-transparent resize-none placeholder-gray-400 py-1 overflow-y-auto select-text"
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
      </ScrollArea>

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
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (showFilterDropdown) setShowFilterDropdown(false);
                }}
                className="bg-white/95 backdrop-blur-xl w-[90vw] max-w-2xl h-[80vh] max-h-[700px] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white/50 shrink-0">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <ListPlus size={18} className="text-klein-blue" />
                    预设题库
                  </h3>
                  <button onClick={() => setShowPreset(false)} className="text-gray-400 hover:text-gray-600 px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium transition-colors hover:bg-gray-100 rounded-lg">
                    关闭 <X size={16} />
                  </button>
                </div>
                
                <div className="p-4 border-b border-gray-100 bg-white/50 flex gap-2 relative z-20 shrink-0">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索题目..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-klein-blue/20 focus:border-klein-blue/50 transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFilterDropdown(!showFilterDropdown);
                      }}
                      className={`p-2 rounded-lg border transition-all ${
                        selectedCategories.length > 0
                          ? "bg-klein-blue/10 border-klein-blue/30 text-klein-blue"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <Filter size={20} />
                    </button>
                    {showFilterDropdown && (
                      <div 
                        className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 text-left"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-3 pb-2 mb-2 border-b border-gray-50 flex justify-between items-center text-xs text-gray-500">
                           <span>筛选分类</span>
                           {selectedCategories.length > 0 && (
                             <button onClick={() => setSelectedCategories([])} className="text-klein-blue hover:underline">重置</button>
                           )}
                        </div>
                        {ALL_CATEGORIES.map(cat => (
                          <label key={cat} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(cat)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategories([...selectedCategories, cat]);
                                } else {
                                  setSelectedCategories(selectedCategories.filter(c => c !== cat));
                                }
                              }}
                              className="rounded border-gray-300 text-klein-blue focus:ring-klein-blue w-3.5 h-3.5"
                            />
                            <span className="text-sm text-gray-700">{cat}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <ScrollArea className="flex-1 custom-scrollbar" contentClassName="p-5 space-y-3">
                  {filteredPresets.map((pq, idx) => {
                    const replacedText = pq.text.replace(/他/g, hostName);
                    const usedIn = questions.lastIndexOf(replacedText);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          updateQuestion(currentQuestionIndex, replacedText);
                          setShowPreset(false);
                        }}
                        className="w-full text-left p-4 pt-10 rounded-xl bg-gray-50/80 hover:bg-klein-blue/5 border border-gray-100 hover:border-klein-blue/20 transition-all text-sm text-gray-700 leading-relaxed group relative pb-8"
                      >
                        <div className="absolute top-3 left-3 flex gap-1">
                          <span className="text-[12px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                            {pq.category}
                          </span>
                        </div>
                        <span className="block mb-2">{replacedText}</span>
                        {usedIn !== -1 && (
                          <div className="absolute bottom-3 right-3 flex gap-1">
                            <span className="text-[12px] bg-klein-blue/10 text-klein-blue px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                              在第 {usedIn + 1} 题用过
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </ScrollArea>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
