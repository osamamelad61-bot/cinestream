import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/firebase';
import { Users } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const recordVisit = async () => {
      try {
        const statsRef = doc(db, 'visitor_stats', 'global');
        
        // Use sessionStorage to only count once per session
        const hasVisited = sessionStorage.getItem('has_visited');
        
        if (!hasVisited) {
          const docSnap = await getDoc(statsRef);
          if (docSnap.exists()) {
            await updateDoc(statsRef, {
              count: increment(1)
            });
          } else {
            await setDoc(statsRef, { count: 1 });
          }
          sessionStorage.setItem('has_visited', 'true');
        }

        // Fetch current count
        const newSnap = await getDoc(statsRef);
        if (newSnap.exists()) {
          setCount(newSnap.data().count);
        }
      } catch (error) {
        console.error("Error with visitor count:", error);
      }
    };

    recordVisit();
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-2 bg-[var(--border-color)]/50 px-4 py-2 rounded-full border border-[var(--border-color)] text-gray-400">
      <Users className="h-4 w-4 text-[#E50914]" />
      <span className="font-mono text-sm tracking-widest">{count.toLocaleString()}</span>
      <span className="text-xs uppercase tracking-widest ml-1">{language === 'en' ? 'Visitors' : 'زائر'}</span>
    </div>
  );
}
