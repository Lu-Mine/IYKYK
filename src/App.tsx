import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { ArrowLeft, Home, Rocket, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HOST_NAME, HOST_SCORES, QUESTIONS } from "./lib/constants";
import { calculateResultScore } from "./lib/quizUtils";
import { submitQuizResponse, fetchQuiz, fetchResults } from "./lib/api";
import HomeView, { HomeGreenWindow } from "./components/views/HomeView";
import QuizView from "./components/views/QuizView";
import OverviewView from "./components/views/OverviewView";
import ResultView from "./components/views/ResultView";
import CreateQuiz from "./components/CreateQuiz";
import ResultsListView from "./components/views/ResultsListView";

type ViewState = "home" | "quiz" | "overview" | "result" | "resultsList";

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
    userId: "",
    title: "你和我，见识同一个我吗？",
    description: "",
  });
  const [results, setResults] = useState<any[]>([]);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
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
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizLoadError, setQuizLoadError] = useState<string | null>(null);

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

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/customquiz\/([^/?#]+)/);
    const urlParams = new URLSearchParams(window.location.search);
    const searchId = urlParams.get('id');

    let quizId: string | null = null;
    if (match && match[1]) {
      quizId = decodeURIComponent(match[1]);
    } else if (searchId) {
      quizId = searchId;
    }
    
    if (quizId) {
      console.log('[App] Custom quiz URL detected. ID:', quizId);
      setIsLoadingQuiz(true);
      setQuizLoadError(null);

      // Add a safety timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (isLoadingQuiz) {
          console.warn('[App] Quiz loading timed out after 10s');
          setQuizLoadError('加载超时，请检查网络或刷新重试');
          setIsLoadingQuiz(false);
        }
      }, 10000);

      fetchQuiz(quizId)
        .then((data) => {
          clearTimeout(timeoutId);
          console.log('[App] Quiz fetch successful for host:', data.hostName || data.title);
          
          if (!data || (!data.questions && !data.title)) {
            throw new Error('INVALID_DATA');
          }

          setQuizData({
            questions: data.questions || QUESTIONS,
            hostScores: data.hostScores || HOST_SCORES,
            hostName: data.hostName || HOST_NAME,
            userId: data.userId || "",
            title: data.title || "你和我，见识同一个我吗？",
            description: data.description || "",
          });
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          console.error('[App] Quiz fetch failed:', err);
          if (err.message === 'QUIZ_NOT_FOUND') {
            setQuizLoadError('该试卷不存在或已被移除');
          } else if (err.message === 'INVALID_DATA') {
            setQuizLoadError('试卷数据损坏，无法加载');
          } else {
            setQuizLoadError('加载试卷失败，请稍后重试');
          }
        })
        .finally(() => {
          console.log('[App] Quiz loading sequence finished');
          setIsLoadingQuiz(false);
        });
    } else {
      console.log('[App] No custom quiz ID in path or parameters');
    }
  }, [window.location.pathname, window.location.search]);

  const isAIStudio = useMemo(() => {
    return window.location.hostname.includes("run.app") || window.location.hostname.includes("ai.studio") || window.location.hostname.includes("google");
  }, []);

  const totalQuestions = quizData.questions.length;

  const calculateResult = useCallback(() => {
    return calculateResultScore(userScores, quizData.hostScores, totalQuestions);
  }, [userScores, totalQuestions, quizData.hostScores]);

  const handleSubmit = useCallback(async () => {
    if (userScores.length !== totalQuestions || userScores.some((s) => s === undefined)) return;
    setIsEvaluating(true);
    
    // Attempt backend submission
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let quizId = urlParams.get('id');
      
      if (!quizId) {
        const path = window.location.pathname;
        if (path.includes('/customquiz/')) {
          quizId = path.split('/customquiz/')[1];
        }
      }
      
      quizId = quizId || 'default_quiz';
      
      console.log('Submitting response:', {
        quizId,
        participantName: userName,
        participantScores: userScores,
        scoresLength: userScores.length,
        totalQuestions
      });
      
      await submitQuizResponse({
        quizId,
        participantName: userName,
        participantScores: userScores,
        createdAt: new Date().toISOString(),
        deviceInfo: navigator.userAgent
      });
    } catch (error: any) {
      console.error('Failed to submit response to backend:', error.message);
      if (error.debug) {
        console.error('Debug info:', error.debug);
      }
    }

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
  }, [userScores, totalQuestions, calculateResult, userName]);

  const triggerSecretPass = useCallback(() => {
    setQuizData({
      questions: QUESTIONS,
      hostScores: HOST_SCORES,
      hostName: HOST_NAME,
      userId: "Lumine.local",
      title: "你和我，见识同一个我吗？",
      description: "这是调试模式下的默认试卷描述。",
    });
    setUserName("Debugger");
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

  const handleStart = (mode: ViewState | React.MouseEvent | any = "quiz") => {
    const targetMode = (typeof mode === "string" && ["home", "quiz", "overview", "result", "resultsList"].includes(mode)) 
      ? mode as ViewState 
      : "quiz";

    if (!userName.trim() && targetMode === "quiz") return;

    setView(targetMode);
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

  const handleViewResults = async (secret: string) => {
    setIsLoadingResults(true);
    setResultsError(null);
    try {
      const path = window.location.pathname;
      let quizId = 'default_quiz';
      if (path.includes('/customquiz/')) {
        quizId = path.split('/customquiz/')[1];
      }
      const data = await fetchResults(quizId, secret);
      setResults(data.results || []);
      setView("resultsList");
    } catch (err: any) {
      console.error('Fetch results failed:', err);
      setResultsError(err.message || '获取记录失败');
      throw err;
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleReviewResponse = (record: any) => {
    setReviewResult(record);
    setUserScores(record.participantScores);
    setIsReviewing(true);
    setView("overview");
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
                  {isLoadingQuiz ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
                      <p className="text-green-800 font-medium">正在加载定制试卷...</p>
                    </div>
                  ) : quizLoadError ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                      <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-4">
                        <Edit2 size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="font-bold">{quizLoadError}</p>
                      </div>
                      <button 
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2 bg-green-600 text-white rounded-full font-medium shadow-lg hover:bg-green-700 transition"
                      >
                        返回主页
                      </button>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                  {view === "home" && (
                    <HomeView 
                      hostName={quizData.hostName} 
                      title={quizData.title}
                      userId={quizData.userId}
                      description={quizData.description}
                      userName={userName} 
                      setUserName={setUserName} 
                      handleStart={handleStart}
                      onEnterCreateMode={() => { hasSwitchedMode.current = true; setIsCreatingMode(true) }}
                      onViewResults={handleViewResults}
                      isLoadingResults={isLoadingResults}
                    />
                  )}

                  {view === "resultsList" && (
                    <ResultsListView 
                      results={results}
                      onBack={() => setView("home")}
                      onReview={handleReviewResponse}
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
                      isReviewMode={!!reviewResult}
                      correctScores={quizData.hostScores}
                      onBackToOverview={() => setView("overview")}
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
                      isReviewMode={!!reviewResult}
                      respondentName={reviewResult?.participantName}
                      hostScores={quizData.hostScores}
                      onBackToResults={() => {
                        setReviewResult(null);
                        setUserScores([]);
                        setView("resultsList");
                      }}
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
                )}
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
