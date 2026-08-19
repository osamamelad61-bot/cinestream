
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Clock, Trash2 } from 'lucide-react';
import { getHistory, removeFromHistory, clearHistory, WatchingProgress, saveProgress } from '@/utils/progress';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { clearWatchingProgress, getWatchingProgress } from '@/services/firebaseService';

export default function ContinueWatchingRow() {
  const [history, setHistory] = useState<WatchingProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    const localHistory = getHistory();
    setHistory(localHistory);

    async function syncFirestoreProgress() {
      if (user) {
        setLoading(true);
        try {
          const firestoreProgress = await getWatchingProgress(user.uid);
          if (firestoreProgress && firestoreProgress.length > 0) {
            // Simple merge: Firestore takes precedence for recent items
            // But let's just use Firestore if it has data and localStorage is less recent
            // For simplicity, we just use Firestore if available to show "synced" status
            setHistory(firestoreProgress as WatchingProgress[]);
            
            // Optionally update localStorage to keep it in sync
            firestoreProgress.reverse().forEach(p => saveProgress(p as any));
          }
        } catch (error) {
          console.error("Failed to sync progress:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    syncFirestoreProgress();
  }, [user]);

  const handleRemove = (e: React.MouseEvent, id: string, type: 'movie' | 'tv') => {
    e.stopPropagation();
    removeFromHistory(id, type);
    setHistory(getHistory());
  };

  const handleClearAll = async () => {
    clearHistory();
    if (user) {
      try {
        await clearWatchingProgress(user.uid);
      } catch (err) {
        console.error("Failed to clear firestore history:", err);
      }
    }
    setHistory([]);
  };

  if (history.length === 0) return null;

  return (
    <div className="space-y-6 mb-12 px-4 md:px-12 text-[var(--text-primary)]">
      <div className="flex items-center justify-between border-s-4 border-[#E50914] ps-4">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-[#E50914]" />
          <h2 className="text-2xl font-bold font-arabic">
            {language === 'en' ? 'Continue Watching' : 'تابِع المشاهدة'}
          </h2>
        </div>
        
        <button 
          onClick={handleClearAll}
          className="relative z-[60] flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors uppercase tracking-wider bg-[var(--border-color)] px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:border-red-500/30 shadow-sm active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Clear All' : 'مسح الكل'}</span>
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {history.map((item) => (
            <motion.div
              key={`${item.type}-${item.id}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => navigate(`/watch/${item.type}/${item.id}`)}
              className="flex-none w-48 sm:w-56 group cursor-pointer relative"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl border border-[var(--border-color)] bg-[var(--border-color)]/20">
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#E50914] rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 text-white fill-current" />
                  </div>
                </div>

                <button
                  onClick={(e) => handleRemove(e, item.id, item.type)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white/70 hover:text-white transition-colors z-10 opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div 
                    className="h-full bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.8)]"
                    style={{ width: `${isNaN(item.progress) ? 0 : item.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 px-1">
                <h3 className="font-bold text-sm transition-colors truncate leading-tight">
                  {item.title}
                </h3>
                {item.type === 'tv' && (item.season !== undefined || item.episode !== undefined) && (
                  <p className="text-xs text-[#E50914] font-medium mt-1">
                    {language === 'en' 
                      ? `S${item.season || 0} E${item.episode || 0}` 
                      : `الموسم ${item.season || 0} - الحلقة ${item.episode || 0}`}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
