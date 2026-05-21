import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Edit2, ArrowLeft, Home, Rocket, Zap } from "lucide-react";
import { ScrollArea } from "../ui/ScrollArea";
import ConfirmModal from "../ui/ConfirmModal";

interface Props {
  hostName: string;
  setHostName: (val: string) => void;
  secret: string;
  setSecret: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  hasEditedQuestions: boolean;
  onStart: () => void;
  onExit: () => void;
  onQuickStart: () => void;
  isAIStudio?: boolean;
  onDebugFill?: () => void;
}

export default function CreateInfoView({ hostName, setHostName, secret, setSecret, title, setTitle, description, setDescription, hasEditedQuestions, onStart, onQuickStart, onExit, isAIStudio, onDebugFill }: Props) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [showSecretError, setShowSecretError] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const isSecretValid = (s: string) => {
    if (s.length < 8) return false;
    if (/^\d+$/.test(s)) return false;
    if (/^[A-Z]+$/.test(s)) return false;
    if (/^[a-z]+$/.test(s)) return false;
    return true;
  };

  const handleSecretBlur = () => {
    if (secret.length > 0 && !isSecretValid(secret)) {
      setShowSecretError(true);
      setTimeout(() => setShowSecretError(false), 3000);
    } else {
      setShowSecretError(false);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (descRef.current && isEditingDesc) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = (descRef.current.scrollHeight) + "px";
    }
  }, [description, isEditingDesc]);


  return (
    <motion.div
      layout
      key="create_info"
      initial="enter"
      animate="center"
      exit="exit"
      variants={{
        enter: { opacity: 0 },
        center: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
        exit: { opacity: 0, transition: { staggerChildren: 0.02, staggerDirection: -1, duration: 0.17 } },
      }}
      className="flex flex-col flex-1 w-full min-h-0 overflow-hidden"
    >
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => {
            if (hasEditedQuestions) setShowExitConfirm(true);
            else onExit();
          }} 
          className="text-sm font-medium text-gray-400 hover:text-klein-blue flex items-center gap-1 transition-colors px-2 py-1 rounded-lg"
        >
          <ArrowLeft size={16} /> 返回
        </button>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => {
            if (isSecretValid(secret)) onQuickStart();
            else {
              setShowSecretError(true);
              setTimeout(() => setShowSecretError(false), 3000);
            }
          }} 
          className="text-sm font-medium text-klein-blue border border-klein-blue/30 bg-klein-blue/5 hover:bg-klein-blue/10 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full shadow-sm"
        >
          快速开始 <Zap size={14} className="fill-current" />
        </button>
      </div>

      <ScrollArea className="flex-1 custom-scrollbar mt-6" contentClassName="p-8 pb-10 flex flex-col relative min-h-full">
        <div className="my-auto w-full">
          <motion.div variants={{ enter: { opacity: 0, y: 15 }, center: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -5 } }} className="mb-5 w-full">
            <div className="text-left mb-5 flex items-center flex-wrap gap-2">
              <span className="select-none font-sans text-base text-gray-500 not-italic font-medium">
                Creator{" "}
              </span>
              {isEditingName ? (
                <input
                  autoFocus
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  className="select-text font-[Cambria,'Caladea',ui-serif,Georgia,'Times_New_Roman',Times,serif] text-2xl tracking-wide text-klein-blue italic bg-transparent border-b border-klein-blue focus:outline-none w-32 relative -top-[2px]"
                />
              ) : (
                <div className="flex items-center gap-2 group relative">
                  <span className="font-[Cambria,'Caladea',ui-serif,Georgia,'Times_New_Roman',Times,serif] text-2xl tracking-wide text-klein-blue italic relative -top-[2px]">
                    {hostName}
                  </span>
                  <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-klein-blue transition-colors relative -top-[2px]">
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
              <span className="font-sans text-base text-gray-500 not-italic font-medium">
                {" "}:
              </span>
            </div>
            
            <div className="group relative">
              {isEditingTitle ? (
                <input
                  autoFocus
                  type="text"
                  maxLength={12}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  className="select-text w-full text-2xl font-bold font-display text-klein-blue text-center leading-snug bg-transparent border-b border-klein-blue focus:outline-none transition-colors px-2 py-1"
                  placeholder="试卷标题"
                />
              ) : (
                <div className="flex justify-center">
                  <div className="relative inline-flex items-center">
                    <h1 className="text-2xl font-bold font-display text-klein-blue text-center leading-snug px-2 py-1">
                      {title || "试卷标题"}
                    </h1>
                    <button 
                      onClick={() => setIsEditingTitle(true)} 
                      className="absolute -right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-klein-blue transition-colors p-1.5"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          
          <motion.div variants={{ enter: { opacity: 0, y: 15 }, center: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -5 } }} className="leading-relaxed space-y-4">
            <div className="relative group">
              {isEditingDesc ? (
                <textarea
                  ref={descRef}
                  autoFocus
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => setIsEditingDesc(false)}
                  className="select-text w-full text-sm text-gray-600 text-justify tracking-tight bg-white/40 backdrop-blur-sm border border-klein-blue/30 focus:border-klein-blue/50 rounded-xl resize-none overflow-hidden outline-none p-3 transition-colors shadow-inner"
                  placeholder="试卷简介..."
                />
              ) : (
                <div className="relative">
                  <p className="text-sm text-gray-600 text-justify tracking-tight whitespace-pre-wrap p-2 -mx-2">
                    {description || "试卷简介..."}
                  </p>
                  <button 
                    onClick={() => setIsEditingDesc(true)} 
                    className="absolute -top-2 -right-2 text-gray-400 hover:text-klein-blue transition-colors p-2"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <blockquote className="border-l-[3px] border-klein-blue/40 bg-klein-blue/5 rounded-r-md px-3 py-2 text-sm text-gray-800 text-justify tracking-tight">
              <b>出题须知：</b>
              <div className="my-2 text-sm font-normal text-gray-500">
                1. 点击页面上的铅笔可以修改对应文字。<br/>
                2. 至少添加一道题并自评。<br/>
                3. 设置一个密语，用于后续你在后台查看朋友们的答题结果。<br/><span className="text-red-600 font-extrabold">这个密语只会在成功上传试卷时显示一次！！</span><br/>
                4. 在试卷预览页面可以修改设置。
              </div>
            </blockquote>
          </motion.div>
        </div>
      </ScrollArea>

      <motion.div
        variants={{ enter: { opacity: 0, y: 20 }, center: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 10 } }}
        className="p-6 bg-white/40 border-t border-white/40 flex flex-col gap-3 flex-shrink-0 z-20 w-full backdrop-blur-md"
      >
        <input
          type="text"
          placeholder="设置密语 (至少8字符; 不可只有数字/大写/小写字母)"
          maxLength={20}
          className="select-text w-full px-4 py-3 rounded-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-klein-blue focus:border-transparent transition-all text-center bg-white/60 shadow-sm backdrop-blur-sm"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          onBlur={handleSecretBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (isSecretValid(secret)) onStart();
              else {
                setShowSecretError(true);
                setTimeout(() => setShowSecretError(false), 3000);
              }
            }
          }}
        />
        <button
          onClick={() => {
            if (isSecretValid(secret)) onStart();
          }}
          disabled={!isSecretValid(secret)}
          className="w-full bg-klein-blue hover:bg-klein-blue-light text-white font-bold text-lg py-3 rounded-xl transition-all shadow-md shadow-klein-blue/30 disabled:shadow-none disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {hasEditedQuestions ? "回到题目" : "添加题目"}
        </button>
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {showSecretError && (
            <motion.div
               initial={{ opacity: 0, y: -50 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -50 }}
               className="fixed top-6 left-0 right-0 z-[2000] flex justify-center pointer-events-none px-4"
            >
               <div className="bg-red-500 text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-medium shadow-red-500/30">
                 长度≥8，且不能全为数字/大写/小写字母
               </div>
            </motion.div>
          )}
          <ConfirmModal
            isOpen={showExitConfirm}
            onClose={() => setShowExitConfirm(false)}
            onConfirm={() => {
              setShowExitConfirm(false);
              setTimeout(() => {
                onExit();
              }, 200);
            }}
            title="确定要回主页吗？"
            description="不保留试卷内容，确定要回主页吗？"
            theme="red"
            icon={<Home size={24} />}
          />
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}
