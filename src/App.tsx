import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  RefreshCcw,
  Home,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HOST_NAME, HOST_SCORES, QUESTIONS } from "./constants";

const resultContainerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.44,
      type: "spring",
      bounce: 0.2,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.17 } },
};

const resultItemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

type ViewState = "home" | "quiz" | "overview" | "result";

export default function App() {
  const [view, setView] = useState<ViewState>("home");
  const [userName, setUserName] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userScores, setUserScores] = useState<number[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [direction, setDirection] = useState(1);
  const [savedResult, setSavedResult] = useState<{
    userName: string;
    userScores: number[];
    timeSpentMessage: string | null;
  } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  const [timeSpentMessage, setTimeSpentMessage] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [questionHistory, setQuestionHistory] = useState<number[]>([]);

  const totalQuestions = QUESTIONS.length;

  const calculateResult = useCallback(() => {
    const scoreConfig = [100, 90, 60, 40, 30, 10, 0];
    let totalScore = 0;
    for (let i = 0; i < totalQuestions; i++) {
      const diff = Math.abs((HOST_SCORES[i] || 4) - (userScores[i] || 4));
      const errorIndex = Math.min(Math.max(diff, 0), 6);
      totalScore += scoreConfig[errorIndex];
    }
    return Math.round(totalScore / totalQuestions);
  }, [userScores, totalQuestions]);

  const handleSubmit = useCallback(() => {
    if (userScores.length !== totalQuestions || userScores.some((s) => s === undefined)) return;
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      const result = calculateResult();
      setTimeout(() => {
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

  const triggerSecretPass = useCallback(() => {
    setUserScores([...HOST_SCORES]);
    setTimeSpentMessage(null);
    setIsReviewing(true);
    setView("overview");
    setIsTransitioning(false);
  }, []);

  const getScoreStyles = (s: number, isSelected: boolean) => {
    if (isSelected) {
      switch (s) {
        case 1:
          return "bg-gradient-to-br from-red-600 to-red-400 text-white border-transparent";
        case 2:
          return "bg-gradient-to-br from-orange-600 to-orange-400 text-white border-transparent";
        case 3:
          return "bg-gradient-to-br from-amber-600 to-amber-400 text-white border-transparent";
        case 4:
          return "bg-gradient-to-br from-yellow-600 to-yellow-400 text-white border-transparent";
        case 5:
          return "bg-gradient-to-br from-lime-600 to-lime-400 text-white border-transparent";
        case 6:
          return "bg-gradient-to-br from-emerald-600 to-emerald-400 text-white border-transparent";
        case 7:
          return "bg-gradient-to-br from-green-600 to-green-400 text-white border-transparent";
        default:
          return "bg-green-forest text-white border-transparent";
      }
    } else {
      switch (s) {
        case 1:
          return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gradient-to-br hover:from-red-100 hover:to-red-50 hover:text-red-600 hover:border-transparent";
        case 2:
          return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gradient-to-br hover:from-orange-100 hover:to-orange-50 hover:text-orange-600 hover:border-transparent";
        case 3:
          return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gradient-to-br hover:from-amber-100 hover:to-amber-50 hover:text-amber-600 hover:border-transparent";
        case 4:
          return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gradient-to-br hover:from-yellow-100 hover:to-yellow-50 hover:text-yellow-600 hover:border-transparent";
        case 5:
          return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gradient-to-br hover:from-lime-100 hover:to-lime-50 hover:text-lime-600 hover:border-transparent";
        case 6:
          return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gradient-to-br hover:from-emerald-100 hover:to-emerald-50 hover:text-emerald-600 hover:border-transparent";
        case 7:
          return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gradient-to-br hover:from-green-100 hover:to-green-50 hover:text-green-600 hover:border-transparent";
        default:
          return "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-green-50 hover:text-green-600 hover:border-transparent";
      }
    }
  };

  useEffect(() => {
    document.title = `IYKYK | 来自 ${HOST_NAME} 的 Quiz`;
  }, []);

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
        Digit1: 1,
        Numpad1: 1,
        Digit2: 2,
        Numpad2: 2,
        Digit3: 3,
        Numpad3: 3,
        Digit4: 4,
        Numpad4: 4,
        Digit5: 5,
        Numpad5: 5,
        Digit6: 6,
        Numpad6: 6,
        Digit7: 7,
        Numpad7: 7,
        "1": 1,
        "2": 2,
        "3": 3,
        "4": 4,
        "5": 5,
        "6": 6,
        "7": 7,
      };

      const score = keyMap[e.code] || keyMap[e.key];
      if (score !== undefined) {
        handleScore(score);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view, isTransitioning, handleScore]);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (
        e.ctrlKey &&
        e.shiftKey &&
        (e.key === "l" || e.key === "L") &&
        userName === "Console"
      ) {
        e.preventDefault();
        triggerSecretPass();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [userName, triggerSecretPass]);

  useEffect(() => {
    if (view === "quiz" && !isTransitioning && userName === "Console") {
      setQuestionHistory((prev) => {
        const next = [...prev, currentQuestion].slice(-9);
        if (next.join(",") === "0,1,2,1,2,3,2,3,4") {
          triggerSecretPass();
        }
        return next;
      });
    }
  }, [currentQuestion, view, isTransitioning, triggerSecretPass, userName]);

  const handlePrev = () => {
    if (currentQuestion > 0 && !isTransitioning) {
      setDirection(-1);
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const getPercentageTheme = (p: number) => {
    if (p === 100)
      return {
        color: "#d946ef",
        gradient: "from-pink-500 via-yellow-500 to-indigo-500 bg-[linear-gradient(135deg,#ef4444,#eab308,#22c55e,#0ea5e9,#a855f7)] bg-[size:200%_200%] animate-rainbow",
        bgOverlay: "from-pink-500/[0.08] via-white/40 to-indigo-500/[0.08]",
      };
    if (p >= 85)
      return { color: "#16a34a", gradient: "from-green-600 to-green-400", bgOverlay: "from-green-500/[0.08] to-emerald-500/[0.04]" };
    if (p >= 65)
      return { color: "#65a30d", gradient: "from-lime-600 to-lime-400", bgOverlay: "from-lime-500/[0.08] to-green-500/[0.04]" };
    if (p >= 50)
      return { color: "#ca8a04", gradient: "from-yellow-600 to-yellow-400", bgOverlay: "from-yellow-500/[0.08] to-orange-500/[0.04]" };
    return { color: "#dc2626", gradient: "from-red-600 to-red-400", bgOverlay: "from-red-500/[0.08] to-rose-500/[0.04]" };

  };

  const getResultFeedback = (percentage: number) => {
    if (percentage === 100) {
      return {
        title: "WTF???",
        desc: "一点没差？？真求求你了，可以一直跟我玩吗💖🥹。",
      };
    } else if (percentage >= 85) {
      return {
        title: "灵魂知己",
        desc: "你绝对不可以跟我绝交！求求你了！因为你要把我底裤扒没了😨。",
      };
    } else if (percentage >= 65) {
      return {
        title: "知人知面",
        desc: "你很了解我的日常模式，也许我们相处会比较有默契🙏。",
      };
    } else if (percentage >= 50) {
      return {
        title: "点赞之交",
        desc: "你看到了主播的冰山一角，或许我们还需要更多深度的交流🤔。",
      };
    } else {
      return {
        title: "雾里看花",
        desc: "你是不是不小心认错人了...有兴趣的话，多看我一眼。",
      };
    }
  };

  const analysis = useMemo(() => {
    if (view !== "result") return { matches: [], gaps: [] };
    const all = userScores.map((score, index) => ({
      question: QUESTIONS[index],
      diff: Math.abs(score - HOST_SCORES[index]),
      userScore: score,
      hostScore: HOST_SCORES[index],
    }));

    const matches = all
      .filter((a) => a.diff <= 1)
      .sort((a, b) => a.diff - b.diff);

    const gaps = all.filter((a) => a.diff >= 2).sort((a, b) => b.diff - a.diff);

    return { matches, gaps };
  }, [userScores, view]);

  const resetToHome = () => {
    if (view === "result") {
      setSavedResult({ userName, userScores, timeSpentMessage });
    }
    setUserName("");
    setUserScores([]);
    setCurrentQuestion(0);
    setView("home");
    setShowMatches(false);
    setIsReviewing(false);
    setDirection(1);
  };

  const restartQuiz = () => {
    if (view === "result") {
      setSavedResult({ userName, userScores, timeSpentMessage });
    }

    setUserScores([]);
    setCurrentQuestion(0);
    setView("quiz");
    setShowMatches(false);
    setIsReviewing(false);
    setDirection(1);
    startTimeRef.current = Date.now();
    setTimeSpentMessage(null);
  };

  const restoreResult = () => {
    if (savedResult) {
      setUserName(savedResult.userName);
      setUserScores(savedResult.userScores);
      setTimeSpentMessage(savedResult.timeSpentMessage);
      setView("result");
    }
  };

  return (
    <div className="min-h-screen bg-green-morandi text-gray-dark font-sans flex flex-col items-center justify-center p-4 selection:bg-green-forest selection:text-white overflow-x-hidden w-full">
      <div className="relative w-full max-w-[480px]">
        <motion.div
          layout
          transition={{ duration: 0.44, ease: "easeInOut" }}
          className="w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col relative min-h-0"
        >
          <AnimatePresence mode="popLayout">
            {view === "home" && (
              <motion.div
                layout
                key="home"
                initial="enter"
                animate="center"
                exit="exit"
                variants={{
                  enter: { opacity: 0 },
                  center: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
                  },
                  exit: {
                    opacity: 0,
                    transition: {
                      staggerChildren: 0.02,
                      staggerDirection: -1,
                      duration: 0.17,
                    },
                  },
                }}
                className="p-8 flex flex-col flex-grow justify-center w-full"
              >
                <motion.div
                  variants={{
                    enter: { opacity: 0, y: 15 },
                    center: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.33 },
                    },
                    exit: { opacity: 0, y: -5, transition: { duration: 0.17 } },
                  }}
                  className="mb- w-full"
                >
                  <div className="text-left mb-4">
                    <span className="font-sans text-base text-gray-500 mr-1 not-italic font-medium">
                      From{" "}
                    </span>
                    <span className="font-[Cambria,'Caladea',ui-serif,Georgia,'Times_New_Roman',Times,serif] text-2xl tracking-wide text-green-dark italic">
                      {HOST_NAME}
                    </span>
                    <span className="font-sans text-base text-gray-500 mr-1 not-italic font-medium">
                      {" "}:
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold font-display text-green-dark text-center leading-snug">
                    你和我，见识同一个我吗？
                  </h1>
                  <p>
                    <br />
                  </p>
                </motion.div>
                <motion.div
                  variants={{
                    enter: { opacity: 0, y: 15 },
                    center: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.33 },
                    },
                    exit: { opacity: 0, y: -5, transition: { duration: 0.17 } },
                  }}
                  className="mb-4 leading-relaxed space-y-6"
                >
                  <p className="text-sm text-gray-600 text-justify tracking-tight">
                    欢迎来到这里，我的朋友！
                    <br />
                    这个网页的出现来源于我无聊的研究。我总是很在意他人的评价却忽略自我的看法，在建立对自己的评价之前，也许需要研究来自自评与他评之间的“温差”。 
                    在这个一直给人扣帽子的时代，也许该少用
                    <a href="https://www.16personalities.com/" target="_blank" rel="noopener noreferrer" className="link-underline text-gray-700">MBTI</a>
                    或是星座什么的来引发共鸣，回归到人与人间最具体的细节。
                  </p>
                  <p className="text-[13px] text-gray-400 text-justify leading-snug tracking-tight">
                    Tips: 这个项目我自己完成了功能逻辑、交互设计，以及你看到的这组范例试卷的自评测算。当然了，要落地这个，还得拜托（指挥）了我最近很喜欢用的
                    <a href="https://ai.studio/build" target="_blank" rel="noopener noreferrer" className="link-underline text-gray-500">Google Gemini</a>
                    帮我编写代码调试。我挺喜欢的，至少比豆包聪明。
                    <br />
                    <br />
                  </p>
                </motion.div>
                <motion.div
                  variants={{
                    enter: { opacity: 0, scale: 0.95 },
                    center: {
                      opacity: 1,
                      scale: 1,
                      transition: { duration: 0.33 },
                    },
                    exit: {
                      opacity: 0,
                      scale: 0.98,
                      transition: { duration: 0.17 },
                    },
                  }}
                  className="mt-auto space-y-4"
                >
                  <input
                    type="text"
                    placeholder="请输入你的昵称"
                    maxLength={10}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-forest focus:border-transparent transition-all text-center"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStart()}
                  />
                  <button
                    onClick={handleStart}
                    disabled={!userName.trim()}
                    className="w-full bg-green-forest hover:bg-green-dark text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    开始挑战
                  </button>
                </motion.div>
              </motion.div>
            )}

            {view === "quiz" && (
              <motion.div
                layout
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10, transition: { duration: 0.17 } }}
                transition={{ duration: 0.33 }}
                className="flex flex-col flex-grow p-6 w-full select-none"
              >
                <div className="mb-8">
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
                      className="bg-green-forest h-2 rounded-full transition-all duration-[550ms] ease-out"
                      style={{
                        width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex-grow flex flex-col justify-center mb-8 relative">
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
                      className="bg-green-50 p-6 rounded-2xl border border-green-100 text-lg leading-relaxed text-center font-medium w-full text-balance"
                    >
                      {QUESTIONS[currentQuestion]}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3 px-1">
                    <span>完全不符合</span>
                    <span>完全符合</span>
                  </div>
                  <div className="flex justify-between gap-1 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7].map((score) => {
                      const isSelected = userScores[currentQuestion] === score;
                      return (
                        <button
                          key={score}
                          onClick={() => handleScore(score)}
                          disabled={isTransitioning}
                          className={`flex-1 aspect-square rounded-xl flex items-center justify-center text-2xl font-black transition-all duration-[220ms] 
                        ${getScoreStyles(score, isSelected)} ${isTransitioning ? "opacity-80" : ""}`}
                        >
                          {score}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center mt-2 h-10">
                    <button
                      onClick={handlePrev}
                      disabled={currentQuestion === 0}
                      className={`flex items-center gap-2 text-sm transition-colors py-2 px-4 rounded-lg flex-shrink-0 ${
                        currentQuestion === 0
                          ? "opacity-40 cursor-not-allowed text-gray-400"
                          : "text-gray-500 hover:text-green-dark hover:bg-gray-50"
                      }`}
                    >
                      <ArrowLeft size={16} />
                      上一题
                    </button>

                    {isReviewing ? (
                      <div className="animate-in fade-in duration-[330ms] flex items-center gap-2 ml-auto">
                        <button
                          onClick={() => setView("overview")}
                          className="flex items-center gap-1.5 text-sm font-medium transition-colors py-2 px-4 rounded-full text-white bg-green-forest hover:bg-green-700 shadow shadow-green-200"
                        >
                          确定
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            )}

            {view === "overview" && (
              <motion.div
                layout
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col w-full relative flex-grow select-none"
              >
                <div className="flex flex-col items-center mb-4 mt-6">
                  <p className="text-sm text-gray-400 mb-1 uppercase tracking-[0.2em] font-bold">
                    答题概览
                  </p>
                  <p style={{ fontSize: '10px' }} className="text-gray-300 font-semibold tracking-[0.15em] uppercase font-sans">
                    Quiz Overview
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-24 max-h-[55vh]">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-3">
                      {QUESTIONS.slice(0, Math.ceil(QUESTIONS.length / 2)).map((question, sliceIdx) => {
                        const idx = sliceIdx;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setCurrentQuestion(idx);
                              setView("quiz");
                            }}
                            className={`relative bg-gray-50 border border-gray-100 hover:border-green-300 hover:bg-green-50/50 p-2 sm:p-3 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors shadow-sm aspect-auto min-h-[8.5rem] sm:min-h-[9.5rem] group z-auto`}
                          >
                            <div className="absolute top-1 left-2 font-display font-black text-lg sm:text-xl text-gray-300 group-hover:text-green-forest/40 transition-colors z-20">
                              {idx + 1}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 font-medium text-left px-2 w-full relative z-10 line-clamp-2 mt-0">
                              {question}
                            </div>
                            <div 
                              className={`absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 text-xs sm:text-sm font-bold w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded-lg ${getScoreStyles(userScores[idx], true)} group-hover:scale-110 transition-transform z-30 opacity-100`}
                            >
                              {userScores[idx]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="space-y-3">
                      {QUESTIONS.slice(Math.ceil(QUESTIONS.length / 2)).map((question, sliceIdx) => {
                        const idx = sliceIdx + Math.ceil(QUESTIONS.length / 2);
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setCurrentQuestion(idx);
                              setView("quiz");
                            }}
                            className={`relative bg-gray-50 border border-gray-100 hover:border-green-300 hover:bg-green-50/50 p-2 sm:p-3 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors shadow-sm aspect-auto min-h-[8.5rem] sm:min-h-[9.5rem] group z-auto`}
                          >
                            <div className="absolute top-1 left-2 font-display font-black text-lg sm:text-xl text-gray-300 group-hover:text-green-forest/40 transition-colors z-20">
                              {idx + 1}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 font-medium text-left px-2 w-full relative z-10 line-clamp-2 mt-0">
                              {question}
                            </div>
                            <div 
                              className={`absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 text-xs sm:text-sm font-bold w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded-lg ${getScoreStyles(userScores[idx], true)} group-hover:scale-110 transition-transform z-30 opacity-100`}
                            >
                              {userScores[idx]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-12 z-30">
                  <button
                    onClick={handleSubmit}
                    className="w-full py-3.5 bg-green-forest text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200/50 hover:bg-green-600 transition-colors"
                  >
                    提交 {HOST_NAME} 的 Quiz
                  </button>
                </div>
              </motion.div>
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
              <motion.div
                layout
                key="result"
                variants={resultContainerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex flex-col flex-grow w-full"
              >
                <div
                  ref={resultRef}
                  className={`p-8 flex flex-col items-center justify-center bg-white relative overflow-hidden bg-gradient-to-br ${getPercentageTheme(calculateResult()).bgOverlay}`}
                >
                  {/* Decorative background elements for report */}
                  <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-green-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
                  <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-green-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                  <motion.div
                    variants={resultItemVariants}
                    className="text-center z-10 w-full mb-4"
                  >
                    <div className="flex flex-col items-center mb-4">
                      <p className="text-sm text-gray-400 mb-1 uppercase tracking-[0.2em] font-bold">
                        重合度报告
                      </p>
                      <p style={{ fontSize: '10px' }} className="text-gray-300 font-semibold tracking-[0.15em] uppercase font-sans">
                        Similarity Report
                      </p>
                    </div>
                    <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 w-full max-w-[320px] sm:max-w-[360px] mx-auto">
                      <div className="flex justify-end">
                        <div className="px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center">
                          <span className="text-green-forest text-lg sm:text-xl px-1 font-black truncate max-w-[100px] sm:max-w-[130px]">
                            {userName}
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-400 font-bold text-lg px-2">与</span>
                      <div className="flex justify-start">
                        <div className="px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center">
                          <span className="text-green-forest text-lg sm:text-xl px-1 font-black truncate max-w-[100px] sm:max-w-[130px]">
                            {HOST_NAME}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="relative mt-2 mb-4 inline-block px-8 sm:px-10 py-6">
                      {calculateResult() === 100 && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md" overflow="visible">
                          <defs>
                            <linearGradient id="snakeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ef4444" />
                              <stop offset="25%" stopColor="#eab308" />
                              <stop offset="50%" stopColor="#22c55e" />
                              <stop offset="75%" stopColor="#0ea5e9" />
                              <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                          </defs>
                          <rect x="3" y="3" style={{ width: "calc(100% - 6px)", height: "calc(100% - 6px)" }} rx="28" ry="28" fill="none" stroke="url(#snakeGradient)" strokeWidth="6" pathLength="100" strokeDasharray="25 75" strokeDashoffset="0" strokeLinecap="round">
                            <animate attributeName="stroke-dashoffset" values="100;0" dur="1.5s" repeatCount="indefinite" />
                          </rect>
                        </svg>
                      )}
                      <div
                        className={`text-7xl sm:text-8xl font-display font-extrabold tracking-tighter bg-gradient-to-br ${getPercentageTheme(calculateResult()).gradient} bg-clip-text text-transparent percentage-number transition-all duration-[770ms] pr-4 pb-2 -mr-4 -mb-2`}
                      >
                        {calculateResult()}%
                      </div>
                    </div>

                    {/* Decorative horizontal bar */}
                    <div className="w-48 h-1.5 bg-gray-100 rounded-full mx-auto mb-8 overflow-hidden relative">
                      <div
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getPercentageTheme(calculateResult()).gradient} transition-all duration-[770ms] ease-out rounded-full`}
                        style={{ width: `${calculateResult()}%` }}
                      ></div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={resultItemVariants}
                    className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm mb-6 w-full relative z-10"
                  >
                    <div
                      className={`text-3xl text-center font-display font-extrabold tracking-tight bg-gradient-to-br ${getPercentageTheme(calculateResult()).gradient} bg-clip-text text-transparent mb-3 block result-title`}
                    >
                      {getResultFeedback(calculateResult()).title}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed px-2 text-left tracking-tight flex flex-col items-center">
                      <span>{getResultFeedback(calculateResult()).desc}</span>
                      {timeSpentMessage && (
                        <span className="text-[13px] text-gray-400 mt-2 block">
                          {timeSpentMessage}
                        </span>
                      )}
                    </p>
                  </motion.div>

                  {/* 详细深度分析 */}
                  <motion.div
                    variants={resultItemVariants}
                    className="w-full space-y-6 text-left"
                  >
                    <div className="flex items-center gap-2 px-1">
                      <div className="h-px flex-grow bg-gray-200"></div>
                      <span className="text-[12px] uppercase tracking-widest text-gray-400 font-bold whitespace-nowrap">
                        深度解析 · Deep Insight
                      </span>
                      <div className="h-px flex-grow bg-gray-200"></div>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto overflow-x-hidden pr-2 space-y-6 custom-scrollbar pb-4 -mr-2">
                      {/* 认知温差 - 优先展示并展开 */}
                      {analysis.gaps.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[12px] font-bold text-orange-700 bg-orange-100/50 w-max px-2 py-0.5 rounded-full tracking-wider">
                            认知温差 · GAPS ({analysis.gaps.length})
                          </h4>
                          <p className="text-[13px] text-orange-800 font-medium opacity-90 px-1 border-l-2 border-orange-300 ml-1 pl-2">
                            在这些细节上，你们的认知出现了明显的“分岔”。
                          </p>
                          <div className="space-y-2">
                            {analysis.gaps.map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-white p-3 pb-6 rounded-xl border border-orange-100 text-[13px] leading-snug shadow-sm relative"
                              >
                                <span className="text-gray-500 block">
                                  “{item.question}”
                                </span>
                                <span className="absolute bottom-1.5 right-2 text-[12px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                                  {item.userScore} | {item.diff >= 4 ? '分差大' : '分差小'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 高频共鸣 - 折叠展示 */}
                      {analysis.matches.length > 0 && (
                        <div className="space-y-3 relative">
                          <button
                            onClick={() => setShowMatches(!showMatches)}
                            className="flex items-center justify-between w-full text-left focus:outline-none group z-10 relative"
                          >
                            <h4 className="text-[12px] font-bold text-green-700 bg-green-100/50 w-max px-2 py-0.5 rounded-full tracking-wider">
                              高频共鸣 · MATCHES ({analysis.matches.length})
                            </h4>
                            <div className="text-gray-400 group-hover:text-green-600 transition-colors">
                              <motion.div
                                animate={{ rotate: showMatches ? 180 : 0 }}
                              >
                                <ChevronDown size={14} />
                              </motion.div>
                            </div>
                          </button>

                          <motion.div
                            className="matches-container overflow-hidden"
                            initial={false}
                            animate={{
                              height: showMatches ? "auto" : 0,
                              opacity: showMatches ? 1 : 0,
                            }}
                            transition={{ duration: 0.33, ease: "easeInOut" }}
                          >
                            <div className="space-y-3 pt-1 pb-1">
                              <p className="text-[13px] text-green-800 font-medium opacity-90 px-1 border-l-2 border-green-300 ml-1 pl-2">
                                在这里，你们共享着同一种直觉与默契。
                              </p>
                              <div className="space-y-2">
                                {analysis.matches.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white p-3 pb-6 rounded-xl border border-green-100 text-[13px] leading-snug shadow-sm relative"
                                  >
                                    <span className="text-gray-500 block">
                                      “{item.question}”
                                    </span>
                                    <span className="absolute bottom-1.5 right-2 text-[12px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                                      你评 {item.userScore} 分
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  variants={resultItemVariants}
                  className="p-6 bg-gray-50 border-t border-gray-100 space-y-3 sticky bottom-0 z-20"
                >
                  <div className="flex gap-3">
                    <button
                      onClick={restartQuiz}
                      className="flex-1 bg-white border border-gray-200 hover:border-green-forest hover:text-green-dark text-gray-600 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCcw size={18} />
                      再来一次
                    </button>
                    <button
                      onClick={resetToHome}
                      className="flex-1 bg-white border border-gray-200 hover:border-gray-400 text-gray-600 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Home size={18} />
                      回到主页
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {view === "home" && savedResult && (
          <div className="absolute top-full inset-x-0 pt-6 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-[550ms] z-10">
            <button
              onClick={restoreResult}
              className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors flex items-center gap-1.5 px-4 py-2 rounded-full hover:bg-green-dark/5"
            >
              <ArrowLeft size={16} />
              找回刚才的结果
            </button>
          </div>
        )}

        {view === "quiz" && currentQuestion === 0 && !isReviewing && (
          <div className="absolute top-full inset-x-0 pt-6 flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-[550ms] z-10">
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
          </div>
        )}
      </div>
    </div>
  );
}
