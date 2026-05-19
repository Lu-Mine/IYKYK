import { motion } from "motion/react";
import { Github } from "lucide-react";

interface HomeViewProps {
  hostName: string;
  userName: string;
  setUserName: (val: string) => void;
  handleStart: () => void;
}

export function HomeGreenWindow({ commitHash }: { commitHash: string }) {
  return (
    <motion.div
      key="sub-window"
      initial={{ y: "2.5rem", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "2.5rem", opacity: 0, transition: { duration: 0.3 } }}
      transition={{ delay: 0.4, duration: 0.6, type: "spring", bounce: 0.3 }}
      className="absolute top-0 inset-x-0 h-[5rem] z-0 flex flex-col pointer-events-none"
    >
      <div className="flex-1 bg-[#e6ebd9]/70 backdrop-blur-xl rounded-t-3xl shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.1)] border border-white/30 px-6 leading-none block pointer-events-auto">
        <div className="h-[2.5rem] flex justify-between items-center">
          <span className="translate-y-[1.5px] font-cinzel text-[14px] font-semibold text-[#8b9183] tracking-normal select-none flex items-center">
            Powered by Lumine
          </span>
          <a
            href="https://github.com/Lu-Mine/IYKYK"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#9ca393] hover:text-green-dark transition-colors flex items-center gap-2 group"
          >
            <span className="select-none font-mono text-[12px] opacity-80 group-hover:opacity-100 transition-opacity pt-[1px]">
              IYKYK({commitHash})
            </span>
            <Github className="w-[19px] h-[19px]" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomeView({ hostName, userName, setUserName, handleStart }: HomeViewProps) {
  return (
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
      className="flex flex-col flex-grow w-full h-full min-h-0 overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-8 pb-10 flex flex-col relative">
        <div className="my-auto w-full">
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
            className="mb-5 w-full"
          >
            <div className="text-left mb-5">
              <span className="select-none font-sans text-base text-gray-500 mr-1 not-italic font-medium">
                From{" "}
              </span>
              <span className="font-[Cambria,'Caladea',ui-serif,Georgia,'Times_New_Roman',Times,serif] text-2xl tracking-wide text-green-dark italic">
                {hostName}
              </span>
              <span className="font-sans text-base text-gray-500 mr-1 not-italic font-medium">
                {" "}:
              </span>
            </div>
            <h1 className="text-2xl font-bold font-display text-green-dark text-center leading-snug">
              你和我，见识同一个我吗？
            </h1>
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
            className="leading-relaxed space-y-6"
          >
            <p className="text-sm text-gray-600 text-justify tracking-tight">
              欢迎来到这里！
              <br />
              这个网页被创建的原因，来源于我的困扰：我总是很在意他人的评价，然后忽略自我的看法。我考虑到，想正确客观建立对自己的评价，也许需要看看自评与他评之间的“温差”。
              <br />
              在这个一直给人扣帽子的时代，我推崇少用
              <a href="https://www.16personalities.com/" target="_blank" rel="noopener noreferrer" className="link-underline text-gray-700">MBTI</a>
              或是星座什么的来引发共鸣，而是回归到人与人间最具体的细节里面找共识。
            </p>

            <blockquote className="mb-6 border-l-[3px] border-green-forest/40 bg-green-forest/5 rounded-r-md px-3 py-2 my-2 text-sm text-gray-800 text-justify tracking-tight">
              <b>这个 Quiz 的意义在于比较：</b>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 my-2 w-full">
                <span className="text-right text-base font-bold bg-gradient-to-r from-green-forest to-emerald-500 bg-clip-text text-transparent">我对自己的评价</span>
                <span className="text-sm font-normal text-gray-500 text-center">和</span>
                <span className="text-left text-base font-bold bg-gradient-to-r from-emerald-500 to-green-400 bg-clip-text text-transparent">你对我作的评价</span>
              </div>
              <div className="items-center"> 这样就能知道我心目中的自己和你眼里的我有怎样的差距。 </div>
            </blockquote>

            <p className="text-[13px] text-gray-400 text-justify leading-snug tracking-tight">
              Tips: 这个项目我自己完成了功能逻辑、交互设计，以及你看到的这组范例试卷的自评测算。当然了，要落地这个，还得拜托（指挥）我最近很喜欢用的
              <a href="https://ai.studio/build" target="_blank" rel="noopener noreferrer" className="link-underline text-gray-500">Google Gemini</a>
              帮我编写代码调试。我挺喜欢的，至少比豆包聪明。
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div
        variants={{
          enter: { opacity: 0, y: 20 },
          center: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.33 },
          },
          exit: {
            opacity: 0,
            y: 10,
            transition: { duration: 0.17 },
          },
        }}
        className="p-6 bg-white/40 border-t border-white/40 flex flex-col gap-3 flex-shrink-0 z-20 w-full backdrop-blur-md"
      >
        <input
          type="text"
          placeholder="请输入你的昵称"
          maxLength={10}
          className="select-none w-full px-4 py-3 rounded-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-green-forest focus:border-transparent transition-all text-center bg-white/60 shadow-sm backdrop-blur-sm"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
        />
        <button
          onClick={handleStart}
          disabled={!userName.trim()}
          className="w-full bg-green-forest hover:bg-green-dark text-white font-bold text-lg py-3 rounded-xl transition-all shadow-md shadow-green-200/50 disabled:shadow-none disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          开始挑战
        </button>
      </motion.div>
    </motion.div>
  );
}
