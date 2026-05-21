import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";

export type ConfirmTheme = "green" | "blue" | "red";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  theme?: ConfirmTheme;
  icon?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  theme = "blue",
  icon,
  cancelText = "取消",
  confirmText = "确定",
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    // Set attribute on body so other keydown listeners can voluntarily check if needed
    document.body.setAttribute("data-confirm-modal-open", "true");

    const handleKeyDownCapture = (e: KeyboardEvent) => {
      // INTERCEPT AND STOP ALL shortcuts on the parent page!
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    // Register capture-phase listener to intercept events before other listeners on the window
    window.addEventListener("keydown", handleKeyDownCapture, true);

    return () => {
      document.body.removeAttribute("data-confirm-modal-open");
      window.removeEventListener("keydown", handleKeyDownCapture, true);
    };
  }, [isOpen, onConfirm, onClose]);

  if (!isOpen) return null;

  // Theme styling definitions
  const themeStyles = {
    green: {
      iconBg: "bg-green-50 text-green-700 border border-green-100/50",
      confirmBtn: "bg-green-forest hover:bg-green-600 shadow-green-200/50 focus:ring-green-400",
    },
    blue: {
      iconBg: "bg-klein-blue/10 text-klein-blue border border-klein-blue/5",
      confirmBtn: "bg-klein-blue hover:bg-klein-blue-light shadow-klein-blue/20 focus:ring-klein-blue",
    },
    red: {
      iconBg: "bg-red-50 text-red-500 border border-red-100/30",
      confirmBtn: "bg-red-500 hover:bg-red-600 shadow-red-200/50 focus:ring-red-400",
    },
  };

  const currentTheme = themeStyles[theme] || themeStyles.blue;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-auto select-none"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2, type: "spring", bounce: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col items-center border border-white/80"
        >
          {icon && (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${currentTheme.iconBg}`}>
              {icon}
            </div>
          )}
          <h3 className="text-xl font-extrabold text-gray-800 mb-2 text-center select-text">{title}</h3>
          <p className="text-gray-500 text-center text-sm mb-6 select-text">{description}</p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold transition-all text-sm outline-none cursor-pointer focus:ring-2 focus:ring-gray-300"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl text-white font-bold shadow-md transition-all text-sm outline-none cursor-pointer focus:ring-2 ${currentTheme.confirmBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
