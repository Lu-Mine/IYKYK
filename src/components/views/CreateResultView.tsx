import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Check, Download, Loader2, Home, ExternalLink } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import { saveQuizToVercel } from "../../services/api";

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

  const shareUrl = userid ? `https://iykyk.xlumi.cn/customquiz/${userid}` : 'https://iykyk.xlumi.cn/';

  const handleDownload = async () => {
    if (!posterRef.current) return;
    try {
      const canvas = await html2canvas(posterRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imgData;
      a.download = `IYKYK-${hostName}的专属问卷.png`;
      a.click();
    } catch (e) {
      console.error(e);
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar w-full relative">
        <div className="p-6 pb-24 flex flex-col items-center justify-center min-h-full">
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
        </div>

        {/* Poster Design */}
        <div 
          ref={posterRef}
          className="w-full max-w-[320px] bg-gradient-to-br from-klein-blue to-[#1A42A8] rounded-3xl p-6 shadow-xl flex flex-col items-center text-white relative overflow-hidden"
        >
           {/* Decorator */}
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
           <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

           <h3 className="text-xl font-bold font-display z-10 mb-2 drop-shadow-sm text-center">从我的试卷里，<br/>懂我。</h3>
           <p className="text-xs text-white/80 z-10 font-medium mb-6">共 {questions.length} 题</p>
           
           <div className="bg-white p-3 rounded-2xl shadow-inner z-10">
             <QRCodeCanvas value={shareUrl} size={140} fgColor="#002FA7" style={{ display: "block" }} />
           </div>
           
           <p className="text-[10px] text-white/60 mt-4 z-10 font-mono select-all">
             长按保存或扫描二维码
           </p>
        </div>
      </div>
      </div>

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
