import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trash2, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ContinueWatchingRow from '@/components/ContinueWatchingRow';
import { getFavorites, removeFromFavorites } from '@/services/firebaseService';
import { useAuth } from '@/context/AuthContext';
import { BACKDROP_BASE_URL } from '@/services/tmdbService';
import { useLanguage } from '@/context/LanguageContext';

export default function Favorites() {
  const { language, t } = useLanguage();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const favs = await getFavorites(user.uid);
        setFavorites(favs || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, [user]);

  const handleRemove = async (e: React.MouseEvent, favId: string) => {
    e.stopPropagation();
    await removeFromFavorites(favId);
    setFavorites(prev => prev.filter(f => f.id !== favId));
  };

  const handleItemClick = (fav: any) => {
    navigate(`/watch/${fav.mediaType}/${fav.itemId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
          <Heart className="h-20 w-20 text-gray-400 mb-4" />
          <h1 className="text-3xl font-bold">{language === 'en' ? 'Please log in' : 'يرجى تسجيل الدخول'}</h1>
          <p className="opacity-70">{language === 'en' ? 'You must log in to see your favorites' : 'يجب عليك تسجيل الدخول لتتمكن من رؤية قائمتك المفضلة'}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-2 bg-[#E50914] rounded font-bold hover:bg-[#b20710] transition-colors text-white shadow-lg"
          >
            {language === 'en' ? t('home') : 'العودة للرئيسية'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />
      
      <main className="pt-24 pb-12 px-6 md:px-12">
        <ContinueWatchingRow />
        
        <div className="mb-12 flex items-center space-x-3 md:space-x-4 border-l-4 border-[#E50914] pl-4">
          <Heart className="h-8 w-8 text-[#E50914] fill-current" />
          <h1 className="text-3xl font-bold md:text-5xl">{language === 'en' ? t('favorites') : 'قائمتي المفضلة'}</h1>
        </div>

        {loading ? (
          <div className="flex h-[50vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E50914] border-t-transparent" />
          </div>
        ) : (
          <>
            {favorites.length === 0 ? (
              <div className="text-center py-24 bg-[var(--border-color)]/20 rounded-2xl border border-dashed border-[var(--border-color)] px-4">
                <p className="text-2xl opacity-50 mb-6">{language === 'en' ? 'Your list is currently empty' : 'قائمتك خالية حالياً'}</p>
                <button 
                  onClick={() => navigate('/')}
                  className="px-8 py-3 bg-[#E50914] text-white rounded-full font-bold hover:bg-[#b20710] transition-all hover:scale-105 shadow-xl"
                >
                  {language === 'en' ? 'Explore Content' : 'استكشف المحتوى'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {favorites.map((fav, index) => (
                  <motion.div
                    key={fav.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleItemClick(fav)}
                    className="group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-xl shadow-2xl transition-all duration-300 bg-[var(--card-bg)] border border-[var(--border-color)]"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500${fav.posterPath}`}
                      alt={fav.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4">
                      <h3 className="font-bold text-sm line-clamp-2 mb-2">{fav.title}</h3>
                      <button 
                        onClick={(e) => handleRemove(e, fav.id)}
                        className="flex items-center justify-center space-x-2 w-full py-2 bg-red-600/80 hover:bg-red-600 rounded-lg backdrop-blur-md transition-all text-[10px] font-bold"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>{language === 'en' ? 'Remove' : 'إزالة من القائمة'}</span>
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded text-[9px] font-bold shadow-lg">
                      {fav.mediaType === 'tv' ? (language === 'en' ? 'Series' : 'مسلسل') : (language === 'en' ? 'Movie' : 'فيلم')}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            <p className="mt-12 text-center text-gray-500 text-sm">
              {language === 'en' ? `You have ${favorites.length} items in your favorites` : `لديك ${favorites.length} أعمال في قائمتك المفضلة`}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
