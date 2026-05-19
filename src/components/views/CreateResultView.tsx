import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import { Check, Download, Loader2, Home, ExternalLink, Github, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { saveQuizToVercel } from "../../lib/api";
import { ScrollArea } from "../ui/ScrollArea";

interface Props {
  hostName: string;
  secret: string;
  title: string;
  description: string;
  questions: string[];
  hostScores: number[];
  onExit: () => void;
  userid: string | null;
}

export default function CreateResultView({ hostName, secret, title, description, questions, hostScores, onExit, userid }: Props) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [posterTitle, setPosterTitle] = useState("从我的试卷里，懂我。");
  const [copied, setCopied] = useState(false);
  const shareUrl = userid ? `https://iykyk.xlumi.cn/customquiz/${userid}` : 'https://iykyk.xlumi.cn/';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;
    try {
      const canvas = await html2canvas(posterRef.current, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
          // Find the poster in the cloned document
          const clonedPoster = clonedDoc.querySelector('[ref="posterRef"]') || 
                               clonedDoc.body.querySelector('.rounded-3xl.p-6.pt-16');
          
          if (clonedPoster) {
            // Fix for html2canvas oklab/oklch error: 
            // Force all elements to use their computed RGB colors
            const allElements = clonedPoster.querySelectorAll('*');
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const style = window.getComputedStyle(htmlEl);
              
              // html2canvas doesn't support backdrop-filter either, so we disable it in the clone
              if (htmlEl.style) {
                htmlEl.style.backdropFilter = 'none';
                htmlEl.style.webkitBackdropFilter = 'none';
              }
            });

            // Specific fix for the input in the poster
            const input = clonedPoster.querySelector('input');
            if (input) {
              const div = clonedDoc.createElement('div');
              div.innerText = input.value;
              div.style.cssText = window.getComputedStyle(input).cssText;
              div.style.border = 'none';
              div.style.background = 'transparent';
              div.style.display = 'flex';
              div.style.justifyContent = 'center';
              div.style.alignItems = 'center';
              div.style.textAlign = 'center';
              div.style.width = '100%';
              div.style.color = '#ffffff';
              div.style.fontSize = '20px';
              div.style.fontWeight = '700';
              // Manually raise by 0.9 lines (~16-18px)
              div.style.transform = 'translateY(-16px)';
              input.parentNode?.replaceChild(div, input);
            }

            // Move header background up by 1.5 lines while keeping text in place
            const header = clonedPoster.querySelector('.absolute.top-5');
            if (header) {
              const headerContainer = header as HTMLElement;
              const headerSpan = header.querySelector('span') as HTMLElement;
              
              headerContainer.style.top = '22px'; 
              
              if (headerSpan) {
                headerSpan.style.transform = 'translateY(-6px)';
              }
            }

            // Move github logo down by approx 50% relative to its line
            const githubIcon = clonedPoster.querySelector('.lucide-github');
            if (githubIcon) {
              (githubIcon as HTMLElement).style.transform = 'translateY(2px)';
            }
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imgData;
      a.download = `IYKYK-${hostName}的专属问卷.png`;
      a.click();
    } catch (e) {
      console.error("Poster Generation Error:", e);
    }
  };

  return (
    <motion.div
      layout
      key="create_result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col flex-1 w-full min-h-0 overflow-hidden relative"
    >
      <ScrollArea className="flex-1 custom-scrollbar w-full" contentClassName="relative min-h-full">
        <div className="p-6 pb-12 flex flex-col items-center justify-center min-h-full">
          <div className="mb-6 text-center">
          <div className="select-none flex flex-col items-center mb-4">
            <p className="text-sm text-gray-400 mb-1 uppercase tracking-[0.2em] font-bold">
              出题结果
            </p>
            <p style={{ fontSize: '10px' }} className="text-gray-300 font-semibold tracking-[0.15em] uppercase font-sans">
              Quiz Result
            </p>
          </div>
          
          <div className="flex justify-center w-full min-w-0">
             <div className="px-5 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/50 flex items-center justify-center max-w-full">
               <span className="text-klein-blue text-xl sm:text-2xl font-black truncate">
                 {hostName}
               </span>
             </div>
          </div>
           
          <p className="text-sm text-gray-500 mt-4 font-medium">你已完成出题！</p>
          <p className="text-[11px] text-gray-400 mt-1 font-medium italic animate-pulse">
            可以点击海报处的标题修改标题
          </p>
        </div>

        {/* Poster Design */}
        <div 
          ref={posterRef}
          className="w-full max-w-[320px] rounded-3xl p-6 pt-16 pb-14 flex flex-col items-center relative overflow-hidden"
          style={{ 
            color: '#ffffff',
            backgroundColor: '#002FA7',
            backgroundImage: 'linear-gradient(to bottom right, #002FA7, #1A42A8)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' 
          }}
        >
           {/* Header */}
           <div className="absolute top-5 left-0 right-0 flex justify-center z-10 w-full">
             <div 
               className="px-3 py-1 rounded-full border flex items-center justify-center"
               style={{ 
                 backgroundColor: 'rgba(255, 255, 255, 0.1)',
                 borderColor: 'rgba(255, 255, 255, 0.2)',
                 backdropFilter: 'blur(4px)'
               }}
             >
               <span className="text-[10px] font-medium tracking-wider leading-none" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                 来自 {hostName} 的 Quiz
               </span>
             </div>
           </div>

           {/* Decorator */}
           <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', filter: 'blur(40px)' }}></div>
           <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', filter: 'blur(40px)' }}></div>

           <input
             className="text-xl font-bold font-display z-10 mb-2 text-center bg-transparent border border-transparent hover:border-white/30 focus:border-white/50 rounded outline-none transition-colors w-[90%]"
             style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.05))' }}
             value={posterTitle}
             onChange={(e) => setPosterTitle(e.target.value)}
           />
           <p className="text-xs z-10 font-medium mb-6" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>共 {questions.length} 题</p>
           
           <div className="z-10 mt-2 mb-4">
             <QRCodeSVG 
               value={shareUrl} 
               size={130} 
               fgColor="#E0E7FF" 
               bgColor="transparent" 
               style={{ display: "block" }} 
             />
           </div>
           
           <p className="text-[10px] z-10 font-mono select-all" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
             长按保存或扫描二维码
           </p>

           {/* Footer */}
           <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end z-10 w-[calc(100%-3rem)]">
              <div className="flex flex-col items-start gap-0.5">
                <div className="flex gap-1 items-center" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  <Github size={10} className="relative -top-[0.5px]" />
                  <span className="text-[8px] font-medium font-mono">Lu-Mine</span>
                </div>
                <span className="text-[9px] font-bold tracking-wider leading-none" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>IYKYK</span>
              </div>
              <div className="text-[8.5px] font-medium tracking-widest uppercase mb-0.5" style={{ color: 'rgba(255, 255, 255, 0.4)', fontVariant: 'small-caps' }}>
                If you know you know
              </div>
           </div>
        </div>

        {/* URL and Secret Info */}
        <div className="mt-8 bg-gray-50/80 w-full max-w-[320px] rounded-2xl p-5 border border-gray-100 flex flex-col items-center text-center shadow-sm">
          <p className="text-sm text-gray-600 font-medium mb-1">查询密语：<span className="font-mono font-bold text-klein-blue select-all text-lg ml-1">{secret}</span></p>
          <div className="text-xs text-gray-400 leading-relaxed mt-2 border-t border-gray-100 pt-3 flex flex-col items-center w-full">
            访问链接
            <div className="flex items-center gap-1.5 mt-2 mb-2 w-full max-w-[85%]">
              <div className="font-mono text-gray-500 bg-white px-2 py-1.5 rounded border border-gray-100 overflow-x-auto whitespace-nowrap custom-scrollbar flex-1 select-all min-w-0 text-left">
                {shareUrl}
              </div>
              <button 
                onClick={handleCopy}
                className="p-1.5 text-gray-400 hover:text-klein-blue hover:bg-klein-blue/5 rounded shrink-0 transition-colors bg-white border border-gray-100 shadow-sm"
                title="复制链接"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
            并在网页中填写以上密语，即可查看答题情况。
          </div>
        </div>
      </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-6 bg-white/40 border-t border-white/40 space-y-3 flex-shrink-0 z-20 w-full backdrop-blur-md">
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-800 font-bold py-3.5 rounded-2xl transition-all shadow-sm border border-gray-200 flex justify-center items-center gap-2"
          >
            <Download size={18} /> 保存海报
          </button>
          <button
            onClick={() => { window.location.href = shareUrl }}
            className="flex-[2] bg-klein-blue hover:bg-klein-blue-light text-white font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-klein-blue/30 flex justify-center items-center gap-2"
          >
            <ExternalLink size={18} /> 重定向到链接
          </button>
        </div>
      </div>
    </motion.div>
  );
}
