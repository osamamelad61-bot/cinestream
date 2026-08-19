import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { tmdb, POSTER_BASE_URL } from '@/services/tmdbService';
import { Movie } from '@/types';
import { motion } from 'motion/react';
import MovieRowSkeleton from './MovieRowSkeleton';

interface Props {
  title: string;
  fetchUrl: string;
  onMovieClick?: (movie: Movie) => void;
}

export default function MovieRow({ title, fetchUrl, onMovieClick }: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await tmdb.get(fetchUrl);

        // 🔥 FIX: prevent empty/invalid data crash
        const results = response?.data?.results || [];

        setMovies(results);
        setError(false);
      } catch (error) {
        console.error(`Error fetching movies for ${title}:`, error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [fetchUrl, title]);

  if (error || (!loading && movies.length === 0)) return null;
  if (loading) return <MovieRowSkeleton />;

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;

      rowRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-8 space-y-2 px-4 md:px-12 text-[var(--text-primary)]">
      <h2 className="group flex cursor-pointer items-center text-lg font-bold transition duration-300 hover:text-[#E50914] md:text-xl">
        {title}
        <ChevronRight className="ms-1 h-5 w-5 opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100 rtl:rotate-180" />
      </h2>

      <div className="group relative">
        {/* LEFT ARROW - Hidden on mobile */}
        <div className="absolute top-0 bottom-0 start-0 z-40 hidden md:flex items-center bg-[var(--card-bg)]/20 opacity-0 transition-opacity duration-300 hover:bg-[var(--card-bg)]/40 group-hover:opacity-100">
          <ChevronLeft
            className="h-10 w-10 cursor-pointer transition hover:scale-125 rtl:rotate-180"
            onClick={() => handleScroll('left')}
          />
        </div>

        {/* ROW */}
        <div
          ref={rowRef}
          className="movie-row-container flex items-center space-x-2 md:space-x-3 rtl:space-x-reverse overflow-x-scroll scrollbar-hide py-3 md:py-4 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {movies
            .filter((movie) => movie.poster_path || movie.backdrop_path)
            .map((movie) => {
              const displayTitle = movie.title || movie.name;

              return (
                <motion.div
                  key={movie.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => onMovieClick?.(movie)}
                  className="group/item relative h-32 min-w-[220px] md:h-40 md:min-w-[300px] cursor-pointer transition duration-300 first:ms-0"
                >
                  <img
                    src={
                      movie.poster_path
                        ? `${POSTER_BASE_URL}${movie.poster_path}`
                        : `${POSTER_BASE_URL}${movie.backdrop_path}`
                    }
                    alt={displayTitle}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full rounded-lg object-cover shadow-lg transition duration-300 group-hover/item:shadow-black/60 group-hover/item:ring-2 group-hover/item:ring-[#E50914]/40"
                  />

                  <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-all duration-300 bg-gradient-to-t from-black/95 via-black/30 to-transparent group-hover/item:opacity-100 rounded-lg">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform scale-0 group-hover/item:scale-100 transition-transform duration-500 delay-100">
                      <div className="bg-[#E50914] p-2 md:p-3 rounded-full shadow-[0_0_15px_rgba(229,9,20,0.6)]">
                         <Play className="h-4 w-4 md:h-6 md:w-6 text-white fill-current" />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white line-clamp-1 leading-tight translate-y-2 transition-transform duration-300 group-hover/item:translate-y-0">
                      {displayTitle}
                    </span>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1.5 translate-y-2 transition-transform duration-300 group-hover/item:translate-y-0 text-[10px] text-gray-300">
                      <span className="uppercase">{movie.original_language}</span>
                      <span>•</span>
                      <span className="text-yellow-500 font-bold">{movie.vote_average?.toFixed(1)} ⭐</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* RIGHT ARROW - Hidden on mobile */}
        <div className="absolute top-0 bottom-0 end-0 z-40 hidden md:flex items-center bg-[var(--card-bg)]/20 opacity-0 transition-opacity duration-300 hover:bg-[var(--card-bg)]/40 group-hover:opacity-100">
          <ChevronRight
            className="h-10 w-10 cursor-pointer transition hover:scale-125 rtl:rotate-180"
            onClick={() => handleScroll('right')}
          />
        </div>
      </div>
    </div>
  );
}
