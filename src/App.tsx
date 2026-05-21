import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { ArrowLeft, Home, Rocket, Edit2, Users, X, ChevronRight, Loader2 } from "lucide-react";
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
import ConfirmModal from "./components/ui/ConfirmModal";
import { Analytics } from "@vercel/analytics/react";

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
          
          {/* Layer 1 (Bottom-most, back shadow wave, travels fast, leaves slowest for elegant decay) */}
          <motion.div
            initial={false}
            animate={{ x: active ? "0%" : "-100%" }}
            transition={{
              duration: active ? 1.1 : 1.5,
              ease: active ? [0.16, 1, 0.3, 1] : [0.3, 0, 0.8, 0.15],
            }}
            className="absolute top-0 bottom-0 left-0 w-full will-change-transform opacity-40"
          >
            <div className="absolute top-0 bottom-0 left-0 w-[130vmax] bg-[#ebf1fa]" />
            <div 
              className="absolute top-0 bottom-0 left-[130vmax] w-[45vmax] origin-left animate-wave-breathe-1 will-change-transform"
            >
              <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="w-full h-full text-[#ebf1fa]" style={{ overflow: "visible" }}>
                <path fill="currentColor" d="M0,0 C120,180 150,420 80,650 C20,800 100,920 0,1000 Z" />
              </svg>
            </div>
          </motion.div>

          {/* Layer 2 (Soft base light blue) */}
          <motion.div
            initial={false}
            animate={{ x: active ? "0%" : "-100%" }}
            transition={{
              duration: active ? 1.3 : 1.3,
              ease: active ? [0.16, 1, 0.3, 1] : [0.3, 0, 0.8, 0.15],
            }}
            className="absolute top-0 bottom-0 left-0 w-full will-change-transform"
          >
            <div className="absolute top-0 bottom-0 left-0 w-[118vmax] bg-[#eef4f9]" />
            <div 
              className="absolute top-0 bottom-0 left-[118vmax] w-[42vmax] origin-left animate-wave-breathe-2 will-change-transform"
            >
              <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="w-full h-full text-[#eef4f9]" style={{ overflow: "visible" }}>
                <path fill="currentColor" d="M0,0 C60,220 130,450 70,700 C20,830 80,940 0,1000 Z" />
              </svg>
            </div>
          </motion.div>

          {/* Layer 3 (Calm mid blue sky) */}
          <motion.div
            initial={false}
            animate={{ x: active ? "0%" : "-100%" }}
            transition={{
              duration: active ? 1.5 : 1.1,
              ease: active ? [0.16, 1, 0.3, 1] : [0.3, 0, 0.8, 0.15],
            }}
            className="absolute top-0 bottom-0 left-0 w-full will-change-transform"
          >
            <div className="absolute top-0 bottom-0 left-0 w-[107vmax] bg-[#e4eff7]" />
            <div 
              className="absolute top-0 bottom-0 left-[107vmax] w-[45vmax] origin-left animate-wave-breathe-3 will-change-transform"
            >
              <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="w-full h-full text-[#e4eff7]" style={{ overflow: "visible" }}>
                <path fill="currentColor" d="M0,0 C140,280 40,550 90,780 C110,870 50,940 0,1000 Z" />
              </svg>
            </div>
          </motion.div>

          {/* Layer 4 (Topmost rich gradient, slow entering, fast snap exiting) */}
          <motion.div
            initial={false}
            animate={{ x: active ? "0%" : "-100%" }}
            transition={{
              duration: active ? 1.7 : 0.85,
              ease: active ? [0.16, 1, 0.3, 1] : [0.3, 0, 0.8, 0.15],
            }}
            className="absolute top-0 bottom-0 left-0 w-full will-change-transform"
          >
            <div className="absolute top-0 bottom-0 left-0 w-[96vmax] bg-gradient-to-br from-[#dce8f5] via-[#cadff5] to-[#b6d2f0]" />
            <div 
              className="absolute top-0 bottom-0 left-[96vmax] w-[42vmax] origin-left animate-wave-breathe-4 will-change-transform"
            >
              <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="w-full h-full" style={{ overflow: "visible" }}>
                <defs>
                  <linearGradient id="wave-grad-premium" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#dce8f5" />
                    <stop offset="50%" stopColor="#cadff5" />
                    <stop offset="100%" stopColor="#b6d2f0" />
                  </linearGradient>
                </defs>
                <path fill="url(#wave-grad-premium)" d="M0,0 C50,180 130,480 40,680 C-5,780 70,930 0,1000 V0 Z" />
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
  const [quizData, setQuizData] = useState<{
    questions: string[];
    hostScores: number[];
    hostName: string;
    userId: string;
    title: string;
    description: string;
    settings?: {
      allowRepeat: boolean;
      showAnalysis: boolean;
      shuffleQuestions: boolean;
    };
  }>({
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
  const isCustomQuiz = useMemo(() => {
    if (typeof window === "undefined") return false;
    const path = window.location.pathname;
    const match = path.match(/\/customquiz\/([^/?#]+)/);
    const urlParams = new URLSearchParams(window.location.search);
    const searchId = urlParams.get('id');
    return !!((match && match[1]) || searchId);
  }, []);

  const [isLoadingQuiz, setIsLoadingQuiz] = useState(isCustomQuiz);
  const [showQuizContent, setShowQuizContent] = useState(!isCustomQuiz);
  const [quizLoadError, setQuizLoadError] = useState<string | null>(null);

  const [browserId, setBrowserId] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const [visualUserScores, setVisualUserScores] = useState<number[]>([]);

  useEffect(() => {
    let bId = localStorage.getItem('iykyk_browser_id');
    if (!bId) {
      bId = 'b_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('iykyk_browser_id', bId);
    }
    setBrowserId(bId);
  }, []);

  const [commitHash, setCommitHash] = useState("main");

  const [showSecretModal, setShowSecretModal] = useState(false);
  const [showOverviewHomeConfirm, setShowOverviewHomeConfirm] = useState(false);
  const [activeOverlayQuestion, setActiveOverlayQuestion] = useState<number | null>(null);
  const [secret, setSecret] = useState("");
  const [secretError, setSecretError] = useState("");

  useEffect(() => {
    if (isLoadingQuiz) {
      setShowQuizContent(false);
    }
  }, [isLoadingQuiz]);

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

      const localBrowserId = localStorage.getItem('iykyk_browser_id') || "";
      fetchQuiz(quizId, localBrowserId, userName)
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
            settings: data.settings || { allowRepeat: true, showAnalysis: true, shuffleQuestions: false },
          });

          if (data.hasSubmitted) {
            setAlreadySubmitted(true);
          } else {
            setAlreadySubmitted(false);
          }
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
      let quizId = quizData.userId || 'default_quiz';
      if (!quizData.userId) {
        const urlParams = new URLSearchParams(window.location.search);
        let qId = urlParams.get('id');
        
        if (!qId) {
          const path = window.location.pathname;
          const match = path.match(/\/customquiz\/([^/?#]+)/);
          if (match && match[1]) {
            qId = decodeURIComponent(match[1]);
          }
        }
        quizId = qId || 'default_quiz';
      }
      
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
        deviceInfo: navigator.userAgent,
        browserId
      });
      setAlreadySubmitted(true);
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
    if (isCustomQuiz) {
      setUserName("Debugger");
      setUserScores([...quizData.hostScores]);
    } else {
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
    }
    setTimeSpentMessage(null);
    setIsReviewing(true);
    setView("overview");
    setIsTransitioning(false);
    setIsSkipped(true);
  }, [isCustomQuiz, quizData]);

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
    setSavedResult(null);
    setIsTransitioning(false);
    setIsReviewing(false);
    setDirection(1);

    const len = quizData.questions.length;
    const originalIndices = Array.from({ length: len }, (_, i) => i);
    if (quizData.settings?.shuffleQuestions) {
      const shuffled = [...originalIndices].sort(() => Math.random() - 0.5);
      setShuffledOrder(shuffled);
    } else {
      setShuffledOrder(originalIndices);
    }
    setVisualUserScores(new Array(len).fill(0));
    setUserScores(new Array(len).fill(0));

    startTimeRef.current = Date.now();
    setTimeSpentMessage(null);
    setIsSkipped(false);
  };

  const handleScore = useCallback(
    (score: number) => {
      if (isTransitioning || reviewResult) return;
      setIsTransitioning(true);
      setDirection(1);

      setVisualUserScores((prevScores) => {
        const newScores = [...prevScores];
        newScores[currentQuestion] = score;
        return newScores;
      });

      setUserScores((prevScores) => {
        const newScores = [...prevScores];
        if (quizData.settings?.shuffleQuestions && shuffledOrder.length > 0) {
          const originalIdx = shuffledOrder[currentQuestion];
          if (originalIdx !== undefined) {
            newScores[originalIdx] = score;
          }
        } else {
          newScores[currentQuestion] = score;
        }
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
          const avgSeconds = totalQuestions > 0 ? (timeSpent / 1000) / totalQuestions : 0;
          if (totalQuestions > 0 && avgSeconds < 3) {
            setTimeSpentMessage("平均每题不到 3 秒就完成了，做这么快？你认真了吗🙂。");
          } else if (totalQuestions > 0 && avgSeconds >= 6) {
            setTimeSpentMessage("看起来你真的很认真在做。用心回答的你真棒🙂。");
          } else {
            setTimeSpentMessage(null);
          }
          setIsReviewing(true);
          setView("overview");
          setIsTransitioning(false);
        }, 300);
      }
    },
    [isTransitioning, currentQuestion, totalQuestions, isReviewing, shuffledOrder, quizData.settings?.shuffleQuestions, reviewResult],
  );



  const handlePrev = () => {
    if (currentQuestion > 0 && !isTransitioning) {
      setDirection(-1);
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (isCreatingMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSecretModal) {
        if (e.key === "Escape") {
          e.preventDefault();
          setShowSecretModal(false);
          setSecret("");
          setSecretError("");
        }
        return;
      }

      if (activeOverlayQuestion !== null) {
        if (e.key === "Escape") {
          e.preventDefault();
          setActiveOverlayQuestion(null);
        }
        return;
      }

      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      
      if (view === 'home') {
        if (e.key === 'Enter') {
          if (userName.trim()) {
            handleStart();
          }
        }
      } else if (view === 'quiz') {
        if (isTransitioning) return;

        // 1. Previous Question: Backspace or ArrowLeft
        if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrev();
        }

        // 2. Handling Review Mode vs. Answering Mode
        if (reviewResult) {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (currentQuestion < totalQuestions - 1) {
              setDirection(1);
              setCurrentQuestion((p) => p + 1);
            }
          } else if (e.key === 'Enter') {
            e.preventDefault();
            setView("overview");
          }
        } else {
          // Answering Mode: Digit 1-7
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
            e.preventDefault();
            handleScore(score);
          }
        }
      } else if (view === 'overview') {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (reviewResult) {
            setReviewResult(null);
            setUserScores([]);
            setView("resultsList");
          } else {
            handleSubmit();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreatingMode, view, currentQuestion, totalQuestions, userName, userScores, isTransitioning, handlePrev, handleStart, handleSubmit, handleScore, reviewResult, showSecretModal, activeOverlayQuestion]);

  const handleViewResults = async (secret: string) => {
    setIsLoadingResults(true);
    setResultsError(null);
    try {
      let quizId = quizData.userId || 'default_quiz';
      if (!quizData.userId) {
        const path = window.location.pathname;
        const match = path.match(/\/customquiz\/([^/?#]+)/);
        const urlParams = new URLSearchParams(window.location.search);
        let qId = urlParams.get('id');
        if (match && match[1]) {
          qId = decodeURIComponent(match[1]);
        }
        quizId = qId || 'default_quiz';
      }
      const data = await fetchResults(quizId, secret);
      setResults(Array.isArray(data) ? data : (data.results || []));
      setView("resultsList");
    } catch (err: any) {
      console.error('Fetch results failed:', err);
      setResultsError(err.message || '获取记录失败');
      throw err;
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleSecretSubmit = async () => {
    if (!secret.trim()) return;
    setSecretError("");
    try {
      await handleViewResults(secret);
      setShowSecretModal(false);
      setSecret("");
    } catch (err: any) {
      setSecretError(err.message || "密语验证失败");
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
    setReviewResult(null);
    setIsCreatingMode(false);
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
    <div className={`h-[100dvh] text-gray-dark font-sans flex flex-col items-center px-4 pt-6 pb-6 sm:px-8 sm:pt-12 sm:pb-12 overflow-hidden w-full relative transition-[padding] duration-500 ease-out ${(isCreatingMode || !!reviewResult || view === 'resultsList') ? 'theme-blue selection:bg-klein-blue selection:text-white' : 'selection:bg-green-forest selection:text-white'}`}>
      {/* Background elements */}
      <div 
        className="absolute inset-0 z-0 bg-[length:300%_300%] animate-bg-pan bg-gradient-to-br from-[#d4e0c1] via-[#f7f9f4] to-[#b5cca1]"
      />
      <WaveBackground active={isCreatingMode || !!reviewResult || view === 'resultsList'} />
      
      {isAIStudio && !isCreatingMode && showQuizContent && (
        <button
          onClick={triggerSecretPass}
          className="fixed top-4 right-4 z-50 p-2 sm:p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-green-600 hover:text-green-500 hover:bg-white transition-all transform hover:scale-105"
          title="Super Fast Pass"
        >
          <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}
      <div className="flex-1 min-h-0 w-full z-10" />

      <AnimatePresence onExitComplete={() => setShowQuizContent(true)}>
        {isLoadingQuiz && (
          <motion.div
            key="quiz-loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-50 backdrop-blur-xl bg-white/10 flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="flex flex-col items-center justify-center p-4">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full animate-spin" viewBox="0 0 50 50">
                  <circle
                    className="opacity-20 text-green-200"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <circle
                    className="text-green-600"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray="80"
                    strokeDashoffset="30"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="mt-4 text-green-800 font-bold tracking-widest text-sm animate-pulse">
                正在加载定制试卷...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: showQuizContent ? 1 : 0 }}
        className={`relative w-full max-w-[480px] flex flex-col min-h-0 shrink z-10 ${!showQuizContent ? "hidden" : ""}`}
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
                className={`w-full flex flex-col min-h-0 relative ${view === 'resultsList' ? 'h-auto max-h-[80vh] pb-2' : 'h-full'}`}
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

                <div className={`w-full ${quizLoadError ? 'bg-red-50/95 border-red-200' : 'bg-white/60 border-white/50'} backdrop-blur-2xl border rounded-3xl shadow-xl overflow-hidden flex flex-col relative z-10 min-h-0 ${view === 'resultsList' ? 'h-auto max-h-[calc(80vh)]' : 'h-full'}`}>
                  {quizLoadError ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-red-800 animate-fade-in">
                      <Edit2 size={40} className="mx-auto mb-4 text-red-500 opacity-80" />
                      <p className="font-bold text-lg leading-relaxed px-4">{quizLoadError}</p>
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
                      quizData={quizData}
                      alreadySubmitted={alreadySubmitted}
                    />
                  )}

                  {view === "resultsList" && (
                    <ResultsListView 
                      results={results}
                      onBack={resetToHome}
                      onReview={handleReviewResponse}
                      hostScores={quizData.hostScores}
                    />
                  )}

                  {view === "quiz" && (
                    <QuizView
                      currentQuestion={currentQuestion}
                      totalQuestions={totalQuestions}
                      questions={quizData.questions}
                      direction={direction}
                      userScores={(!reviewResult && quizData.settings?.shuffleQuestions) ? visualUserScores : userScores}
                      isTransitioning={isTransitioning}
                      handleScore={handleScore}
                      handlePrev={handlePrev}
                      handleNext={() => {
                        if (currentQuestion < totalQuestions - 1 && !isTransitioning) {
                          setDirection(1);
                          setCurrentQuestion((p) => p + 1);
                        }
                      }}
                      isReviewMode={!!reviewResult}
                      correctScores={quizData.hostScores}
                      onBackToOverview={() => setView("overview")}
                      shuffledOrder={(!reviewResult && quizData.settings?.shuffleQuestions) ? shuffledOrder : undefined}
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
                      onSelectQuestion={setActiveOverlayQuestion}
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
                      onOpenAdminDialog={() => setShowSecretModal(true)}
                      alreadySubmitted={alreadySubmitted}
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

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: showQuizContent ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className={`flex-1 w-full max-w-[480px] flex flex-col justify-start relative z-10 pointer-events-none ${!showQuizContent ? "hidden" : ""}`}
      >
        <AnimatePresence>
          {!isCreatingMode && view === "home" && (savedResult || isCustomQuiz) && (
            <motion.div 
              key="home-recover"
              initial={{ opacity: 0, y: 16, pointerEvents: "none" }}
              animate={{ opacity: 1, y: 0, pointerEvents: "auto" }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ delay: 0.35, duration: 0.25, ease: "easeOut" }}
              className="pt-6 flex justify-center gap-4 pointer-events-auto"
            >
              {isCustomQuiz && !quizLoadError && (
                <button
                  onClick={() => setShowSecretModal(true)}
                  className="text-sm font-medium text-klein-blue hover:text-klein-blue-light transition-colors flex items-center gap-1.5 px-4 py-2 rounded-full hover:bg-klein-blue/5"
                >
                  <Users size={16} />
                  查看好友答题
                </button>
              )}
              {quizLoadError && (
                <button
                  onClick={() => window.location.href = '/'}
                  className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors flex items-center gap-1.5 px-4 py-2 rounded-full hover:bg-green-dark/5"
                >
                  <ArrowLeft size={16} />
                  返回主页
                </button>
              )}
              {savedResult && (
                <button
                  onClick={restoreResult}
                  className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors flex items-center gap-1.5 px-4 py-2 rounded-full hover:bg-green-dark/5"
                >
                  <ArrowLeft size={16} />
                  找回刚才的结果
                </button>
              )}
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

          {!isCreatingMode && view === "overview" && (
            <motion.div 
              key="overview-home"
              initial={{ opacity: 0, y: 16, pointerEvents: "none" }}
              animate={{ opacity: 1, y: 0, pointerEvents: "auto" }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ delay: 0.1, duration: 0.25, ease: "easeOut" }}
              className="pt-6 flex justify-center gap-4 pointer-events-auto"
            >
              <button
                onClick={() => setShowOverviewHomeConfirm(true)}
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 px-4 py-2 rounded-full ${
                  !!reviewResult 
                    ? "text-klein-blue hover:text-klein-blue-light hover:bg-klein-blue/5" 
                    : "text-green-700 hover:text-green-800 hover:bg-green-dark/5"
                }`}
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
      </motion.div>

      {/* Secret Word Modal */}
      <AnimatePresence>
        {showSecretModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => { setShowSecretModal(false); setSecret(""); setSecretError(""); }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, type: "spring", bounce: 0.3 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-klein-blue/10 text-klein-blue rounded-full flex items-center justify-center mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-gray-800 mb-2">密语验证</h3>
              <p className="text-gray-500 text-center text-sm mb-6">请输入这套试卷的密语，以查看其他人的答题记录。</p>
              
              <div className="space-y-4 w-full">
                <div className="relative">
                  <input
                    placeholder="输入密语"
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border transition-all focus:outline-none text-center ${
                      secretError ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-klein-blue'
                    }`}
                    value={secret}
                    onChange={(e) => { setSecret(e.target.value); setSecretError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSecretSubmit()}
                  />
                  {secretError && (
                    <p className="text-[10px] text-red-500 mt-1.5 ml-1 text-center font-medium">{secretError}</p>
                  )}
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => { setShowSecretModal(false); setSecret(""); setSecretError(""); }}
                    className="flex-1 py-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold transition-colors text-sm"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSecretSubmit}
                    disabled={!secret.trim() || isLoadingResults}
                    className="flex-1 py-2.5 rounded-xl text-white bg-klein-blue hover:bg-klein-blue-light font-bold shadow-md shadow-klein-blue/20 transition-all flex items-center justify-center gap-1.5 text-sm"
                  >
                    {isLoadingResults ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        验证并查看 <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Question Detail Modal */}
      {/* Overview Home Confirm Modal */}
      <ConfirmModal
        isOpen={showOverviewHomeConfirm}
        onClose={() => setShowOverviewHomeConfirm(false)}
        onConfirm={() => {
          setShowOverviewHomeConfirm(false);
          setTimeout(() => {
            resetToHome();
          }, 200);
        }}
        title="确定要回到首页吗？"
        description="目前的答题记录将会丢失。"
        theme={!!reviewResult ? "blue" : "red"}
        icon={<Home size={24} />}
        confirmText="确认返回"
      />

      <AnimatePresence>
        {activeOverlayQuestion !== null && (
          <motion.div
            key="quiz-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/15 backdrop-blur-md flex flex-col items-center justify-center p-4 pointer-events-auto"
            onClick={() => setActiveOverlayQuestion(null)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 12 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className={`w-full max-w-[480px] bg-white/70 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] relative ${
                !!reviewResult ? 'theme-blue' : ''
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <QuizView
                currentQuestion={activeOverlayQuestion}
                totalQuestions={totalQuestions}
                questions={quizData.questions}
                direction={1}
                userScores={userScores}
                isTransitioning={false}
                handleScore={(score) => {
                  if (!!reviewResult) return;
                  setUserScores((prevScores) => {
                    const newScores = [...prevScores];
                    newScores[activeOverlayQuestion] = score;
                    return newScores;
                  });
                  setTimeout(() => {
                    setActiveOverlayQuestion(null);
                  }, 100);
                }}
                handlePrev={() => {}}
                isReviewMode={!!reviewResult}
                correctScores={quizData.hostScores}
                onBackToOverview={() => setActiveOverlayQuestion(null)}
                isOverlay={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Analytics />
    </div>
  );
}
