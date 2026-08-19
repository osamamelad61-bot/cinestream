import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { fetchMoviesByCategory, requests } from '@/services/tmdbService';
import { Movie } from '@/types';
import { useFeedback } from '@/context/FeedbackContext';
import { useLanguage } from '@/context/LanguageContext';

const categoryMap: Record<string, { title: string; url: string }> = {
  'arabic-movies': { title: '🇸🇦 أفلام عربية', url: 'arabic_combined' },
  'horror-movies': { title: '💀 أفلام رعب', url: requests.horrorMovies },
  'popular-movies': { title: '🌍 أفلام أجنبية', url: requests.popular },
  'new-releases': { title: '✨ أحدث الأفلام', url: requests.nowPlayingMovies },
  'current-series': { title: '🎭 مسلسلات تعرض حالياً', url: requests.onTheAirSeries },
  'trending': { title: '🔥 المحتوى الرائج', url: requests.trending },

  'anime-subbed': { title: '💬 أنمي مترجم', url: requests.animeSub },
  'anime-dubbed': { title: '🎙️ أنمي مدبلج', url: requests.animeDub },
  'anime': { title: '🍥 أفلام أنمي', url: requests.anime },

  'cartoon-subbed': { title: '💬 كرتون مترجم', url: requests.cartoonSub },
  'cartoon-dubbed': { title: '🎙️ كرتون مدبلج', url: requests.cartoonDub },
  'cartoons': { title: '🏰 أفلام ومسلسلات ديزني', url: 'disney_combined' },

  'series-arabic': { title: '🇸🇦 مسلسلات عربية', url: 'arabic_combined' },
  'series-popular': { title: '🌍 مسلسلات أجنبية', url: '/tv/popular' },
  'series-asian': { title: '⛩️ مسلسلات كورية وآسيوية', url: requests.asianSeries },
  'series-indian': { title: '🇮🇳 مسلسلات هندية', url: requests.indianSeries },

  'originals': { title: '💎 أعمال CineStream الأصلية', url: requests.netflixOriginals },
  'asian-movies': { title: '⛩️ أفلام آسيوية', url: requests.asianMovies },
  'korean-movies': { title: '🇰🇷 أفلام كورية', url: requests.koreanMovies },
  'japanese-movies': { title: '🇯🇵 أفلام يابانية', url: requests.japaneseMovies },
  'chinese-movies': { title: '🇨🇳 أفلام صينية', url: requests.chineseMovies },
  'indian-movies': { title: '🇮🇳 أفلام هندية', url: requests.indianMovies },
  'turkish-movies': { title: '🇹🇷 أفلام تركية', url: requests.turkishMovies },
  'turkish-series': { title: '🇹🇷 مسلسلات تركية', url: requests.turkishSeries },
};

