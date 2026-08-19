import { useEffect, useState } from 'react';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { tmdb, requests, BACKDROP_BASE_URL } from '@/services/tmdbService';
import { Movie } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);

  const handleWatchClick = () => {
    const movie = movies[currentIndex];
    const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
    navigate(`/watch/${type}/${movie.id}`);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await tmdb.get(requests.trending);
        const results = response.data.results.filter((m: Movie) => m.backdrop_path).slice(0, 5);
        setMovies(results);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching hero movies:", error);
        if (error?.response?.status === 401) {
          setError("Invalid TMDB API Key. Please provide a valid key in settings.");
        } else {
          setError("Failed to load hero section.");
        }
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (error) {
    return (
      <div className="flex h-[95vh] w-full items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Oops! Something went wrong</h2>
          <p className="opacity-70">{error}</p>
        </div>
      </div>
    );
  }

  if (movies.length === 0) return <div className="h-[95vh] w-full bg-[var(--bg-primary)]/50" />;

  const movie = movies[currentIndex];
  const displayTitle = movie.title || movie.name;
  const displayOverview = movie.overview;

  return (
    <div className="relative h-[80vh] md:h-[95vh] w-full overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0 h-full w-full bg-[var(--bg-primary)]"
        >
          <img
            src={movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : `${BACKDROP_BASE_URL}${movie.poster_path}`}
            alt={displayTitle}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)]/70 via-[var(--bg-primary)]/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="flex h-full flex-col justify-center px-6 md:px-12 relative z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl space-y-4 md:space-y-6 pointer-events-auto text-[var(--text-primary)]"
          >
            <h1 className="text-3xl font-extrabold drop-shadow-lg md:text-5xl lg:text-7xl leading-[1.1] mb-2">
              {displayTitle}
            </h1>

          <div className="flex items-center space-x-3 md:space-x-4 rtl:space-x-reverse text-xs md:text-sm font-bold text-green-500 my-2 md:my-3">
             <span>98% Match</span>
             <span className="text-[var(--text-primary)] opacity-70">{new Date(movie.release_date || movie.first_air_date || Date.now()).getFullYear() || '2024'}</span>
             <span className="border border-current px-1 inline-block text-[9px] md:text-[10px] opacity-70">18+</span>
             <span className="border border-current px-1 inline-block text-[9px] md:text-[10px] opacity-70">HD</span>
          </div>

          <p className="line-clamp-3 text-xs opacity-90 drop-shadow-md md:text-base lg:text-lg max-w-lg leading-relaxed">
            {displayOverview}
          </p>

          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={handleWatchClick}
              className="group flex flex-1 md:flex-none items-center justify-center gap-2 rounded-full bg-[#E50914] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-[#ff0f1b] hover:scale-105 active:scale-95 md:px-10 md:py-4 md:text-xl shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:shadow-[#E50914]/60 border border-[#E50914]/20"
            >
              <Play className="h-5 w-5 md:h-7 md:w-7 fill-current" />
              <span>{t('watchNow')} ✨</span>
            </button>
            <button 
              onClick={handleWatchClick}
              className="flex flex-1 md:flex-none items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95 md:px-10 md:py-4 md:text-xl border border-white/20 hover:border-white/40 shadow-xl"
            >
              <Info className="h-5 w-5 md:h-7 md:w-7" />
              <span>{t('details')} 🔍</span>
            </button>
          </div>
        </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      <div className="absolute inset-0 hidden md:flex items-center justify-between px-4 md:px-10 z-40 pointer-events-none">
        <button
          onClick={() => setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1))}
          className="pointer-events-auto p-2 bg-black/30 hover:bg-black/60 rounded-full border border-white/10 hover:border-white/40 transition-all text-white backdrop-blur-sm"
        >
          <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1))}
          className="pointer-events-auto p-2 bg-black/30 hover:bg-black/60 rounded-full border border-white/10 hover:border-white/40 transition-all text-white backdrop-blur-sm"
        >
          <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
        </button>
      </div>

      <div className="absolute bottom-6 md:bottom-10 left-1/2 flex -translate-x-1/2 space-x-2 md:space-x-3 z-40">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "h-1 md:h-1.5 rounded-full transition-all duration-500", 
              i === currentIndex ? "w-6 md:w-10 bg-[#E50914] shadow-[0_0_10px_rgba(229,9,20,0.8)]" : "w-2 md:w-3 bg-white/40 hover:bg-white"
            )}
          />
        ))}
      </div>
    </div>
  );
}
