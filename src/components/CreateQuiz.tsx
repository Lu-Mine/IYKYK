import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Settings2, Edit2, Check, Share, Image as ImageIcon, Rocket } from "lucide-react";
import { saveQuizToVercel } from "../services/api";
import { PRESET_QUESTIONS } from "../constants";
import { getRandomQuestions } from "../lib/quizUtils";

// Subcomponents
import CreateInfoView from "./views/CreateInfoView";
import CreateQuestionView from "./views/CreateQuestionView";
import CreateOverviewView from "./views/CreateOverviewView";
import CreateResultView from "./views/CreateResultView";

export type CreateStep = "info" | "quiz" | "overview" | "result";

interface CreateQuizProps {
  onExit: () => void;
  onStepChange?: (step: CreateStep) => void;
  key?: string;
  isAIStudio?: boolean;
}

export default function CreateQuiz({ onExit, onStepChange, isAIStudio }: CreateQuizProps) {
  const [step, setStep] = useState<CreateStep>("info");
  
  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);
  const [hostName, setHostName] = useState("Mysterious");
  const lastActiveHostNameRef = useRef(hostName);
  const [secret, setSecret] = useState("");
  const [title, setTitle] = useState("这一次，由我来定义自己。");
  const [description, setDescription] = useState("欢迎来到出题模式！\n作为出题者，你可以自由添加你想要的测试题，设置你对自己的评价分数。\n这套问卷将打破常规的本地刻板印象，你可以随意编辑你的考察细节，最终所有的结果都将属于最真实的你。");
  const [questions, setQuestions] = useState<string[]>([]);
  const [hostScores, setHostScores] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleDebugFill = () => {
    if (!isAIStudio) return;
    setSecret("Lumine1234");
    setQuestions(getRandomQuestions(PRESET_QUESTIONS, 10));
    const randomScores = Array.from({ length: 10 }, () => Math.floor(Math.random() * 5) + 1);
    setHostScores(randomScores);
    setStep("overview");
  };

  const [isPublishing, setIsPublishing] = useState(false);
  const [userid, setUserid] = useState<string | null>(null);

  const handleQuickStart = () => {
    if (!secret.trim()) return; // Validation is done in InfoView, but double check
    lastActiveHostNameRef.current = hostName;
    setQuestions(getRandomQuestions(PRESET_QUESTIONS, 10).map(q => q.replace(/他/g, hostName)));
    setHostScores(new Array(10).fill(0));
    setStep("quiz");
  };

  const handleStart = () => {
    if (!secret.trim()) return;
    if (questions.length === 0) {
      setQuestions([""]);
      setHostScores([0]);
    } else if (lastActiveHostNameRef.current && hostName && lastActiveHostNameRef.current !== hostName) {
      setQuestions(prev => prev.map(q => q.split(lastActiveHostNameRef.current).join(hostName)));
    }
    lastActiveHostNameRef.current = hostName;
    setStep("quiz");
  };

  const updateQuestion = (index: number, text: string) => {
    const newQ = [...questions];
    newQ[index] = text;
    setQuestions(newQ);
  };

  const updateScore = (index: number, score: number) => {
    const newS = [...hostScores];
    newS[index] = score;
    setHostScores(newS);
  };

  const addNewQuestion = () => {
    setQuestions([...questions, ""]);
    setHostScores([...hostScores, 0]);
    setCurrentQuestionIndex(questions.length);
  };

  const finishQuiz = () => {
    // filter out empty questions
    const validQuestions = [];
    const validScores = [];
    for (let i = 0; i < questions.length; i++) {
        if (questions[i].trim() && hostScores[i] > 0) {
            validQuestions.push(questions[i]);
            validScores.push(hostScores[i]);
        }
    }
    setQuestions(validQuestions);
    setHostScores(validScores);
    setStep("overview");
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    const start = Date.now();
    
    try {
        const payload = { hostName, secret, title, description, questions, hostScores };
        const id = await saveQuizToVercel(payload);
        setUserid(id);
    } catch(err) {
        console.error(err);
    }

    const elapsed = Date.now() - start;
    if (elapsed < 1000) {
        await new Promise(r => setTimeout(r, 1000 - elapsed));
    }
    
    setIsPublishing(false);
    setStep("result");
  };

  const hasEditedQuestions = questions.some((q, i) => q.trim() !== "" || hostScores[i] !== 0);

  return (
    <motion.div
      layout
      key="create-quiz-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.4, ease: "easeOut" } }}
      exit={{ opacity: 0, y: 50, transition: { duration: 0.4, ease: "easeIn" } }}
      className="flex flex-col flex-1 w-full h-full min-h-0 select-none"
    >
      {isAIStudio && step !== "result" && createPortal(
        <button 
          onClick={handleDebugFill} 
          className="fixed top-4 right-4 z-50 p-2 sm:p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-klein-blue hover:text-klein-blue-light hover:bg-white transition-all transform hover:scale-105 pointer-events-auto"
          title="Auto-fill debug data"
        >
          <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>,
        document.body
      )}
      <AnimatePresence mode="popLayout">
        {step === "info" && (
          <motion.div layout key="info" className="flex flex-col flex-1 w-full min-h-0 relative" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.3 }}>
            <CreateInfoView 
              hostName={hostName}
              setHostName={setHostName}
              secret={secret}
              setSecret={setSecret}
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              hasEditedQuestions={hasEditedQuestions}
              onStart={handleStart}
              onQuickStart={handleQuickStart}
              onExit={onExit}
              isAIStudio={isAIStudio}
              onDebugFill={handleDebugFill}
            />
          </motion.div>
        )}

        {step === "quiz" && (
          <motion.div layout key="quiz" className="flex flex-col flex-1 w-full min-h-0 relative" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
            <CreateQuestionView
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              questions={questions}
              hostScores={hostScores}
              hostName={hostName}
              updateQuestion={updateQuestion}
              updateScore={updateScore}
              addNewQuestion={addNewQuestion}
              finishQuiz={finishQuiz}
              onGoToInfo={() => setStep("info")}
            />
          </motion.div>
        )}

        {step === "overview" && (
          <motion.div layout key="overview" className="flex flex-col flex-1 w-full min-h-0 relative" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
            <CreateOverviewView
              questions={questions}
              hostScores={hostScores}
              setQuestions={setQuestions}
              setHostScores={setHostScores}
              setCurrentQuestionIndex={(idx) => {
                 setCurrentQuestionIndex(idx);
                 setStep("quiz");
              }}
              onPublish={handlePublish}
              onGoToInfo={() => setStep("info")}
              addNewQuestion={() => {
                addNewQuestion();
                setStep("quiz");
              }}
            />
          </motion.div>
        )}

        {step === "result" && (
          <motion.div layout key="result" className="flex flex-col flex-1 w-full min-h-0 relative" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
            <CreateResultView
              hostName={hostName}
              secret={secret}
              title={title}
              description={description}
              questions={questions}
              hostScores={hostScores}
              onExit={onExit}
              userid={userid}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPublishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/50 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="relative flex justify-center items-center">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#002FA7"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </svg>
            </div>
            <p className="mt-4 text-klein-blue font-medium tracking-widest text-sm">发布中...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
