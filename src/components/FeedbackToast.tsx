import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { FeedbackType } from '@/context/FeedbackContext';

interface FeedbackToastProps {
  message: string;
  type: FeedbackType;
  onClose: () => void;
}

export default function FeedbackToast({ message, type, onClose }: FeedbackToastProps) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  };

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    info: 'bg-blue-500/10 border-blue-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      layout
      className={`flex min-w-[300px] max-w-md items-center gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${bgColors[type]}`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-bold text-white/90">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-lg p-1 text-white/30 hover:bg-white/10 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
