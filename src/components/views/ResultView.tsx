import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, RefreshCcw, Home, Lock, Eye, Users, Search } from "lucide-react";
import { getPercentageTheme, getResultFeedback, calculateResultScore } from "../../lib/quizUtils";
import { ScrollArea } from "../ui/ScrollArea";
import { fetchResults } from "../../lib/api";

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

interface ResultViewProps {
  quizData: any;
  userScores: number[];
  userName: string;
  isSkipped: boolean;
  timeSpentMessage: string | null;
  resetToHome: () => void;
  restartQuiz: () => void;
  isInitialSnakeDone: boolean;
  setIsInitialSnakeDone: (val: boolean) => void;
}

export default function ResultView({
  quizData,
  userScores,
  userName,
  isSkipped,
  timeSpentMessage,
  resetToHome,
  restartQuiz,
  isInitialSnakeDone,
  setIsInitialSnakeDone
}: ResultViewProps) {
  const [showMatches, setShowMatches] = useState(false);

  const calculateResult = () => {
    return calculateResultScore(userScores, quizData.hostScores, quizData.questions.length);
  };

  const analysis = useMemo(() => {
    const all = userScores.map((score, index) => ({
      question: quizData.questions[index],
      diff: Math.abs(score - quizData.hostScores[index]),
      userScore: score,
      hostScore: quizData.hostScores[index],
    }));

    const matches = all
      .filter((a) => a.diff <= 1)
      .sort((a, b) => a.diff - b.diff);

    const gaps = all.filter((a) => a.diff >= 2).sort((a, b) => b.diff - a.diff);

    return { matches, gaps };
  }, [userScores, quizData]);

  // Admin View State
  const [isAdminViewOpen, setIsAdminViewOpen] = useState(false);
  const [adminSecret, setAdminSecret] = useState("");
  const [adminResults, setAdminResults] = useState<any[] | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const getQuizId = () => {
    const path = window.location.pathname;
    if (path.includes('/customquiz/')) {
      return path.split('/customquiz/')[1];
    }
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || 'default_quiz';
  };

  const currentQuizId = getQuizId();

  const handleFetchResults = async () => {
    if (!adminSecret.trim()) return;
    setIsAdminLoading(true);
    setAdminError(null);
    try {
      const results = await fetchResults(currentQuizId, adminSecret);
      setAdminResults(results);
    } catch (err: any) {
      setAdminError(err.message || '获取结果失败，可能是密语错误');
    } finally {
      setIsAdminLoading(false);
    }
  };

  return (
    <motion.div
      layout
      key="result"
      variants={resultContainerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-col flex-1 w-full min-h-0 overflow-hidden"
    >
      <ScrollArea className="flex-1 custom-scrollbar w-full" contentClassName="relative min-h-full">
      <div
        className={`p-8 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br transition-colors duration-500 rounded-t-3xl ${getPercentageTheme(calculateResult()).bgOverlay}`}
      >
        {/* Decorative background elements for report */}
        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-green-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-green-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <motion.div
          variants={resultItemVariants}
          className="text-center z-10 w-full mb-4"
        >
          <div className="select-none flex flex-col items-center mb-4">
            <p className="text-sm text-gray-400 mb-1 uppercase tracking-[0.2em] font-bold">
              重合度报告
            </p>
            <p style={{ fontSize: '10px' }} className="text-gray-300 font-semibold tracking-[0.15em] uppercase font-sans">
              Similarity Report
            </p>
          </div>
          <div className="select-none mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 w-full max-w-[320px] sm:max-w-[360px] mx-auto">
            <div className="flex justify-center w-full min-w-0">
              <div className="px-4 py-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/50 flex items-center justify-center max-w-full">
                <span className="text-green-forest text-lg sm:text-xl font-black truncate">
                  {isSkipped ? "Console" : userName}
                </span>
              </div>
            </div>
            <span className="text-gray-400 font-bold text-lg px-1 text-center whitespace-nowrap">与</span>
            <div className="flex justify-center w-full min-w-0">
              <div className="px-4 py-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/50 flex items-center justify-center max-w-full">
                <span className="text-green-forest text-lg sm:text-xl font-black truncate">
                  {isSkipped ? "Debugger" : quizData.hostName}
                </span>
              </div>
            </div>
          </div>

          <div className="select-none relative mt-2 mb-4 inline-block px-8 sm:px-10 py-6">
            <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md" overflow="visible">
              {calculateResult() === 100 && (
                <defs>
                  <linearGradient id="snakeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="25%" stopColor="#eab308" />
                    <stop offset="50%" stopColor="#22c55e" />
                    <stop offset="75%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              )}
              <motion.rect
                x="3"
                y="3"
                style={{ width: "calc(100% - 6px)", height: "calc(100% - 6px)" }}
                rx="28"
                ry="28"
                fill="none"
                stroke={calculateResult() === 100 ? "url(#snakeGradient)" : getPercentageTheme(calculateResult()).color}
                strokeWidth="6"
                pathLength="100"
                strokeDasharray="25 75"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 100, opacity: 1 }}
                animate={
                  calculateResult() === 100
                    ? (isInitialSnakeDone
                        ? { strokeDashoffset: [100, 0] } 
                        : { strokeDashoffset: 0 })
                    : { strokeDashoffset: 0, opacity: [1, 1, 0] }
                }
                transition={
                  calculateResult() === 100
                    ? (isInitialSnakeDone
                        ? { repeat: Infinity, duration: 1.5, ease: "linear" }
                        : { duration: 1.5, ease: "easeOut" })
                    : {
                        strokeDashoffset: { duration: 1.5, ease: "easeOut" },
                        opacity: { duration: 1.5, times: [0, 0.7, 1], ease: "linear" }
                      }
                }
                onAnimationComplete={() => {
                  if (calculateResult() === 100 && !isInitialSnakeDone) {
                    setIsInitialSnakeDone(true);
                  }
                }}
              />
            </svg>
            <div
              className={`text-7xl sm:text-8xl font-display font-extrabold tracking-tighter bg-gradient-to-br ${getPercentageTheme(calculateResult()).gradient} bg-clip-text text-transparent percentage-number transition-all duration-[770ms] pr-4 pb-2 -mr-4 -mb-2`}
            >
              {calculateResult()}%
            </div>
          </div>

          <div className="w-48 h-1.5 bg-gray-100 rounded-full mx-auto mb-8 overflow-hidden relative">
            <div
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getPercentageTheme(calculateResult()).gradient} transition-all duration-[770ms] ease-out rounded-full`}
              style={{ width: `${calculateResult()}%` }}
            ></div>
          </div>
        </motion.div>

        <motion.div
          variants={resultItemVariants}
          className="select-none bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm mb-6 w-full relative z-10"
        >
          <div
            className={`select-none text-3xl text-center font-display font-extrabold tracking-tight bg-gradient-to-br ${getPercentageTheme(calculateResult()).gradient} bg-clip-text text-transparent mb-3 block result-title`}
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

        <motion.div
          variants={resultItemVariants}
          className="w-full space-y-6 text-left"
        >
          <div className="select-none flex items-center gap-2 px-1">
            <div className="h-px flex-grow bg-gray-200"></div>
            <span className="text-[12px] uppercase tracking-widest text-gray-400 font-bold whitespace-nowrap">
              深度解析 · Deep Insight
            </span>
            <div className="h-px flex-grow bg-gray-200"></div>
          </div>

          <div 
            className="space-y-6 pb-4 relative"
          >
            {analysis.gaps.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[12px] font-bold text-orange-700 bg-orange-100/50 w-max px-2 py-0.5 rounded-full tracking-wider">
                  认知温差 · GAPS ({analysis.gaps.length})
                </h4>
                <p className="select-none text-[13px] text-orange-800 font-medium opacity-90 px-1 border-l-2 border-orange-300 ml-1 pl-2">
                  在这些细节上，你们的认知出现了明显的“分岔”。
                </p>
                <div className="space-y-2">
                  {analysis.gaps.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white/60 backdrop-blur-sm p-3 pb-6 rounded-xl border border-white/50 text-[13px] leading-snug shadow-sm relative"
                    >
                      <span className="text-gray-500 block">
                        “{item.question}”
                      </span>
                      <div className="select-none absolute bottom-1.5 right-2 flex gap-1">
                        <span className="text-[12px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                          {item.diff >= 4 ? '差距大' : '差距小'}
                        </span>
                        <span className="text-[12px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                          你打 {item.userScore} 分
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

                <AnimatePresence>
                  {showMatches && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                      className="matches-container overflow-hidden"
                    >
                      <div className="space-y-3 pt-1 pb-1">
                        <p className="select-none text-[13px] text-green-800 font-medium opacity-90 px-1 border-l-2 border-green-300 ml-1 pl-2">
                          在这里，你们共享着同一种直觉与默契。
                        </p>
                        <div className="space-y-2">
                          {analysis.matches.map((item, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: -15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ 
                                duration: 0.4, 
                                delay: 0.15 + idx * 0.1,
                                ease: "easeOut"
                              }}
                              className="bg-white/60 backdrop-blur-sm p-3 pb-6 rounded-xl border border-white/50 text-[13px] leading-snug shadow-sm relative"
                            >
                              <span className="text-gray-500 block">
                                “{item.question}”
                              </span>
                              <span className="select-none absolute bottom-1.5 right-2 text-[12px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                                你评 {item.userScore} 分
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

        {/* Creator / Admin Section */}
        <motion.div
           variants={resultItemVariants}
           className="w-full mt-10 space-y-4 pb-10"
        >
          <div className="select-none flex items-center gap-2 px-1">
            <div className="h-px flex-grow bg-gray-200"></div>
            <span className="text-[12px] uppercase tracking-widest text-gray-400 font-bold whitespace-nowrap">
              出题人权限 · AUTHOR ONLY
            </span>
            <div className="h-px flex-grow bg-gray-200"></div>
          </div>

          {!isAdminViewOpen ? (
            <button
              onClick={() => setIsAdminViewOpen(true)}
              className="w-full py-4 bg-gray-50 border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition-all group"
            >
              <Lock size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">查看朋友的答题结果</span>
            </button>
          ) : !adminResults ? (
            <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <Eye size={18} />
                <span className="font-bold text-sm">请输入密语以解锁结果</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  placeholder="请输入您出题时设置的密语"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-klein-blue/30 focus:border-klein-blue/50 transition-all text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchResults()}
                />
              </div>
              {adminError && (
                <p className="text-xs text-red-500 font-medium">{adminError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAdminViewOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleFetchResults}
                  disabled={isAdminLoading || !adminSecret}
                  className="flex-[2] py-2.5 rounded-xl bg-klein-blue text-white text-sm font-bold shadow-md shadow-klein-blue/20 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none"
                >
                  {isAdminLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                  验证并查看
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-4 shadow-sm space-y-3 max-h-[400px] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2 text-green-700">
                  <Users size={18} />
                  <span className="font-bold text-sm">已收到 {adminResults.length} 份回答</span>
                </div>
                <button 
                  onClick={() => { setAdminResults(null); setAdminSecret(""); }}
                  className="text-[11px] text-gray-400 hover:text-gray-600 underline"
                >
                  退出查看
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {adminResults.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 text-sm">
                    暂无朋友回答，快去分享吧！
                  </div>
                ) : (
                  adminResults.map((res: any, idx: number) => {
                    const data = typeof res === 'string' ? JSON.parse(res) : res;
                    const score = calculateResultScore(data.participantScores, quizData.hostScores, quizData.questions.length);
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/40">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-gray-800">{data.participantName}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(data.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-2.5 py-1 rounded-lg text-sm font-black ${getPercentageTheme(score).bgOverlay} ${getPercentageTheme(score).color.replace('text-', 'text-')}`}>
                            {score}%
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
      </ScrollArea>

      <motion.div
        variants={resultItemVariants}
        className="p-6 bg-white/40 border-t border-white/40 space-y-3 flex-shrink-0 z-20 w-full backdrop-blur-md"
      >
        <div className="flex gap-3">
          <button
            onClick={restartQuiz}
            className="flex-1 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md border border-white/50 hover:border-green-forest hover:text-green-dark text-gray-600 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw size={18} />
            再来一次
          </button>
          <button
            onClick={resetToHome}
            className="flex-1 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md border border-white/50 hover:border-gray-400 text-gray-600 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} />
            回到主页
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
