import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Settings, RefreshCw, AlertTriangle, SkipForward, Server, Play, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useFeedback } from '@/context/FeedbackContext';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

import { tmdb, fetchMovieDetails } from '@/services/tmdbService';

type SubtitleLang = 'ar' | 'en' | '';

interface StreamServer {
  id: string;
  name: string;
  nameEn: string;
  getUrl: (id: string, type: 'movie' | 'tv', s?: number, e?: number, imdbId?: string, subLang?: SubtitleLang) => string;
  speed?: number;
}

const getAvailableServers = (): StreamServer[] => [
  { id: 'vidlink', name: 'سيرفر VidLink (الأسرع)', nameEn: 'VidLink (Fastest)', getUrl: (id, type, s, e) => type === 'movie' ? `https://vidlink.pro/movie/${id}?primaryColor=E50914&autoplay=false` : `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=E50914&autoplay=false` },
  { id: 'vidsrc_to', name: 'سيرفر VidSrc (مستقر)', nameEn: 'VidSrc (Stable)', getUrl: (id, type, s, e, _, subLang = 'ar') => type === 'movie' ? `https://vidsrc.to/embed/movie/${id}${subLang ? `?ds_lang=${subLang}` : ''}` : `https://vidsrc.to/embed/tv/${id}/${s}/${e}${subLang ? `?ds_lang=${subLang}` : ''}` },
  { id: 'superembed', name: 'سيرفر Multi (جودات متعددة)', nameEn: 'Multi (Various Qualities)', getUrl: (id, type, s, e) => type === 'movie' ? `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1` : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
  { id: 'embed_su', name: 'سيرفر EmbedSU (ترجمات ممتازة)', nameEn: 'EmbedSU (Best Subs)', getUrl: (id, type, s, e) => type === 'movie' ? `https://embed.su/embed/movie/${id}` : `https://embed.su/embed/tv/${id}/${s}/${e}` },
  { id: 'autoembed', name: 'سيرفر AutoEmbed', nameEn: 'AutoEmbed', getUrl: (id, type, s, e) => type === 'movie' ? `https://autoembed.co/movie/tmdb/${id}` : `https://autoembed.co/tv/tmdb/${id}-${s}-${e}` },
  { id: 'smashy', name: 'سيرفر Smashy', nameEn: 'SmashyStream', getUrl: (id, type, s, e) => type === 'movie' ? `https://embed.smashystream.com/play1.php?tmdb=${id}` : `https://embed.smashystream.com/play1.php?tmdb=${id}&season=${s}&episode=${e}` },
  { id: 'vidsrc_pm', name: 'سيرفر احتياطي (Backup)', nameEn: 'Backup Server', getUrl: (id, type, s, e, _, subLang = 'ar') => type === 'movie' ? `https://vidsrc.pm/embed/movie/${id}${subLang ? `?ds_lang=${subLang}` : ''}` : `https://vidsrc.pm/embed/tv/${id}/${s}/${e}${subLang ? `?ds_lang=${subLang}` : ''}` },
];

interface SmartPlayerProps {
  tmdbId: string;
  imdbId?: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
  movieTitle?: string;
  isArabic?: boolean;
}

export default function SmartPlayer({ tmdbId, imdbId, type, season, episode, onNextEpisode, hasNextEpisode, movieTitle, isArabic }: SmartPlayerProps) {
  const { t, language } = useLanguage();
  const { showFeedback } = useFeedback();
  const { user } = useAuth();
  const [servers, setServers] = useState<StreamServer[]>(getAvailableServers());
  const [currentServerIndex, setCurrentServerIndex] = useState<number>(0);
  const [isTesting, setIsTesting] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [debridUrl, setDebridUrl] = useState<string | null>(null);
  const [resolvingDebrid, setResolvingDebrid] = useState(false);
  const [subtitleLang, setSubtitleLang] = useState<SubtitleLang>('ar');
  const [mediaTitle, setMediaTitle] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const details = await fetchMovieDetails(Number(tmdbId), type);
        setMediaTitle(type === 'movie' ? details.title || details.original_title : details.name || details.original_name);
      } catch (err) {
        console.error("Failed to fetch title for download links", err);
      }
    };
    if (tmdbId) fetchTitle();
  }, [tmdbId, type]);

  // Global Keyboard Shortcut for Subtitles (C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is typing in inputs or textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setSubtitleLang((prev) => {
          let nextLang: SubtitleLang = 'ar';
          let message = '';
          
          if (prev === 'ar') {
            nextLang = 'en';
            message = language === 'en' ? 'English Subtitles Enabled' : 'تم تفعيل الترجمة الإنجليزية';
          } else if (prev === 'en') {
            nextLang = '';
            message = language === 'en' ? 'Subtitles Disabled' : 'تم إيقاف الترجمة';
          } else {
            nextLang = 'ar';
            message = language === 'en' ? 'Arabic Subtitles Enabled' : 'تم تفعيل الترجمة العربية';
          }
          
          showFeedback(message, 'info');
          return nextLang;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [language, showFeedback]);

  const resolveDebrid = async () => {
    if (resolvingDebrid) return;
    setResolvingDebrid(true);
    setDebridUrl(null);
    try {
      const res = await axios.post('/api/stream/find-and-resolve', {
        title: movieTitle,
        tmdbId: tmdbId,
        type: type,
        userId: user?.uid
      });
      
      if (res.data.success && res.data.streamUrl) {
         setDebridUrl(res.data.streamUrl);
         showFeedback(res.data.message, 'success');
      } else {
         showFeedback('Could not resolve stream', 'error');
         setIframeError(true);
      }
    } catch (err) {
      console.error('Debrid error:', err);
      showFeedback('Failed to connect to Debrid service', 'error');
      setIframeError(true);
    } finally {
      setResolvingDebrid(false);
    }
  };

  useEffect(() => {
    const serversList = getAvailableServers();
    setServers(serversList);
    setIsTesting(false);
    setIframeError(false);
    setDebridUrl(null);
    
    const savedServerId = localStorage.getItem('fastest-server-id');
    if (savedServerId) {
      const savedIndex = serversList.findIndex(s => s.id === savedServerId);
      if (savedIndex !== -1) {
        setCurrentServerIndex(savedIndex);
        if (serversList[savedIndex].id === 'debrid') {
          resolveDebrid();
        }
      }
    } else {
      setCurrentServerIndex(0);
    }
  }, [tmdbId, type, season, episode]);

  const handleManualServerSwitch = (index: number) => {
    setCurrentServerIndex(index);
    setIframeError(false);
    setDebridUrl(null);
    localStorage.setItem('fastest-server-id', servers[index].id);
    
    if (servers[index].id === 'debrid') {
      resolveDebrid();
    }
    
    showFeedback(
      language === 'en' 
        ? `Switched to ${servers[index].nameEn}` 
        : `تم الانتقال إلى ${servers[index].name}`,
      'info'
    );
  };

  const handleIframeLoad = () => {
    // Basic way to check if iframe errored - not perfect due to cross-origin
    setIframeError(false);
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10 group">
        {isTesting || resolvingDebrid ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 space-y-4 text-center p-8">
            <RefreshCw className="h-10 w-10 text-[#E50914] animate-spin" />
            <div className="space-y-1">
               <h3 className="text-xl font-bold font-arabic">{resolvingDebrid ? (language === 'en' ? 'Resolving Stream...' : 'جارِ توفير الرابط...') : (language === 'en' ? 'Testing Servers...' : 'جارِ اختبار السيرفرات...')}</h3>
               <p className="text-sm text-gray-400 font-arabic">{language === 'en' ? 'Selecting the fastest server to prevent buffering' : 'يتم اختيار أسرع سيرفر لمنع التقطيع'}</p>
            </div>
          </div>
        ) : servers[currentServerIndex]?.id === 'debrid' && debridUrl ? (
          debridUrl.startsWith('magnet:') ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 space-y-4 text-center p-8">
              <AlertTriangle className="h-10 w-10 text-yellow-500" />
              <h3 className="text-xl font-bold text-white">{language === 'en' ? 'RD resolution failed' : 'فشل التوجيه لـ Real-Debrid'}</h3>
              <p className="text-sm text-gray-400 max-w-xs">{language === 'en' ? 'Found magnet link but could not resolve via Debrid. Copy and use your own player.' : 'تم العثور على رابط magnet ولكن فشل التحويل. انسخه واستخدم مشغلك الخاص.'}</p>
              <div className="flex bg-white/10 p-2 rounded truncate max-w-full text-xs font-mono">
                {debridUrl}
              </div>
            </div>
          ) : (
            <video
              key={debridUrl}
              src={debridUrl}
              controls
              className="w-full h-full"
              poster={`https://image.tmdb.org/t/p/original/${tmdbId}`}
            >
              您的浏览器不支持 video 标签。
            </video>
          )
        ) : servers.length > 0 && servers[currentServerIndex] ? (
          <iframe
            ref={iframeRef}
            src={servers[currentServerIndex].getUrl(tmdbId, type, season, episode, imdbId, subtitleLang)}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer"
            onLoad={handleIframeLoad}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 space-y-4 text-center p-8">
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
             <h3 className="text-xl font-bold text-white">{language === 'en' ? 'No servers available' : 'لا توجد سيرفرات متاحة'}</h3>
          </div>
        )}
      </div>

      {!isTesting && (
        <div className="flex flex-col space-y-4 p-5 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl border border-white/10 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#E50914]/20 rounded-lg">
                <Server className="w-5 h-5 text-[#E50914]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-arabic leading-tight">
                  {language === 'en' ? 'Select Streaming Server' : 'اختر سيرفر المشاهدة'}
                </h3>
                <p className="text-xs text-gray-400 font-arabic mt-0.5">
                  {language === 'en' ? 'Try different servers if the current one is slow' : 'جرب سيرفرات مختلفة إذا كان الحالي بطيئاً'}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Online</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {servers.map((server, index) => (
              <button
                key={server.id}
                disabled={isTesting}
                onClick={() => handleManualServerSwitch(index)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 border group ${
                  currentServerIndex === index
                    ? 'bg-[#E50914] border-[#E50914] text-white shadow-lg shadow-[#E50914]/40 scale-105 z-10'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white hover:-translate-y-1'
                }`}
              >
                {currentServerIndex === index && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                )}
                
                <span className="text-sm font-bold font-arabic mb-2 truncate w-full text-center">
                  {language === 'en' ? server.nameEn : server.name}
                </span>

                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  currentServerIndex === index ? 'bg-black/20' : 'bg-black/40'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    (server.speed || 999999) < 500 ? 'bg-green-500' : 
                    (server.speed || 999999) < 1500 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="opacity-90">
                    {server.speed && !isNaN(server.speed) && server.speed < 999999 ? `${Math.round(server.speed)}ms` : (language === 'en' ? 'Stable' : 'مستقر')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Show subtitle instructions even if not testing. We now just show them for all movies because many Arabic movies have hardcoded UI even in EN language. But if the movie is naturally Arabic, it might not need subtitles, but the user requested "the Arabic subtitle feature in the video... for all content". */}
      {!isTesting && (
        <div className="mt-2 p-4 bg-[#E50914]/10 border border-[#E50914]/20 rounded-xl flex items-start gap-3">
          <div className="text-[#E50914] mt-0.5">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white mb-1 font-arabic">{(t as any)('subTextTitle') || 'Subtitles Settings'}</h4>
            <p className="text-sm text-gray-300 font-arabic leading-relaxed">
              {(t as any)('subTextDesc') || 'You can change subtitles by clicking the cc icon'}
            </p>
            <p className="text-xs text-[#E50914] font-arabic leading-relaxed mt-1 font-bold bg-[#E50914]/10 inline-block px-2 py-1 rounded">
              {language === 'en' ? '💡 Tip: Press "C" on your keyboard to quickly toggle subtitles language.' : '💡 تلميح: اضغط على حرف "C" في لوحة المفاتيح لتبديل لغة الترجمة سريعاً.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
