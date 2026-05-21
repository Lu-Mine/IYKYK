import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, Reorder, AnimatePresence, useDragControls } from "motion/react";
import { GripVertical, Rocket, ArrowUp, Plus, Settings } from "lucide-react";
import { getScoreStyles } from "../../lib/quizUtils";
import { ScrollArea } from "../ui/ScrollArea";
import ConfirmModal from "../ui/ConfirmModal";

interface Props {
  questions: string[];
  hostScores: number[];
  setQuestions: (q: string[]) => void;
  setHostScores: (s: number[]) => void;
  setCurrentQuestionIndex: (idx: number) => void;
  onPublish: () => void;
  onGoToInfo: () => void;
  addNewQuestion: () => void;
  settings: {
    allowRepeat: boolean;
    showAnalysis: boolean;
    shuffleQuestions: boolean;
  };
  setSettings: React.Dispatch<React.SetStateAction<{
    allowRepeat: boolean;
    showAnalysis: boolean;
    shuffleQuestions: boolean;
  }>>;
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
        className="w-10 bg-gray-50/80 flex items-center justify-center cursor-grab text-gray-400 group-hover:text-klein-blue/50 transition-colors border-r border-gray-100/50 touch-none"
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

export default function CreateOverviewView({ questions, hostScores, setQuestions, setHostScores, setCurrentQuestionIndex, onPublish, onGoToInfo, addNewQuestion, settings, setSettings }: Props) {
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  


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
      <div className="pt-8 px-8 pb-4 shrink-0 border-b border-gray-100/50 bg-white/30 backdrop-blur-sm z-10 flex flex-col gap-3 relative">
        <div className="flex justify-between items-end w-full">
          <div className="max-w-[70%]">
            <h2 className="text-xl font-bold font-display text-klein-blue">完成试卷之前</h2>
            <p className="text-sm text-gray-500 mt-1">检查、编辑或拖拽调整题目</p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <button onClick={() => setShowSettingsModal(true)} className="text-sm text-gray-400 hover:text-klein-blue flex justify-end items-center gap-1 transition-colors self-end cursor-pointer">设置 <Settings size={16} /></button>
            <button onClick={onGoToInfo} className="text-sm text-gray-400 hover:text-klein-blue flex items-center gap-1 transition-colors">回到卷首 <ArrowUp size={16} /></button>
          </div>
        </div>
        <p className="text-sm text-gray-400 flex items-center gap-1.5 leading-relaxed mt-1">
          <span className="text-klein-blue/70">💡</span> 
          可点击右上角“设置”修改答题规则，<br/>
          或点击“回到卷首”并重新编辑问卷基础信息。
        </p>
      </div>

      <ScrollArea className="flex-1 custom-scrollbar" contentClassName="p-6 pb-8 relative">
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
      </ScrollArea>

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
          <ConfirmModal
            key="publish-overview-confirm-modal"
            isOpen={showPublishConfirm}
            onClose={() => setShowPublishConfirm(false)}
            onConfirm={() => {
              setShowPublishConfirm(false);
              setTimeout(() => {
                onPublish();
              }, 200);
            }}
            title="确定要发布吗？"
            description="发布之后将无法修改任何内容。"
            theme="blue"
            icon={<Rocket size={24} />}
            confirmText="确认发布"
          />
        </AnimatePresence>,
        document.body
      )}

      {createPortal(
        <AnimatePresence>
          {showSettingsModal && (
            <div key="settings-overview-modal-overlay" className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSettingsModal(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.38, bounce: 0.15 }}
                className="bg-white/95 rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-white/80 backdrop-blur-lg relative z-10 flex flex-col items-center"
              >
                <div className="flex flex-col items-center mb-6 w-full text-center">
                  <div className="w-12 h-12 rounded-2xl bg-klein-blue/10 flex items-center justify-center text-klein-blue mb-3">
                    <Settings className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-800">问卷设置</h3>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-[0.1em] font-sans">Quiz Settings</p>
                </div>

                <div className="w-full space-y-5 mb-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col text-left">
                      <span className="text-base font-bold text-gray-800">再来一次</span>
                      <span className="text-xs text-gray-500 leading-normal mt-0.5">
                        是否允许用户重复完成试卷。默认打开。若关闭，同一用户名、浏览器或IP仅支持提交一次。
                      </span>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, allowRepeat: !prev.allowRepeat }))}
                      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors outline-none shrink-0 ${
                        settings.allowRepeat ? "bg-klein-blue" : "bg-gray-300"
                      }`}
                    >
                      <motion.div
                        layout
                        className="bg-white w-4 h-4 rounded-full shadow-sm"
                        animate={{ x: settings.allowRepeat ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col text-left">
                      <span className="text-base font-bold text-gray-800">展示解析</span>
                      <span className="text-xs text-gray-500 leading-normal mt-0.5">
                        是否在答题结果页面显示解析。若关闭，就不向答题者展示打分差异情况。
                      </span>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, showAnalysis: !prev.showAnalysis }))}
                      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors outline-none shrink-0 ${
                        settings.showAnalysis ? "bg-klein-blue" : "bg-gray-300"
                      }`}
                    >
                      <motion.div
                        layout
                        className="bg-white w-4 h-4 rounded-full shadow-sm"
                        animate={{ x: settings.showAnalysis ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col text-left">
                      <span className="text-base font-bold text-gray-800">题目乱序</span>
                      <span className="text-xs text-gray-500 leading-normal mt-0.5">
                        是否开启题目乱序。开启后，答题者打开试卷的题目顺序会被打乱。
                      </span>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, shuffleQuestions: !prev.shuffleQuestions }))}
                      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors outline-none shrink-0 ${
                        settings.shuffleQuestions ? "bg-klein-blue" : "bg-gray-300"
                      }`}
                    >
                      <motion.div
                        layout
                        className="bg-white w-4 h-4 rounded-full shadow-sm"
                        animate={{ x: settings.shuffleQuestions ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full bg-klein-blue hover:bg-klein-blue-light text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md shadow-klein-blue/20"
                >
                  确认
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}
