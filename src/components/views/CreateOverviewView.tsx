import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, Reorder, AnimatePresence, useDragControls } from "motion/react";
import { GripVertical, Rocket, ArrowUp, Plus, Settings } from "lucide-react";
import { getScoreStyles } from "../../lib/quizUtils";

interface Props {
  questions: string[];
  hostScores: number[];
  setQuestions: (q: string[]) => void;
  setHostScores: (s: number[]) => void;
  setCurrentQuestionIndex: (idx: number) => void;
  onPublish: () => void;
  onGoToInfo: () => void;
  addNewQuestion: () => void;
}

interface SortableItemProps {
  item: { id: string, text: string, score: number, index: number };
  visualIndex: number;
  setCurrentQuestionIndex: (idx: number) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ item, visualIndex, setCurrentQuestionIndex }) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className="bg-white/90 border border-white/80 rounded-2xl flex overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative z-0"
      whileDrag={{ scale: 1.02, zIndex: 50, cursor: "grabbing", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)" }}
    >
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="w-10 bg-gray-50/80 flex items-center justify-center cursor-grab text-gray-400 group-hover:text-klein-blue/50 transition-colors border-r border-gray-100/50"
      >
        <GripVertical size={16} />
      </div>
      
      <button
        onClick={() => setCurrentQuestionIndex(visualIndex)}
        className="flex-1 text-left p-4 pr-5 hover:bg-klein-blue/5 transition-colors flex flex-col gap-2 relative pointer-events-auto"
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="text-[13px] font-medium text-gray-400 tracking-wider">
          第 {visualIndex + 1} 题
        </div>
        <p className="text-[15px] font-medium text-gray-800 leading-relaxed group-hover:text-klein-blue transition-colors mb-4 pointer-events-none">
          {item.text}
        </p>
        <div 
          className={`absolute bottom-3 right-3 sm:bottom-3 sm:right-3 text-xs sm:text-sm font-bold w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded-lg opacity-80 pointer-events-none group-hover:opacity-100 group-hover:scale-110 transition-all z-10 ${getScoreStyles(item.score, true)}`}
        >
          {item.score}
        </div>
      </button>
    </Reorder.Item>
  );
}

export default function CreateOverviewView({ questions, hostScores, setQuestions, setHostScores, setCurrentQuestionIndex, onPublish, onGoToInfo, addNewQuestion }: Props) {
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (showPublishConfirm) {
        if (e.key === "Enter") {
          setShowPublishConfirm(false);
          onPublish();
        }
        if (e.key === "Escape") {
          setShowPublishConfirm(false);
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [showPublishConfirm, onPublish]);

  // We need stable IDs for Reorder. Generate them once on mount or when questions change length.
  const [items, setItems] = useState<{ id: string, text: string, score: number, index: number }[]>([]);

  useEffect(() => {
    // Only initialize if items is empty or length mismatched, to avoid resetting during drag
    if (items.length !== questions.length) {
      setItems(questions.map((q, i) => ({
        id: `question-${i}-${Date.now()}`,
        text: q,
        score: hostScores[i],
        index: i
      })));
    }
  }, [questions, hostScores]);

  const handleReorder = (newItems: typeof items) => {
    setItems(newItems);
    setQuestions(newItems.map(item => item.text));
    setHostScores(newItems.map(item => item.score));
  };

  const handleCancel = () => {
    setCurrentQuestionIndex(questions.length > 0 ? questions.length - 1 : 0);
  };

  return (
    <motion.div
      layout
      key="create_overview"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col flex-1 w-full min-h-0 overflow-hidden relative"
    >
      <div className="pt-8 px-8 pb-4 shrink-0 border-b border-gray-100/50 bg-white/30 backdrop-blur-sm z-10 flex justify-between items-end relative">
        <div>
          <h2 className="text-xl font-bold font-display text-klein-blue">完成试卷之前</h2>
          <p className="text-sm text-gray-500 mt-1">检查你出的题目，拖拽左侧调整顺序</p>
        </div>
        <div className="flex flex-col gap-3">
          <button className="text-sm text-gray-400 hover:text-klein-blue flex justify-end items-center gap-1 transition-colors self-end cursor-default">设置 <Settings size={16} /></button>
          <button onClick={onGoToInfo} className="text-sm text-gray-400 hover:text-klein-blue flex items-center gap-1 transition-colors">回到卷首 <ArrowUp size={16} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-6">
        <Reorder.Group 
          axis="y" 
          values={items} 
          onReorder={handleReorder}
          className="space-y-4"
        >
          {items.map((item, visualIndex) => (
            <SortableItem 
              key={item.id} 
              item={item} 
              visualIndex={visualIndex} 
              setCurrentQuestionIndex={setCurrentQuestionIndex} 
            />
          ))}
        </Reorder.Group>
      </div>

      <motion.div
        className="p-6 bg-white/40 border-t border-white/40 flex items-center shrink-0 z-20 backdrop-blur-md gap-4"
      >
        <button
          onClick={() => setShowPublishConfirm(true)}
          className="flex-1 bg-klein-blue hover:bg-klein-blue-light text-white font-bold text-lg py-3 rounded-xl transition-all shadow-md shadow-klein-blue/30 flex justify-center items-center gap-2"
        >
          <Rocket size={20} /> 确认并发布
        </button>
        <button
          onClick={addNewQuestion}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold text-lg py-3 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2"
        >
          <Plus size={20} /> 添加题目
        </button>
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {showPublishConfirm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowPublishConfirm(false)}
              className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-auto"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2, type: "spring", bounce: 0.3 }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-klein-blue/10 text-klein-blue rounded-full flex items-center justify-center mb-4">
                  <Rocket size={24} />
                </div>
                <h3 className="text-xl font-extrabold text-gray-800 mb-2">确定要发布吗？</h3>
                <p className="text-gray-500 text-center text-sm mb-6">发布之后将无法修改任何内容。</p>
                
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowPublishConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      setShowPublishConfirm(false);
                      setTimeout(() => {
                        onPublish();
                      }, 200);
                    }}
                    className="flex-1 py-2.5 rounded-xl text-white bg-klein-blue hover:bg-klein-blue-light font-bold shadow-md shadow-klein-blue/20 transition-all"
                  >
                    确认发布
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}
