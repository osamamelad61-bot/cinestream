import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Play, SkipForward, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { grantAdReward } from '@/services/firebaseService';

export default function AdGateway() {
  const [timeLeft, setTimeLeft] = useState(15);
  const [isFinished, setIsFinished] = useState(false);
  const [isGranting, setIsGranting] = useState(false);
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsFinished(true);
    }
  }, [timeLeft, isFinished]);

  const handleGrantAccess = async () => {
    if (!user) return;
    setIsGranting(true);
    
    try {
      // 1. Inform backend (mock validation)
      const response = await fetch('/api/access/ad-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // 2. Client-side update as fallback for backend permission issues
        await grantAdReward(user.uid, data.expiresAt);
        
        await refreshProfile();
        // Redirect back to home
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      console.error('Error granting access:', error);
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div 
            key="ad-player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl aspect-video bg-zinc-900 rounded-2xl overflow-hidden relative shadow-2xl border border-white/5"
          >
            {/* Mock Ad Video Placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 bg-[#E50914] rounded-full flex items-center justify-center animate-pulse">
                <Play className="fill-white text-white w-8 h-8 ml-1" />
              </div>
              <p className="text-xl font-bold text-gray-400">الإعلان جاري الآن...</p>
            </div>

            {/* Ad Progress */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
              <motion.div 
                className="h-full bg-[#E50914]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 15, ease: "linear" }}
              />
            </div>

            {/* Countdown Overlay */}
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <span className="text-sm font-bold">{timeLeft} ثانية متبقية</span>
            </div>
            
            <div className="absolute bottom-10 left-10 flex items-center gap-3 bg-black/60 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10">
              <ShieldAlert className="text-yellow-500 w-5 h-5" />
              <div className="text-xs">
                <p className="font-bold">شاهد الإعلان بالكامل</p>
                <p className="text-gray-400">للحصول على 60 دقيقة مشاهدة مجانية</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="grant-access"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-10 text-center space-y-8"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="text-green-500 w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">تمت المشاهدة بنجاح!</h2>
              <p className="text-gray-400">يمكنك الآن المشاهدة مجاناً لمدة ساعة كاملة.</p>
            </div>

            <div className="bg-black/40 rounded-xl p-4 flex items-center justify-between border border-white/5">
              <div className="flex items-center gap-3">
                <Clock className="text-[#E50914] w-5 h-5" />
                <span className="text-sm">مدة الصلاحية</span>
              </div>
              <span className="font-mono text-[#E50914]">60:00 دقيقة</span>
            </div>

            <button 
              onClick={handleGrantAccess}
              disabled={isGranting}
              className="w-full py-4 bg-[#E50914] hover:bg-[#b90710] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              {isGranting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>المتابعة للموقع</span>
                  <SkipForward className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
