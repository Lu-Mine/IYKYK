import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { ArrowLeft, Home, Rocket, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HOST_NAME, HOST_SCORES, QUESTIONS } from "./constants";
import { calculateResultScore } from "./lib/quizUtils";
import HomeView, { HomeGreenWindow } from "./components/views/HomeView";
import QuizView from "./components/views/QuizView";
import OverviewView from "./components/views/OverviewView";
import ResultView from "./components/views/ResultView";
import CreateQuiz from "./components/CreateQuiz";

type ViewState = "home" | "quiz" | "overview" | "result";

const WaveBackground = ({ active }: { active: boolean }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div 
        className="absolute top-0 left-0 origin-top-left pointer-events-none"
        style={{ transform: 'rotate(45deg)' }}
      >
        {/* Large container to cover all diagonals of the screen */}
        <div className="absolute top-[-100vmax] left-0 h-[250vmax] w-[250vmax]">
          
          {/* Layer 1 (bottom most, fastest) */}
          <motion.div
            initial={false}
            animate={{ x: active ? "0%" : "-100%" }}
            transition={{
              duration: active ? 1.0 : 1.5,
              ease: active ? [0.2, 0.8, 0.3, 1.0] : [0.4, 0.0, 0.2, 1.0],
            }}
            className="absolute top-0 bottom-0 left-0 w-full will-change-transform"
          >
            <div className="absolute top-0 bottom-0 left-0 w-[120vmax] bg-[#eef4f9]" />
            <div 
              className="absolute top-0 bottom-0 left-[120vmax] w-[40vmax] origin-left animate-wave-breathe-1 will-change-transform"
            >
              <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="w-full h-full text-[#eef4f9]" style={{ overflow: "visible" }}>
                <path fill="currentColor" d="M0,0 C80,250 120,500 50,750 C10,850 60,950 0,1000 Z" />
              </svg>
            </div>
          </motion.div>

          {/* Layer 2 (middle) */}
          <motion.div
            initial={false}
            animate={{ x: active ? "0%" : "-100%" }}
            transition={{
              duration: active ? 1.25 : 1.1,
              ease: active ? [0.2, 0.8, 0.3, 1.0] : [0.4, 0.0, 0.2, 1.0],
            }}
            className="absolute top-0 bottom-0 left-0 w-full will-change-transform"
          >
            <div className="absolute top-0 bottom-0 left-0 w-[110vmax] bg-[#e4eff7]" />
            <div 
              className="absolute top-0 bottom-0 left-[106vmax] w-[45vmax] origin-left animate-wave-breathe-2 will-change-transform"
            >
              <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="w-full h-full text-[#e4eff7]" style={{ overflow: "visible" }}>
                <path fill="currentColor" d="M0,0 C120,300 20,600 70,800 C100,900 40,950 0,1000 Z" />
              </svg>
            </div>
          </motion.div>

          {/* Layer 3 (top most, slowest) */}
          <motion.div
            initial={false}
            animate={{ x: active ? "0%" : "-100%" }}
            transition={{
              duration: active ? 1.5 : 0.7,
              ease: active ? [0.2, 0.8, 0.3, 1.0] : [0.4, 0.0, 0.2, 1.0],
            }}
            className="absolute top-0 bottom-0 left-0 w-full will-change-transform"
          >
            <div className="absolute top-0 bottom-0 left-0 w-[100vmax] bg-gradient-to-br from-[#dce8f5] via-[#cadff5] to-[#b6d2f0]" />
            <div 
              className="absolute top-0 bottom-0 left-[96vmax] w-[40vmax] origin-left animate-wave-breathe-3 will-change-transform"
            >
              <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="w-full h-full" style={{ overflow: "visible" }}>
                <defs>
                  <linearGradient id="wave-grad-4" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#dce8f5" />
                    <stop offset="50%" stopColor="#cadff5" />
                    <stop offset="100%" stopColor="#b6d2f0" />
                  </linearGradient>
                </defs>
                <path fill="url(#wave-grad-4)" d="M0,0 C40,200 120,500 30,700 C-10,800 60,950 0,1000 V0 Z" />
              </svg>
            </div>
          </motion.div>
        
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<ViewState>("home");
  const [isCreatingMode, setIsCreatingMode] = useState(false);
  const hasSwitchedMode = useRef(false);
  const [createStep, setCreateStep] = useState<string>("info");
  const [userName, setUserName] = useState("");
  const [quizData, setQuizData] = useState({
    questions: QUESTIONS,
    hostScores: HOST_SCORES,
    hostName: HOST_NAME,
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userScores, setUserScores] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [direction, setDirection] = useState(1);
  const [savedResult, setSavedResult] = useState<{
    userName: string;
    userScores: number[];
    timeSpentMessage: string | null;
    isSkipped: boolean;
  } | null>(null);
  const startTimeRef = useRef<number>(0);
  const [timeSpentMessage, setTimeSpentMessage] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [isInitialSnakeDone, setIsInitialSnakeDone] = useState(false);

  const [commitHash, setCommitHash] = useState("main");

  useEffect(() => {
    fetch('https://api.github.com/repos/Lu-Mine/IYKYK/commits/main')
      .then(res => res.json())
      .then(data => {
        if (data && data.sha) {
          setCommitHash(data.sha.substring(0, 7));
        }
      })
      .catch(console.error);
  }, []);

  const isAIStudio = useMemo(() => {
    return window.location.hostname.includes("run.app") || window.location.hostname.includes("ai.studio") || window.location.hostname.includes("google");
  }, []);

  const totalQuestions = quizData.questions.length;

  const calculateResult = useCallback(() => {
    return calculateResultScore(userScores, quizData.hostScores, totalQuestions);
  }, [userScores, totalQuestions, quizData.hostScores]);

  const handleSubmit = useCallback(() => {
    if (userScores.length !== totalQuestions || userScores.some((s) => s === undefined)) return;
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      const result = calculateResult();
      setTimeout(() => {
        setIsInitialSnakeDone(false);
        setView("result");
        if (result === 100) {
          const duration = 3 * 1000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
      
          const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
      
          const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
      
            const particleCount = 50 * (timeLeft / duration);
            confetti({
              ...defaults, particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
              ...defaults, particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
          }, 250);
        } else if (result >= 85) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      }, 200);
    }, 800);
  }, [userScores, totalQuestions, calculateResult]);

  const triggerSecretPass = useCallback(() => {
    setQuizData({
      questions: QUESTIONS,
      hostScores: HOST_SCORES,
      hostName: HOST_NAME,
    });
    setUserScores([...HOST_SCORES]);
    setTimeSpentMessage(null);
    setIsReviewing(true);
    setView("overview");
    setIsTransitioning(false);
    setIsSkipped(true);
  }, []);

  useEffect(() => {
    let keys = "";
    const handleKeyDownStr = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
         return; 
      }
      keys += e.key.toLowerCase();
      if (keys.length > 20) keys = keys.slice(-20);
      if (keys.includes("ifyouknowyouknow")) {
        triggerSecretPass();
        keys = "";
      }
    };
    window.addEventListener("keydown", handleKeyDownStr);
    return () => window.removeEventListener("keydown", handleKeyDownStr);
  }, [triggerSecretPass]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      
      if (e.key === 'Backspace') {
        if (view === 'quiz') {
          handlePrev();
        } else if (view === 'overview') {
          setView('quiz'); 
        }
      } else if (e.key === 'Enter') {
        if (view === 'home' && userName.trim()) {
           handleStart();
        } else if (view === 'overview') {
           handleSubmit();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, currentQuestion, userName, userScores, isTransitioning, handleSubmit]);

  useEffect(() => {
    document.title = `IYKYK | 来自 ${quizData.hostName} 的 Quiz`;
  }, [quizData.hostName]);

  const handleStart = () => {
    if (!userName.trim()) return;

    setView("quiz");
    setCurrentQuestion(0);
    setUserScores([]);
    setSavedResult(null);
    setIsTransitioning(false);
    setIsReviewing(false);
    setDirection(1);
    startTimeRef.current = Date.now();
    setTimeSpentMessage(null);
    setIsSkipped(false);
  };

  const handleScore = useCallback(
    (score: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setDirection(1);

      setUserScores((prevScores) => {
        const newScores = [...prevScores];
        newScores[currentQuestion] = score;
        return newScores;
      });

      if (isReviewing) {
        setTimeout(() => {
          setView("overview");
          setIsTransitioning(false);
        }, 300);
        return;
      }

      if (currentQuestion < totalQuestions - 1) {
        setTimeout(() => {
          setCurrentQuestion((prev) => prev + 1);
          setIsTransitioning(false);
        }, 300);
      } else {
        setTimeout(() => {
          const timeSpent = Date.now() - startTimeRef.current;
          if (timeSpent < 40000) {
            setTimeSpentMessage("做这么快？你认真了吗🙂。");
          } else if (timeSpent > 120000) {
            setTimeSpentMessage("思考了好久啊。在你眼中我是谁🙂？");
          } else {
            setTimeSpentMessage(null);
          }
          setIsReviewing(true);
          setView("overview");
          setIsTransitioning(false);
        }, 300);
      }
    },
    [isTransitioning, currentQuestion, totalQuestions, isReviewing],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== "quiz" || isTransitioning) return;

      const keyMap: Record<string, number> = {
        Digit1: 1, Numpad1: 1, "1": 1,
        Digit2: 2, Numpad2: 2, "2": 2,
        Digit3: 3, Numpad3: 3, "3": 3,
        Digit4: 4, Numpad4: 4, "4": 4,
        Digit5: 5, Numpad5: 5, "5": 5,
        Digit6: 6, Numpad6: 6, "6": 6,
        Digit7: 7, Numpad7: 7, "7": 7,
      };

      const score = keyMap[e.code] || keyMap[e.key];
      if (score !== undefined) {
        handleScore(score);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view, isTransitioning, handleScore]);

  const handlePrev = () => {
    if (currentQuestion > 0 && !isTransitioning) {
      setDirection(-1);
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const resetToHome = () => {
    if (view === "result") {
      setSavedResult({ userName, userScores, timeSpentMessage, isSkipped });
    }
    setUserName("");
    setUserScores([]);
    setCurrentQuestion(0);
    setView("home");
    setIsReviewing(false);
    setDirection(1);
    setIsSkipped(false);
  };

  const restartQuiz = () => {
    if (view === "result") {
      setSavedResult({ userName, userScores, timeSpentMessage, isSkipped });
    }

    setUserScores([]);
    setCurrentQuestion(0);
    setView("quiz");
    setIsReviewing(false);
    setDirection(1);
    startTimeRef.current = Date.now();
    setTimeSpentMessage(null);
    setIsSkipped(false);
  };

  const restoreResult = () => {
    if (savedResult) {
      setUserName(savedResult.userName);
      setUserScores(savedResult.userScores);
      setTimeSpentMessage(savedResult.timeSpentMessage);
      setIsSkipped(savedResult.isSkipped);
      setIsInitialSnakeDone(false);
      setView("result");
    }
  };

  return (
    <div className={`h-[100dvh] text-gray-dark font-sans flex flex-col items-center px-4 pt-6 pb-6 sm:px-8 sm:pt-12 sm:pb-12 overflow-hidden w-full relative transition-[padding] duration-500 ease-out ${isCreatingMode ? 'theme-blue selection:bg-klein-blue selection:text-white' : 'selection:bg-green-forest selection:text-white'}`}>
      {/* Background elements */}
      <div 
        className="absolute inset-0 z-0 bg-[length:300%_300%] animate-bg-pan bg-gradient-to-br from-[#d4e0c1] via-[#f7f9f4] to-[#b5cca1]"
      />
      <WaveBackground active={isCreatingMode} />
      
      {isAIStudio && !isCreatingMode && (
        <button
          onClick={triggerSecretPass}
          className="fixed top-4 right-4 z-50 p-2 sm:p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-green-600 hover:text-green-500 hover:bg-white transition-all transform hover:scale-105"
          title="Super Fast Pass"
        >
          <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}
      <div className="flex-1 min-h-0 w-full z-10" />
      <motion.div 
        layout
        className="relative w-full max-w-[480px] flex flex-col min-h-0 shrink z-10"
        style={{ 
          maxHeight: "100%"
        }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="w-full relative flex-1 flex flex-col min-h-0">
          <AnimatePresence mode="popLayout" initial={false}>
            {isCreatingMode ? (
              <motion.div
                layout
                key="create-mode-container"
                initial={{ x: "-150vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1, transition: { delay: 0.75, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }}
                exit={{ x: "-150vw", opacity: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }}
                className="w-full h-full flex flex-col min-h-0"
              >
                <div className="w-full h-full bg-white/60 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-xl overflow-hidden flex flex-col relative z-10 min-h-0">
                  <CreateQuiz key="create-quiz" onExit={() => { hasSwitchedMode.current = true; setIsCreatingMode(false) }} onStepChange={setCreateStep} isAIStudio={isAIStudio} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                layout
                key="solve-mode-container"
                initial={{ x: "150vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1, transition: { delay: 0.75, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }}
                exit={{ x: "150vw", opacity: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }}
                className="w-full h-full flex flex-col min-h-0 relative"
              >
                <motion.div 
                  layout 
                  initial={false} 
                  animate={{ height: view === 'home' ? '2.5rem' : '0rem' }} 
                  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }} 
                  className="w-full shrink-0" 
                />
                <AnimatePresence>
                  {view === "home" && (
                    <HomeGreenWindow commitHash={commitHash} delay={0} />
                  )}
                </AnimatePresence>

                <div className="w-full h-full bg-white/60 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-xl overflow-hidden flex flex-col relative z-10 min-h-0">
                  <AnimatePresence mode="popLayout">
                    {view === "home" && (
                    <HomeView 
                      hostName={quizData.hostName} 
                      userName={userName} 
                      setUserName={setUserName} 
                      handleStart={handleStart}
                      onEnterCreateMode={() => { hasSwitchedMode.current = true; setIsCreatingMode(true) }}
                    />
                  )}

                  {view === "quiz" && (
                    <QuizView
                      currentQuestion={currentQuestion}
                      totalQuestions={totalQuestions}
                      questions={quizData.questions}
                      direction={direction}
                      userScores={userScores}
                      isTransitioning={isTransitioning}
                      handleScore={handleScore}
                      handlePrev={handlePrev}
                    />
                  )}

                  {view === "overview" && (
                    <OverviewView
                      questions={quizData.questions}
                      userScores={userScores}
                      hostName={quizData.hostName}
                      setCurrentQuestion={setCurrentQuestion}
                      setView={setView}
                      handleSubmit={handleSubmit}
                    />
                  )}

                  {isEvaluating && (
                    <motion.div 
                      key="evaluating"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-white/60 backdrop-blur-md z-50 flex flex-col items-center justify-center rounded-3xl"
                    >
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
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
                            stroke="#22c55e"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray="251.2"
                            initial={{ strokeDashoffset: 251.2 }}
                            animate={{ strokeDashoffset: 0 }}
                            transition={{ duration: 1, ease: "linear" }}
                          />
                        </svg>
                      </div>
                      <p className="mt-4 text-green-dark font-medium tracking-widest text-sm">比较中...</p>
                    </motion.div>
                  )}

                  {view === "result" && (
                    <ResultView
                      quizData={quizData}
                      userScores={userScores}
                      userName={userName}
                      isSkipped={isSkipped}
                      timeSpentMessage={timeSpentMessage}
                      resetToHome={resetToHome}
                      restartQuiz={restartQuiz}
                      isInitialSnakeDone={isInitialSnakeDone}
                      setIsInitialSnakeDone={setIsInitialSnakeDone}
                    />
                  )}
                </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>

      <div className="flex-1 w-full max-w-[480px] flex flex-col justify-start relative z-10 pointer-events-none">
        <AnimatePresence>
          {!isCreatingMode && view === "home" && savedResult && (
            <motion.div 
              key="home-recover"
              initial={{ opacity: 0, y: 16, pointerEvents: "none" }}
              animate={{ opacity: 1, y: 0, pointerEvents: "auto" }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ delay: 0.35, duration: 0.25, ease: "easeOut" }}
              className="pt-6 flex justify-center pointer-events-auto"
            >
              <button
                onClick={restoreResult}
                className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors flex items-center gap-1.5 px-4 py-2 rounded-full hover:bg-green-dark/5"
              >
                <ArrowLeft size={16} />
                找回刚才的结果
              </button>
            </motion.div>
          )}

          {!isCreatingMode && view === "quiz" && currentQuestion === 0 && !isReviewing && (
            <motion.div 
              key="quiz-recover"
              initial={{ opacity: 0, y: 16, pointerEvents: "none" }}
              animate={{ opacity: 1, y: 0, pointerEvents: "auto" }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ delay: 0.35, duration: 0.25, ease: "easeOut" }}
              className="pt-6 flex justify-center gap-4 pointer-events-auto"
            >
              {savedResult && (
                <button
                  onClick={restoreResult}
                  className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors flex items-center gap-1.5 px-4 py-2 rounded-full hover:bg-green-dark/5"
                >
                  <ArrowLeft size={16} />
                  找回刚才的结果
                </button>
              )}
              <button
                onClick={resetToHome}
                className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors flex items-center gap-1.5 px-4 py-2 rounded-full hover:bg-green-dark/5"
              >
                <Home size={16} />
                回到主页
              </button>
            </motion.div>
          )}

          {isCreatingMode && createStep === "result" && (
            <motion.div 
              key="create-result-home"
              initial={{ opacity: 0, y: 16, pointerEvents: "none" }}
              animate={{ opacity: 1, y: 0, pointerEvents: "auto" }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ delay: 5.0, duration: 0.8, ease: "easeOut" }}
              className="pt-6 flex justify-center gap-4 pointer-events-auto"
            >
              <button
                onClick={() => setIsCreatingMode(false)}
                className="text-sm font-medium text-klein-blue hover:text-klein-blue-light transition-colors flex items-center gap-1.5 px-4 py-2 rounded-full hover:bg-klein-blue/5"
              >
                <Home size={16} />
                回到主页
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