export default function Category({ categoryNameOverride }: { categoryNameOverride?: string }) {
  const { categoryName: routeCategoryName } = useParams<{ categoryName: string }>();
  const categoryName = categoryNameOverride || routeCategoryName;
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1') || 1;
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showFeedback } = useFeedback();
  const { language } = useLanguage();

  const currentCategory = categoryName ? categoryMap[categoryName] : null;

  useEffect(() => {
    async function fetchData() {
      if (!currentCategory) return;
      setLoading(true);
      try {
        let fetchUrl = currentCategory.url;
        
        // Multi-Bucket Pagination Strategy to handle 1000 UI pages (each UI page = 3 TMDB pages)
        // Total 3000 TMDB pages needed across different sorts
        
        const uiPageSize = 3; // 3 TMDB pages per UI page
        const basePage = ((page - 1) * uiPageSize) + 1;
        
        let bucketSort = '';
        let effectiveStartPage = basePage;

        // 2000 UI Pages * 3 = 6000 TMDB Pages
        // Each bucket provides 500 TMDB pages (hard limit)
        // We need 12 buckets to reach 6000 TMDB pages
        
        if (page > 166 && page <= 333) {
          effectiveStartPage = basePage - 500;
          bucketSort = 'vote_count.desc';
        } else if (page > 333 && page <= 500) {
          effectiveStartPage = basePage - 1000;
          bucketSort = 'popularity.desc'; // Changed from date sort
        } else if (page > 500 && page <= 666) {
          effectiveStartPage = basePage - 1500;
          bucketSort = 'vote_average.desc';
        } else if (page > 666 && page <= 833) {
          effectiveStartPage = basePage - 2000;
          bucketSort = 'revenue.desc'; // Changed from date sort / mixed
        } else if (page > 833 && page <= 1000) {
          effectiveStartPage = basePage - 2500;
          bucketSort = 'popularity.asc';
        } else if (page > 1000 && page <= 1166) {
           effectiveStartPage = basePage - 3000;
           bucketSort = 'vote_count.asc';
        } else if (page > 1166 && page <= 1333) {
           effectiveStartPage = basePage - 3500;
           bucketSort = 'revenue.asc'; // Changed from date sort
        } else if (page > 1333 && page <= 1500) {
           effectiveStartPage = basePage - 4000;
           bucketSort = 'vote_average.asc';
        } else if (page > 1500 && page <= 1666) {
           effectiveStartPage = basePage - 4500;
           bucketSort = 'original_title.asc';
        } else if (page > 1666 && page <= 1833) {
           effectiveStartPage = basePage - 5000;
           bucketSort = 'revenue.asc';
        } else if (page > 1833) {
           effectiveStartPage = basePage - 5500;
           bucketSort = 'popularity.desc'; // Reset or some other
        }

        if (bucketSort) {
          if (fetchUrl.includes('sort_by=')) {
            fetchUrl = fetchUrl.replace(/sort_by=[^&]*/, `sort_by=${bucketSort}`);
          } else {
            fetchUrl += fetchUrl.includes('?') ? `&sort_by=${bucketSort}` : `?sort_by=${bucketSort}`;
          }
        }

        // Handle Combined (Movies + TV) for Disney and Arabic
        let responses;
        if (currentCategory.url === 'disney_combined' || currentCategory.url === 'arabic_combined') {
          const moviesUrl = currentCategory.url === 'disney_combined' ? requests.disneyMovies : requests.arabicMovies;
          const seriesUrl = currentCategory.url === 'disney_combined' ? requests.disneySeries : requests.arabicSeries;
          
          let effectiveMoviesUrl = moviesUrl;
          let effectiveSeriesUrl = seriesUrl;
          
          if (bucketSort) {
             const separatorM = effectiveMoviesUrl.includes('?') ? '&' : '?';
             effectiveMoviesUrl = effectiveMoviesUrl.includes('sort_by=') 
               ? effectiveMoviesUrl.replace(/sort_by=[^&]*/, `sort_by=${bucketSort}`)
               : `${effectiveMoviesUrl}${separatorM}sort_by=${bucketSort}`;
             
             const separatorS = effectiveSeriesUrl.includes('?') ? '&' : '?';
             effectiveSeriesUrl = effectiveSeriesUrl.includes('sort_by=')
               ? effectiveSeriesUrl.replace(/sort_by=[^&]*/, `sort_by=${bucketSort}`)
               : `${effectiveSeriesUrl}${separatorS}sort_by=${bucketSort}`;
          }

          responses = await Promise.all([
            fetchMoviesByCategory(effectiveMoviesUrl, effectiveStartPage),
            fetchMoviesByCategory(effectiveSeriesUrl, effectiveStartPage),
            fetchMoviesByCategory(effectiveMoviesUrl, effectiveStartPage + 1),
            fetchMoviesByCategory(effectiveSeriesUrl, effectiveStartPage + 1),
            fetchMoviesByCategory(effectiveMoviesUrl, effectiveStartPage + 2),
            fetchMoviesByCategory(effectiveSeriesUrl, effectiveStartPage + 2)
          ]);
        } else {
          // Fetch 3 sequential pages to get 60 items
          responses = await Promise.all([
            fetchMoviesByCategory(fetchUrl, effectiveStartPage),
            fetchMoviesByCategory(fetchUrl, effectiveStartPage + 1),
            fetchMoviesByCategory(fetchUrl, effectiveStartPage + 2)
          ]);
        }
        
        const allMovies = [];
        for (const res of responses) {
          if (res?.results) {
            allMovies.push(...res.results);
          }
        }
        
        const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values())
           .filter((m: any) => m.poster_path || m.backdrop_path);

        setMovies(uniqueMovies);
        
        const fetchedTotalPages = responses[0]?.total_pages || 1;
        // Total pages allowed is 2000 (meaning up to 6000 TMDB pages distributed across sorts)
        setTotalPages(Math.min(2000, Math.ceil((fetchedTotalPages * 12) / uiPageSize)));
      } catch (error) {
        console.error('Error fetching data:', error);
        showFeedback(
          language === 'en' 
            ? 'Failed to fetch movies. Please check your connection.' 
            : 'فشل تحميل المحتوى. يرجى التحقق من الاتصال.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    window.scrollTo(0, 0);
  }, [categoryName, page]);

  const handleMovieClick = (movie: Movie) => {
    const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
    navigate(`/watch/${type}/${movie.id}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ page: newPage.toString() });
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 px-2">
        {start > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--border-color)] text-sm font-bold hover:bg-[#E50914] transition-all"
            >
              1
            </button>
            {start > 2 && <span className="text-gray-500">...</span>}
          </>
        )}

        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
          <button
            key={p}
            onClick={() => handlePageChange(p)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-all ${
              page === p
                ? 'bg-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.5)] cursor-default'
                : 'bg-[var(--border-color)] hover:bg-[var(--accent-color)]/10'
            }`}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-gray-500">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--border-color)] text-sm font-bold hover:bg-[#E50914] transition-all"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
    );
  };

  if (!currentCategory) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>القسم غير موجود</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-noto text-[var(--text-primary)]">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 lg:px-12">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center space-x-3 px-4 py-2 bg-[var(--border-color)] hover:bg-[#E50914]/20 rounded-xl hover:text-[#E50914] transition-all duration-200 border border-[var(--border-color)] active:scale-90 group shadow-lg"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-bold text-sm tracking-wide">{language === 'en' ? 'Back' : 'العودة'}</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <h1 className="text-3xl font-bold md:text-5xl border-r-4 border-[#E50914] pr-4">
            {currentCategory?.title}
          </h1>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className="p-3 rounded-xl bg-[var(--border-color)] hover:bg-[var(--accent-color)]/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              {renderPagination()}
            </div>
            <div className="sm:hidden px-4 text-[#E50914] font-black italic">
              {page || 1} / {totalPages || 1}
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="p-3 rounded-xl bg-[var(--border-color)] hover:bg-[var(--accent-color)]/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E50914] border-t-transparent" />
          </div>
        ) : movies.length === 0 ? (
          <div className="flex h-[50vh] flex-col items-center justify-center text-center">
            <p className="text-xl text-gray-500 font-arabic">
              {language === 'en' ? 'No content found in this category yet.' : 'لا يوجد محتوى متوفر في هذا القسم حالياً.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {movies.map((movie, index) => (
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

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-4 transition-opacity duration-300">
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
            
            <div className="mt-20 flex flex-col items-center justify-center pt-10 border-t border-[var(--border-color)] bg-gradient-to-t from-[var(--text-primary)]/5 to-transparent">
              <div className="flex items-center gap-4 p-1 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] backdrop-blur-xl shadow-2xl overflow-hidden">
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl hover:bg-[#E50914] hover:text-white disabled:opacity-10 transition-all duration-300 group"
                  title="السابق"
                >
                  <ChevronRight className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
                </button>

                <div className="flex items-center">
                  {renderPagination()}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E50914] text-white hover:bg-red-600 disabled:opacity-10 transition-all duration-300 shadow-[0_10px_30px_rgba(229,9,20,0.3)] group"
                  title="التالي"
                >
                  <ChevronLeft className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
              <p className="mt-4 text-xs font-medium text-gray-500 uppercase tracking-widest">
                إجمالي الصفحات: <span className="text-white">{totalPages || 0}</span>
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
