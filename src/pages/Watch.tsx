import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Calendar, Clock, Play, Info, Heart, Send, MessageSquare, ShieldAlert, SkipForward, X, Download, CheckCircle } from 'lucide-react';
import { fetchMovieDetails, fetchMovieVideos, fetchSimilarMovies, BACKDROP_BASE_URL } from '@/services/tmdbService';
import { addToFavorites, removeFromFavorites, getFavorites, addComment, getComments, saveWatchingProgress } from '@/services/firebaseService';
import { saveProgress } from '@/utils/progress';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useFeedback } from '@/context/FeedbackContext';
import Navbar from '@/components/Navbar';
import MovieRow from '@/components/MovieRow';
import SmartPlayer from '@/components/SmartPlayer';

export default function Watch() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { language, t } = useLanguage();
  const { showFeedback } = useFeedback();
  const [movie, setMovie] = useState<any>(null);
  const [trailer, setTrailer] = useState<string | null>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [hasAccess, setHasAccess] = useState(true);

  // Download State
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const getNextEpisodeInfo = () => {
    if (type !== 'tv' || !movie || !movie.seasons) return null;
    const currentSeason = movie.seasons.find((s: any) => s.season_number === selectedSeason);
    if (!currentSeason) return null;

    if (selectedEpisode < currentSeason.episode_count) {
      return { season: selectedSeason, episode: selectedEpisode + 1 };
    }

    const nextSeason = movie.seasons.find((s: any) => s.season_number === selectedSeason + 1);
    if (nextSeason && nextSeason.season_number > 0) {
      return { season: nextSeason.season_number, episode: 1 };
    }

    return null;
  };

  const handleNextEpisode = () => {
    const next = getNextEpisodeInfo();
    if (next) {
      setSelectedSeason(next.season);
      setSelectedEpisode(next.episode);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDownload = () => {
    if (isDownloading || isDownloaded) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          setIsDownloaded(true);
          showFeedback(t('offlineReady'), 'success');
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 800);
  };

  useEffect(() => {
    setHasAccess(true);
  }, [profile]);
  
  // Favorites State
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  
  // Comments State
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(10);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    async function getDetails() {
      if (!id) return;
      setLoading(true);
      setTrailer(null);
      try {
        const details = await fetchMovieDetails(Number(id), type as any);
        
        if (details?.adult) {
          showFeedback(
            language === 'en' 
              ? 'This content is not available.' 
              : 'هذا المحتوى غير متاح للمشاهدة.',
            'error'
          );
          navigate('/');
          return;
        }

        const videos = await fetchMovieVideos(Number(id), type as any);
        const similarData = await fetchSimilarMovies(Number(id), type as any);
        
        setMovie(details);
        setSimilar(similarData);
        
        const officialTrailer = videos.find(
          (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
        ) || videos.find(
          (v: any) => v.site === 'YouTube'
        );
        
        if (officialTrailer) {
          setTrailer(officialTrailer.key);
        }

        // Check if favorite
        if (user) {
          const favs = await getFavorites(user.uid);
          const fav = favs?.find((f: any) => f.itemId === Number(id));
          if (fav) {
            setIsFavorite(true);
            setFavoriteId(fav.id);
          } else {
            setIsFavorite(false);
            setFavoriteId(null);
          }
        }

        // Load comments
        const movieComments = await getComments(Number(id));
        setComments(movieComments || []);
      } catch (error) {
        console.error(error);
        showFeedback(
          language === 'en' 
            ? 'Failed to load movie details.' 
            : 'فشل تحميل تفاصيل الفيلم.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    }
    getDetails();
    window.scrollTo(0, 0);
  }, [id, type, user]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      showFeedback(
        language === 'en' ? 'Please log in to add to favorites' : 'يرجى تسجيل الدخول للإضافة للمفضلة',
        'info'
      );
      return;
    }
    
    if (isFavorite && favoriteId) {
      await removeFromFavorites(favoriteId);
      setIsFavorite(false);
      setFavoriteId(null);
    } else {
      const newFavId = await addToFavorites(user.uid, movie, type as string);
      if (newFavId) {
        setIsFavorite(true);
        setFavoriteId(newFavId);
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showFeedback(
        language === 'en' ? 'Please log in to post a comment' : 'يرجى تسجيل الدخول لإضافة تعليق',
        'info'
      );
      return;
    }
    if (!newComment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      await addComment(Number(id), newComment, userRating);
      setNewComment('');
      // Refresh comments
      const updatedComments = await getComments(Number(id));
      setComments(updatedComments || []);
      showFeedback(
        language === 'en' ? 'Comment added successfully!' : 'تم إضافة التعليق بنجاح!',
        'success'
      );
    } catch (error) {
      console.error(error);
      showFeedback(
        language === 'en' ? 'Failed to post comment.' : 'فشل نشر التعليق.',
        'error'
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    if (movie) {
      const progressData = {
        id: String(id),
        type: type as 'movie' | 'tv',
        title: movie.title || movie.name,
        posterPath: movie.poster_path,
        progress: 10,
        season: type === 'tv' ? selectedSeason : undefined,
        episode: type === 'tv' ? selectedEpisode : undefined
      };
      
      saveProgress(progressData);
      
      if (user) {
        saveWatchingProgress(user.uid, progressData);
      }
    }
  }, [movie, id, type, selectedSeason, selectedEpisode, user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#141414]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E50914] border-t-transparent" />
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": movie.title || movie.name,
            "description": movie.overview,
            "thumbnailUrl": [
              `${BACKDROP_BASE_URL}${movie.backdrop_path}`
            ],
            "uploadDate": movie.release_date || movie.first_air_date ? new Date(movie.release_date || movie.first_air_date).toISOString() : new Date().toISOString(),
            "contentUrl": window.location.href,
            "embedUrl": window.location.href
          })
        }}
      />
      <Navbar />
      
      <main className="pt-24 pb-24 px-4 lg:px-12">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center space-x-3 px-5 py-2.5 bg-white/5 hover:bg-[#E50914]/20 rounded-xl text-white transition-all duration-300 border border-white/10 active:scale-95 group shadow-xl hover:shadow-[#E50914]/20"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-bold text-sm tracking-wide">🔙 {language === 'en' ? 'Back' : 'العودة'}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Player Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="w-full">
                  <SmartPlayer 
                    tmdbId={id || ''} 
                    imdbId={movie?.imdb_id || movie?.external_ids?.imdb_id}
                    type={type as 'movie' | 'tv'} 
                    season={selectedSeason} 
                    episode={selectedEpisode}
                    onNextEpisode={handleNextEpisode}
                    hasNextEpisode={!!getNextEpisodeInfo()}
                    movieTitle={movie?.title || movie?.name || ''}
                    isArabic={movie?.original_language === 'ar'}
                  />
              </div>

              {/* Player Bottom Bar / Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-2">
                <div className="flex gap-2">
                  {type === 'tv' && getNextEpisodeInfo() && (
                    <button 
                      onClick={handleNextEpisode}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#E50914]/10 hover:bg-[#E50914]/20 rounded-xl text-sm font-bold border border-[#E50914]/20 transition-all duration-300 hover:scale-105 active:scale-95 text-[#E50914] shadow-lg shadow-[#E50914]/10"
                    >
                      <SkipForward className="w-4 h-4 fill-current" />
                      <span>⏭️ {language === 'en' ? 'Next Episode' : 'الحلقة التالية'}</span>
                    </button>
                  )}
                  
                  <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${
                      isDownloaded 
                        ? 'bg-green-500/20 text-green-500 border-green-500/30 shadow-green-500/10' 
                        : isDownloading
                        ? 'bg-white/10 text-gray-300 border-white/10'
                        : 'bg-white/5 hover:bg-white/10 text-white border-white/10 shadow-black/20'
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>{isNaN(downloadProgress) ? 0 : Math.round(downloadProgress)}%</span>
                      </>
                    ) : isDownloaded ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>{language === 'en' ? 'Offline' : 'متاح أوفلاين'}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>{t('download')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Server Selection via SmartPlayer */}

              {/* TV Show Controls */}
              {type === 'tv' && movie.seasons && (
                <div className="p-6 bg-white/5 rounded-xl border border-white/5 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">{language === 'en' ? 'Season' : 'الموسم'}</label>
                       <select 
                         value={selectedSeason}
                         onChange={(e) => {
                           setSelectedSeason(Number(e.target.value));
                           setSelectedEpisode(1);
                         }}
                         className="w-full md:w-32 bg-[#141414] border border-white/10 rounded-lg px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[#E50914] outline-none"
                       >
                         {movie.seasons.filter((s: any) => s.season_number > 0).map((season: any) => (
                           <option key={season.id} value={season.season_number}>
                             {language === 'en' ? 'Season' : 'الموسم'} {season.season_number}
                           </option>
                         ))}
                       </select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">{language === 'en' ? 'Episode' : 'الحلقة'}</label>
                      <div className="flex flex-wrap gap-2">
                        {[...Array(movie.seasons.find((s: any) => s.season_number === selectedSeason)?.episode_count || 0)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setSelectedEpisode(i + 1);
                            }}
                            className={`w-10 h-10 rounded flex items-center justify-center text-xs font-bold transition-all ${
                              selectedEpisode === i + 1 
                                ? 'bg-[#E50914] text-white ring-2 ring-[#E50914] ring-offset-2 ring-offset-[#141414]' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-[10px] text-gray-500 text-center px-4">
                {language === 'en' ? "Note: External servers may contain ads from the source. If one doesn't work, try another." : "ملاحظة: السيرفرات الخارجية قد تحتوي على إعلانات. إن لم يعمل سيرفر، جرب آخر."}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold md:text-5xl">
                  {movie.title || movie.name}
                </h1>
                
                <button
                  onClick={handleFavoriteToggle}
                  className={`flex items-center space-x-2 px-7 py-3.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 border shadow-xl ${
                    isFavorite 
                      ? 'bg-red-500/20 text-red-500 border-red-500/30 shadow-red-500/20' 
                      : 'bg-white/10 text-white border-white/10 hover:bg-white/20 shadow-black/30'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  <span>{isFavorite ? `❤️ ${language === 'en' ? 'In Favorites' : 'في المفضلة'}` : `🤍 ${language === 'en' ? 'Add to Favorites' : 'أضف للمفضلة'}`}</span>
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-400">
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{movie.vote_average?.toFixed(1)} Rating</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(movie.release_date || movie.first_air_date).getFullYear()}</span>
                </div>
                {movie.runtime && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{movie.runtime} min</span>
                  </div>
                )}
                <div className="rounded bg-white/10 px-2 py-0.5 text-xs text-white">HDR</div>
              </div>

              <p className="text-lg leading-relaxed text-gray-300 max-w-4xl">
                {movie.overview}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {movie.genres?.map((genre: any) => (
                  <span 
                    key={genre.id}
                    className="rounded-full bg-white/5 px-4 py-1 text-sm font-medium hover:bg-white/10 transition-colors cursor-default border border-white/5"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="pt-12 space-y-8">
              <div className="flex items-center space-x-2 text-2xl font-bold border-l-4 border-[#E50914] pl-4">
                <MessageSquare className="h-6 w-6 text-[#E50914]" />
                <h2>{language === 'en' ? 'Comments & Ratings' : 'التعليقات والتقييمات'}</h2>
              </div>

              {user ? (
                <form onSubmit={handleCommentSubmit} className="space-y-4 bg-white/5 p-6 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400 font-medium">{language === 'en' ? 'Leave your rating to help others' : 'شارك بتقييمك لمساعدة الآخرين'}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-[#E50914]">{language === 'en' ? 'Your Rating' : 'تقييمك'}: {userRating}/10</span>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={userRating}
                        onChange={(e) => setUserRating(Number(e.target.value))}
                        className="accent-[#E50914]"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <textarea 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={language === 'en' ? 'What do you think of this title?' : 'ما رأيك في هذا العمل؟'}
                      className="w-full bg-[#141414] border border-white/10 rounded-lg p-4 focus:ring-2 focus:ring-[#E50914] focus:border-transparent transition-all outline-none min-h-[100px]"
                    />
                    <button 
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="absolute bottom-4 right-4 bg-[#E50914] p-3 rounded-xl hover:bg-[#ff0f1b] disabled:opacity-50 transition-all duration-300 font-bold group shadow-lg hover:shadow-red-600/40 hover:scale-110 active:scale-90"
                    >
                      <Send className="h-5 w-5 text-white active:translate-x-2 active:-translate-y-2 transition-transform" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white/5 p-8 rounded-xl border border-white/10 text-center space-y-4">
                  <p className="text-gray-400">{language === 'en' ? 'Please log in to add a comment' : 'يرجى تسجيل الدخول لإضافة تعليق'}</p>
                </div>
              )}

              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {comments.map((comment, index) => (
                    <motion.div 
                      key={comment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex space-x-4 p-6 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                    >
                      <img 
                        src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userName}&background=E50914&color=fff`}
                        alt={comment.userName}
                        className="h-12 w-12 rounded-full border-2 border-[#E50914]/20"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-lg">{comment.userName}</h4>
                          <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG')}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-500 mb-2">
                          {[...Array(10)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < comment.rating ? 'fill-current' : 'text-gray-600'}`} 
                            />
                          ))}
                        </div>
                        <p className="text-gray-300 leading-relaxed">{comment.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {comments.length === 0 && (
                  <div className="text-center py-12 text-gray-500 border-2 border-dashed border-white/5 rounded-xl">
                    <p>{language === 'en' ? 'No comments yet. Be the first to comment!' : 'لا توجد تعليقات حتى الآن. كن أول من يعلق!'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / More Info */}
          <div className="space-y-8">
            {trailer && (
              <div className="rounded-xl border border-white/10 overflow-hidden bg-black shadow-xl">
                <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center space-x-2">
                  <Play className="w-4 h-4 text-[#E50914]" />
                  <h3 className="text-sm font-bold tracking-wider">{language === 'en' ? 'Official Trailer' : 'الإعلان الرسمي'}</h3>
                </div>
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer}?modestbranding=1&rel=0`}
                    title="Trailer"
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media; fullscreen"
                  />
                </div>
              </div>
            )}

            <div className="rounded-xl bg-gradient-to-b from-white/10 to-transparent p-6 border border-white/10 shadow-xl">
              <h3 className="mb-6 text-xl font-bold border-l-4 border-[#E50914] pl-3 leading-none pt-0.5">{language === 'en' ? 'Production Details' : 'تفاصيل الإنتاج'}</h3>
              <dl className="space-y-6 text-sm">
                <div>
                  <dt className="text-gray-400 uppercase tracking-[0.2em] text-[10px] font-bold mb-2">{language === 'en' ? 'Production Companies' : 'شركات الإنتاج'}</dt>
                  <dd className="text-gray-200">{movie.production_companies?.map((c: any) => c.name).join(', ') || 'N/A'}</dd>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-gray-400 uppercase tracking-[0.2em] text-[10px] font-bold mb-2">{language === 'en' ? 'Status' : 'الحالة'}</dt>
                    <dd className="text-green-500 font-bold">{movie.status}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 uppercase tracking-[0.2em] text-[10px] font-bold mb-2">{language === 'en' ? 'Original Language' : 'اللغة الأصلية'}</dt>
                    <dd className="text-gray-200">{movie.original_language?.toUpperCase()}</dd>
                  </div>
                </div>
                {movie.budget > 0 && (
                  <div>
                    <dt className="text-gray-400 uppercase tracking-[0.2em] text-[10px] font-bold mb-2">{language === 'en' ? 'Estimated Budget' : 'الميزانية التقديرية'}</dt>
                    <dd className="text-yellow-500 font-bold tracking-tight">${(movie.budget / 1000000).toFixed(1)}M</dd>
                  </div>
                )}
                {movie.homepage && (
                  <div className="pt-4">
                    <a 
                      href={movie.homepage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block w-full py-3 px-4 rounded bg-white/5 text-center text-xs font-bold hover:bg-white/10 transition-colors border border-white/10"
                    >
                      {language === 'en' ? 'Visit Official Site' : 'زيارة الموقع الرسمي'}
                    </a>
                  </div>
                )}
              </dl>
            </div>

            {/* Premium membership removed */}
          </div>
        </div>

        {/* Similar Content Row */}
        {similar.length > 0 && (
          <div className="mt-24 space-y-8">
            <div className="flex items-center space-x-2 text-2xl font-bold border-l-4 border-[#E50914] pl-4">
              <h2>{language === 'en' ? 'You Might Also Like' : 'قد يعجبك أيضاً'}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {similar.slice(0, 12).map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate(`/watch/${type}/${item.id}`)}
                  className="group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-lg shadow-xl"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title || item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex flex-col justify-end p-3">
                     <p className="text-xs font-bold truncate">{item.title || item.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
