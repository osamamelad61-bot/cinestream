import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowLeft, Play } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { tmdb } from '@/services/tmdbService';
import { Movie } from '@/types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useFeedback } from '@/context/FeedbackContext';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const page = parseInt(params.get('page') || '1') || 1;
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { showFeedback } = useFeedback();

  useEffect(() => {
    const blockedKeywords = ['hunti', 'حنت', 'حنتى', 'حنتي', 'سكس', 'xnx', 'xnxx', 'porn', 'برازيلي', 'adult'];
    const isBlocked = blockedKeywords.some(keyword => query.toLowerCase().includes(keyword));

    if (isBlocked) {
      setSearchResults([]);
      setTotalPages(1);
      setIsLoading(false);
      showFeedback(
        language === 'en' 
          ? 'This search query is blocked.' 
          : 'عذراً، هذا البحث غير مسموح به.',
        'error'
      );
      return;
    }

    if (query.trim().length > 0) {
      setIsLoading(true);
      
      const p1 = page * 3 - 2;
      const p2 = page * 3 - 1;
      const p3 = page * 3;
      
      Promise.all([
        tmdb.get('/search/multi', { params: { query, page: p1 } }),
        tmdb.get('/search/multi', { params: { query, page: p2 } }),
        tmdb.get('/search/multi', { params: { query, page: p3 } })
      ])
        .then(([res1, res2, res3]) => {
          const allMovies = [
            ...(res1?.data?.results || []),
            ...(res2?.data?.results || []),
            ...(res3?.data?.results || [])
          ];
          const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values())
            .filter((m: any) => m.poster_path || m.backdrop_path);
          
          setSearchResults(uniqueMovies);
          setTotalPages(Math.min(Math.ceil((res1?.data?.total_pages || 0) / 3) || 1, 166));
        })
        .catch(err => {
          console.error(err);
          showFeedback(
            language === 'en' 
              ? 'Search failed. Please check your connection.' 
              : 'فشل البحث. يرجى التحقق من الاتصال.',
            'error'
          );
        })
        .finally(() => setIsLoading(false));
    } else {
      setSearchResults([]);
      setTotalPages(1);
    }
    window.scrollTo(0, 0);
  }, [query, page]);

  const handleMovieClick = (movie: Movie) => {
    const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
    navigate(`/watch/${type}/${movie.id}`);
  };

  const handlePageChange = (newPage: number) => {
    setParams({ q: query, page: newPage.toString() });
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />
      
      <main className="relative z-10 px-4 pt-32 pb-24 lg:px-12 min-h-screen">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center space-x-3 px-5 py-2.5 bg-[var(--border-color)] hover:bg-[#E50914]/20 rounded-xl hover:text-white transition-all duration-300 border border-[var(--border-color)] active:scale-95 group shadow-xl"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-bold text-sm tracking-wide">🔙 {language === 'en' ? 'Back' : 'العودة'}</span>
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold md:text-3xl flex items-center gap-2">
            <span>🔍</span>
            <span>{language === 'en' ? 'Search Results' : 'نتائج البحث'}</span>
          </h2>
          <p className="text-sm opacity-60">
            {isLoading 
              ? (language === 'en' ? 'Searching...' : 'جاري البحث...')
              : (language === 'en' && query ? `Found ${searchResults.length} results for "${query}"` : query ? `تم العثور على نتائج لـ "${query}"` : '')}
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E50914] border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {searchResults.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (index % 20) * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleMovieClick(movie)}
                  className="group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-lg shadow-xl shadow-black/20 border border-[var(--border-color)] bg-[var(--card-bg)] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#E50914]/40"
                >
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
                    alt={movie.title || movie.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {movie.vote_average > 0 && (
                    <div className="absolute top-2 right-2 flex items-center justify-center rounded-md bg-black/70 px-2 py-1 backdrop-blur-md">
                      <span className="text-xs font-bold text-yellow-400">{movie.vote_average.toFixed(1)}</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-4 transition-all duration-500">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                       <div className="bg-[#E50914] p-3 rounded-full shadow-[0_0_20px_rgba(229,9,20,0.6)]">
                         <Play className="h-6 w-6 text-white fill-current" />
                       </div>
                    </div>
                    <h3 className="font-bold text-base line-clamp-2 text-white shadow-black drop-shadow-lg mb-1">
                      {movie.title || movie.name}
                    </h3>
                    {movie.release_date || movie.first_air_date ? (
                       <p className="text-xs text-gray-300 font-medium">{String(movie.release_date || movie.first_air_date).slice(0, 4)}</p>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>

            {searchResults.length > 0 && totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center pt-8 pb-4 border-t border-[var(--border-color)]">
                <div className="inline-flex items-center gap-4 rounded-full bg-[var(--card-bg)] p-2 border border-[var(--border-color)] backdrop-blur-md shadow-2xl">
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--border-color)] hover:bg-[#E50914] hover:text-white disabled:opacity-30 transition-all duration-300 group"
                    title={language === 'en' ? 'Previous' : 'السابق'}
                  >
                    <ChevronRight className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
                  </button>

                  <div className="flex px-4 items-center flex-col justify-center min-w-[100px]">
                    <span className="text-xs font-medium opacity-50 uppercase tracking-wider mb-0.5">{language === 'en' ? 'Page' : 'الصفحة'}</span>
                    <span className="text-lg font-bold">
                      {page || 1} <span className="opacity-40 text-sm font-medium mx-1">{language === 'en' ? 'of' : 'من'}</span> {totalPages || 1}
                    </span>
                  </div>

                  <button
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E50914] text-white hover:bg-red-600 disabled:opacity-30 transition-all duration-300 shadow-[0_0_15px_rgba(229,9,20,0.4)] group"
                    title={language === 'en' ? 'Next' : 'التالي'}
                  >
                    <ChevronLeft className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {!isLoading && searchResults.length === 0 && query && (
          <div className="flex h-[40vh] flex-col items-center justify-center space-y-4 text-center">
            <p className="text-xl opacity-60">
              {language === 'en'
                ? 'No results found.'
                : 'لم نجد أي نتائج لطلبك.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="rounded-xl bg-[#E50914] px-10 py-4 font-bold text-white transition-all duration-300 hover:bg-red-600 shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:shadow-red-600/60 hover:scale-105 active:scale-95"
            >
              <span>🏡 {language === 'en' ? 'Back to Home' : 'العودة للرئيسية'}</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
