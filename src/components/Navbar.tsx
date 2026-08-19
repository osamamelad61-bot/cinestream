import { useEffect, useState } from 'react';
import { Search as SearchIcon, Bell, ChevronDown, X, LogOut, User as UserIcon, Menu, Crown, Moon, Sun, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tmdb } from '@/services/tmdbService';
import { Movie } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Props {
  onSearch?: (results: Movie[] | null) => void;
}

export default function Navbar({ onSearch }: Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [location, setLocation] = useState<{ timezone: string; country: string } | null>(null);
  const { user, profile, loginWithGoogle, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocation = async (retries = 3) => {
      try {
        const res = await fetch('/api/info/location');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setLocation(data);
      } catch (err: any) {
        if (retries > 0) {
          console.warn(`Retrying location fetch (${retries} attempts left)...`);
          setTimeout(() => fetchLocation(retries - 1), 2000);
        } else {
          console.error('Error fetching location after retries:', err);
          // Fallback to Egypt if it fails completely
          setLocation({ timezone: 'Africa/Cairo', country: 'Egypt' });
        }
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (query.trim().length > 0) {
      // TMDB URL Detection
      const tmdbUrlMatch = query.match(/themoviedb\.org\/(tv|movie)\/(\d+)/);
      if (tmdbUrlMatch) {
         const [, type, id] = tmdbUrlMatch;
         navigate(`/watch/${type}/${id}`);
         setQuery('');
         setShowSearch(false);
         return;
      }

      const delayDebounceFn = setTimeout(() => {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [query, navigate]);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setQuery('');
    }
  };

  return (
    <nav
      className={cn(
        'fixed top-0 z-[100] flex w-full items-center justify-between px-4 py-3 transition-all duration-300 lg:px-12 lg:py-5',
        isScrolled 
          ? 'bg-[var(--nav-bg)] backdrop-blur-md shadow-lg border-b border-[var(--border-color)]' 
          : 'bg-transparent bg-gradient-to-b from-black/60 to-transparent'
      )}
    >
      <div className="flex items-center space-x-4 rtl:space-x-reverse lg:space-x-10">
        <button 
          onClick={() => setShowMobileMenu(true)}
          className="p-1 md:hidden text-white"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link to="/" className="flex items-center gap-1 group">
          <div className="relative flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-5deg]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E50914] to-[#FF416C] blur-[10px] opacity-40 group-hover:opacity-80 transition-opacity duration-500 rounded-full"></div>
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 md:w-[42px] md:h-[42px]">
              <path d="M 28 10 A 14 14 0 1 0 28 30" stroke="url(#c-grad)" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 17 14 L 26 20 L 17 26 V 14 Z" fill="url(#c-grad)" />
              <defs>
                <linearGradient id="c-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E50914"/>
                  <stop offset="1" stopColor="#FF416C"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex flex-col justify-center ml-1 md:ml-2">
            <span className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter text-white drop-shadow-md">
              Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] to-[#FF416C]">Stream</span>
            </span>
          </div>
        </Link>
        <ul className="hidden space-x-6 rtl:space-x-reverse text-sm font-medium md:flex items-center">
          <li className="cursor-pointer py-2 transition-all hover:text-[#E50914] hover:scale-105 active:scale-95 relative group">
            <Link to="/" className="flex items-center gap-1.5">
              <span>🏡</span>
              <span>{t('home')}</span>
            </Link>
            <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#E50914] transition-all group-hover:w-full shadow-[0_0_8px_rgba(229,9,20,0.6)]" />
          </li>
          
          {/* Movies Dropdown */}
          <li className="group relative cursor-pointer py-2 transition-all hover:text-[#E50914]">
            <span className="flex items-center gap-1.5 transition-transform group-hover:scale-105">
              <span>🎞️</span>
              <span>{t('movies')}</span>
              <ChevronDown className="h-4 w-4 transition duration-300 group-hover:rotate-180" />
            </span>
            <div className="absolute top-full -left-4 hidden w-52 pt-2 group-hover:block">
              <div className="relative rounded-lg bg-[var(--card-bg)] backdrop-blur-2xl border border-[var(--border-color)] p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="absolute -top-1 left-8 h-2 w-2 rotate-45 border-t border-r border-[var(--border-color)] bg-[var(--card-bg)]" />
                <ul className="relative space-y-1">
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/new-releases" className="flex items-center gap-2 w-full"><span>✨</span> {language === 'en' ? 'Latest Movies' : 'أحدث الأفلام'}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/arabic-movies" className="flex items-center gap-2 w-full"><span>🇸🇦</span> {t('arabicMovies')}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/popular-movies" className="flex items-center gap-2 w-full"><span>🌍</span> {t('foreignMovies')}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/asian-movies" className="flex items-center gap-2 w-full"><span>⛩️</span> {t('asianMovies')}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/korean-movies" className="flex items-center gap-2 w-full"><span>🇰🇷</span> {t('koreanMovies')}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/japanese-movies" className="flex items-center gap-2 w-full"><span>🇯🇵</span> {t('japaneseMovies')}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/chinese-movies" className="flex items-center gap-2 w-full"><span>🇨🇳</span> {t('chineseMovies')}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/indian-movies" className="flex items-center gap-2 w-full"><span>🇮🇳</span> {t('indianMovies')}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/turkish-movies" className="flex items-center gap-2 w-full"><span>🇹🇷</span> {t('turkishMovies') || 'أفلام تركية'}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] font-semibold text-red-500"><Link to="/category/horror-movies" className="flex items-center gap-2 w-full"><span>💀</span> {t('horrorMovies')}</Link></li>
                </ul>
              </div>
            </div>
          </li>

          {/* Series Dropdown */}
          <li className="group relative cursor-pointer py-2 transition-all hover:text-[#E50914]">
            <span className="flex items-center gap-1.5 transition-transform group-hover:scale-105">
              <span>🎭</span>
              <span>{t('series')}</span>
              <ChevronDown className="h-4 w-4 transition duration-300 group-hover:rotate-180" />
            </span>
            <div className="absolute top-full -left-4 hidden w-52 pt-2 group-hover:block">
              <div className="relative rounded-lg bg-[var(--card-bg)] backdrop-blur-2xl border border-[var(--border-color)] p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="absolute -top-1 left-8 h-2 w-2 rotate-45 border-t border-r border-[var(--border-color)] bg-[var(--card-bg)]" />
                <ul className="relative space-y-1">
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/current-series" className="flex items-center gap-2 w-full"><span>✨</span> {language === 'en' ? 'Latest Series' : 'أحدث المسلسلات'}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/series-arabic" className="flex items-center gap-2 w-full"><span>🇸🇦</span> {t('arabicSeries')}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/series-popular" className="flex items-center gap-2 w-full"><span>🌍</span> {t('foreignSeries')}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/series-asian" className="flex items-center gap-2 w-full"><span>⛩️</span> {t('asianSeries') || 'مسلسلات كورية وآسيوية'}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/series-indian" className="flex items-center gap-2 w-full"><span>🇮🇳</span> {t('indianSeries') || 'مسلسلات هندية'}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/turkish-series" className="flex items-center gap-2 w-full"><span>🇹🇷</span> {t('turkishSeries') || 'مسلسلات تركية'}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/originals" className="flex items-center gap-2 w-full"><span>💎</span> {t('originals')}</Link></li>
                </ul>
              </div>
            </div>
          </li>

          {/* Independent Categories with Dropdowns */}
          <li className="group relative cursor-pointer py-2 transition-all hover:text-[#E50914]">
            <span className="flex items-center gap-1.5 transition-transform group-hover:scale-105">
              <span>🍥</span>
              <span>{t('anime')}</span>
              <ChevronDown className="h-4 w-4 transition duration-300 group-hover:rotate-180" />
            </span>
            <div className="absolute top-full -left-4 hidden w-52 pt-2 group-hover:block">
              <div className="relative rounded-lg bg-[var(--card-bg)] backdrop-blur-2xl border border-[var(--border-color)] p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="absolute -top-1 left-8 h-2 w-2 rotate-45 border-t border-r border-[var(--border-color)] bg-[var(--card-bg)]" />
                <ul className="relative space-y-1">
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/anime-subbed" className="flex items-center gap-2 w-full"><span>💬</span> {t('animeSubbed')}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/anime" className="flex items-center gap-2 w-full"><span>🎥</span> {t('animeMovies')}</Link></li>
                </ul>
              </div>
            </div>
          </li>

          <li className="group relative cursor-pointer py-2 transition-all hover:text-[#E50914]">
            <span className="flex items-center gap-1.5 transition-transform group-hover:scale-105">
              <span>🏰</span>
              <span>{t('cartoon')}</span>
              <ChevronDown className="h-4 w-4 transition duration-300 group-hover:rotate-180" />
            </span>
            <div className="absolute top-full -left-4 hidden w-52 pt-2 group-hover:block">
              <div className="relative rounded-lg bg-[var(--card-bg)] backdrop-blur-2xl border border-[var(--border-color)] p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="absolute -top-1 left-8 h-2 w-2 rotate-45 border-t border-r border-[var(--border-color)] bg-[var(--card-bg)]" />
                <ul className="relative space-y-1">
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/cartoon-subbed" className="flex items-center gap-2 w-full"><span>💬</span> {t('cartoonSubbed')}</Link></li>
                  <li className="rounded-md px-3 py-2.5 hover:bg-[var(--border-color)] hover:text-[#E50914] transition-colors"><Link to="/category/cartoons" className="flex items-center gap-2 w-full"><span>✨</span> {t('disneyMovies')}</Link></li>
                </ul>
              </div>
            </div>
          </li>
          
          <li className="cursor-pointer py-2 transition-all hover:text-[#E50914] hover:scale-105 active:scale-95 relative group">
             <Link to="/favorites" className="flex items-center gap-1.5">
               <span>🌟</span>
               <span>{t('favorites')}</span>
             </Link>
             <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#E50914] transition-all group-hover:w-full shadow-[0_0_8px_rgba(229,9,20,0.6)]" />
          </li>
          
          <li className="cursor-pointer py-2 transition-all hover:scale-105 active:scale-95">
             <Link to="/premium" className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-full font-bold shadow-[0_0_10px_rgba(234,179,8,0.4)] hover:shadow-[0_0_15px_rgba(234,179,8,0.6)]">
               <Crown className="w-4 h-4" />
               <span>{language === 'en' ? 'Premium' : 'بريميوم'}</span>
             </Link>
          </li>
        </ul>
      </div>

      <div className="flex items-center space-x-3 rtl:space-x-reverse md:space-x-5">
        <div className="relative flex items-center">
          <AnimatePresence>
            {showSearch && (
              <motion.input
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: window.innerWidth < 768 ? 150 : 250, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="rounded-full border border-[var(--border-color)] bg-[var(--card-bg)]/50 px-8 py-1 text-xs md:px-10 md:py-1.5 md:text-sm text-[var(--text-primary)] placeholder:text-gray-500 outline-none focus:border-[#E50914]/50 focus:bg-[var(--card-bg)]/70 focus:ring-2 focus:ring-[#E50914]/20 transition-all duration-300"
              />
            )}
          </AnimatePresence>
          <SearchIcon 
            onClick={toggleSearch} 
            className={cn(
              "h-5 w-5 cursor-pointer transition-all duration-300 transform hover:scale-125 hover:text-[#E50914]", 
              showSearch ? "absolute left-2.5 text-gray-400" : "text-gray-400"
            )} 
          />
          {showSearch && query && (
             <X 
               onClick={() => { setQuery(''); }}
               className="absolute right-3 h-4 w-4 cursor-pointer text-gray-400 hover:text-[#E50914] transition-colors" 
             />
          )}
        </div>
        
        <div className="hidden lg:flex items-center space-x-6 mx-4 text-[var(--text-primary)]">
          <button 
            onClick={toggleTheme}
            className="p-2 bg-[var(--border-color)] hover:bg-[var(--accent-color)]/10 rounded-full border border-[var(--border-color)] transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button 
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="text-[12px] bg-[var(--border-color)] hover:bg-[var(--accent-color)]/10 border border-[var(--border-color)] px-3 py-1.5 rounded-md font-medium transition-colors"
          >
            {language === 'en' ? 'عربي' : 'English'}
          </button>
          
          <div className="flex flex-col items-end">
            <span className="font-mono text-xs md:text-sm font-medium tracking-wider tabular-nums uppercase">
              {new Intl.DateTimeFormat('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: location?.timezone || undefined
              }).format(currentTime)}
            </span>
            <span className="font-mono text-sm md:text-lg font-bold tracking-wider tabular-nums uppercase text-[#E50914]">
              {new Intl.DateTimeFormat('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: location?.timezone || undefined
              }).format(currentTime)}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5 flex items-center gap-1">
              <span>📍</span>
              <span>{location ? `${location.timezone.split('/')[1]}` : '...'}</span>
            </span>
          </div>
        </div>

        <div 
          className="relative"
          onMouseEnter={() => setShowNotifications(true)}
          onMouseLeave={() => setShowNotifications(false)}
        >
          <div className="relative cursor-pointer transition-all hover:scale-110 active:scale-95 group">
            <Bell className="h-5 w-5 text-gray-400 transition-colors group-hover:text-[#E50914]" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E50914] text-[10px] font-bold text-white shadow-lg ring-2 ring-[var(--bg-primary)]">
                {unreadCount}
              </span>
            )}
          </div>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-72 md:w-80 max-h-[450px] overflow-hidden rounded-xl bg-[var(--card-bg)] backdrop-blur-2xl border border-[var(--border-color)] shadow-2xl z-50 flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--text-primary)]/[0.03] px-4 py-3">
                  <h3 className="text-sm font-bold font-arabic text-[var(--text-primary)]">
                    {language === 'en' ? 'Notifications' : 'الإشعارات'}
                  </h3>
                  {notifications.length > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-[#E50914] hover:text-[#E50914]/80 transition-colors font-arabic"
                    >
                      {language === 'en' ? 'Mark all as read' : 'تم قراءة الكل'}
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-[var(--border-color)]">
                      {notifications.map((n) => (
                        <div 
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            navigate(`/watch/${n.type}/${n.tmdbId}`);
                            setShowNotifications(false);
                          }}
                          className={cn(
                            "group flex items-start gap-3 md:gap-4 p-3 md:p-4 hover:bg-[var(--text-primary)]/[0.03] cursor-pointer transition-all relative overflow-hidden",
                            !n.isRead && "bg-[#E50914]/5"
                          )}
                        >
                          <div className="relative h-12 w-8 md:h-14 md:w-10 flex-shrink-0 overflow-hidden rounded shadow-lg border border-[var(--border-color)]">
                            <img 
                              src={`https://image.tmdb.org/t/p/w200${n.image}`} 
                              alt={n.title}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                            />
                            {!n.isRead && <div className="absolute top-0 right-0 h-2 w-2 bg-[#E50914] rounded-full ring-2 ring-[var(--bg-primary)]" />}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1 space-y-1">
                            <h4 className="text-xs md:text-[13px] font-bold text-[var(--text-primary)] truncate group-hover:text-[#E50914] transition-colors">{n.title}</h4>
                            <p className="text-[10px] md:text-[11px] text-gray-500 font-arabic line-clamp-1">{n.description}</p>
                            <span className="text-[8px] md:text-[9px] text-gray-400 uppercase tracking-wider font-mono">
                              {formatDistanceToNow(n.timestamp, { 
                                addSuffix: true, 
                                locale: language === 'ar' ? ar : undefined 
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 opacity-50">
                      <Bell className="h-10 w-10 text-gray-400" />
                      <p className="text-xs text-gray-400 font-arabic">
                        {language === 'en' ? 'No recent notifications' : 'لا توجد إشعارات حديثة'}
                      </p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <button 
                    onClick={clearNotifications}
                    className="w-full bg-[var(--text-primary)]/[0.03] py-2.5 text-[11px] font-bold text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all border-t border-[var(--border-color)] font-arabic"
                  >
                    {language === 'en' ? 'Clear all' : 'مسح كل الإشعارات'}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div 
          onMouseEnter={() => setShowAccountMenu(true)}
          onMouseLeave={() => setShowAccountMenu(false)}
          className="group relative flex items-center space-x-1 md:space-x-2 cursor-pointer py-2"
        >
          {user ? (
            <img 
              src={user.photoURL || ''} 
              alt="Profile" 
              className="h-7 w-7 md:h-8 md:w-8 rounded-full border border-[var(--border-color)] transition group-hover:border-[#E50914] group-hover:scale-105"
            />
          ) : (
            <div className="h-7 w-7 md:h-8 md:w-8 overflow-hidden rounded bg-[#E50914] flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(229,9,20,0.5)] transition group-hover:scale-105">
               <UserIcon className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          )}
          <ChevronDown className={cn("h-3 w-3 md:h-4 md:w-4 transition duration-300 text-gray-400 hover:text-[#E50914]", showAccountMenu ? "rotate-180" : "")} />

          <AnimatePresence>
            {showAccountMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 w-40 md:w-48 overflow-hidden rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] shadow-2xl"
              >
                {user ? (
                  <div className="flex flex-col py-1 md:py-2 text-[var(--text-primary)]">
                    <div className="px-3 py-1 md:px-4 md:py-2 border-b border-[var(--border-color)] space-y-1">
                      <p className="text-[10px] md:text-xs text-gray-500 truncate">{user.displayName || user.email}</p>
                    </div>
                    <Link 
                      to="/settings"
                      onClick={() => setShowAccountMenu(false)}
                      className="flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm hover:bg-[var(--border-color)] transition-colors"
                    >
                      <span>⚙️</span>
                      <span>{language === 'en' ? 'Settings' : 'الإعدادات'}</span>
                    </Link>
                    <button 
                      onClick={() => { logout(); setShowAccountMenu(false); }}
                      className="flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm hover:bg-[var(--border-color)] transition-colors text-red-500 w-full text-left"
                    >
                      <span>🚪</span>
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { loginWithGoogle(); setShowAccountMenu(false); }}
                    className="flex w-full items-center space-x-2 md:space-x-3 px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm hover:bg-[var(--border-color)] transition-colors text-[var(--text-primary)]"
                  >
                    <div className="flex h-4 w-4 md:h-5 md:w-5 items-center justify-center bg-white rounded-sm p-0.5 shadow-sm border border-gray-100">
                      <svg viewBox="0 0 24 24" className="h-full w-full">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <span>{t('loginGoogle')}</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-[280px] bg-[var(--bg-primary)] text-[var(--text-primary)] z-[70] shadow-2xl flex flex-col py-6 px-4 md:hidden border-r border-[var(--border-color)]"
            >
              <div className="flex items-center justify-between mb-8 border-b border-[var(--border-color)] pb-4">
                <span className="text-xl font-bold text-[#E50914]">CineStream</span>
                <button onClick={() => setShowMobileMenu(false)} className="p-1">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6">
                <div className="space-y-4">
                  <Link to="/" onClick={() => setShowMobileMenu(false)} className="flex items-center space-x-3 text-lg font-bold">
                    <span>🏡</span>
                    <span>{t('home')}</span>
                  </Link>
                  <Link to="/favorites" onClick={() => setShowMobileMenu(false)} className="flex items-center space-x-3 text-lg font-bold">
                    <span>🌟</span>
                    <span>{t('favorites')}</span>
                  </Link>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold px-1 border-l-2 border-[#E50914] ml-1 flex items-center gap-2"><span>🎞️</span> {t('movies')}</h3>
                  <div className="grid grid-cols-1 gap-2 pl-4">
                    <Link to="/category/new-releases" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>✨</span> {language === 'en' ? 'Latest Movies' : 'أحدث الأفلام'}</Link>
                    <Link to="/category/arabic-movies" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>🇸🇦</span> {t('arabicMovies')}</Link>
                    <Link to="/category/popular-movies" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>🌍</span> {t('foreignMovies')}</Link>
                    <Link to="/category/asian-movies" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>⛩️</span> {t('asianMovies')}</Link>
                    <Link to="/category/indian-movies" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>🇮🇳</span> {t('indianMovies')}</Link>
                    <Link to="/category/turkish-movies" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>🇹🇷</span> {t('turkishMovies')}</Link>
                    <Link to="/category/horror-movies" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-red-500 font-bold py-1"><span>💀</span> {t('horrorMovies')}</Link>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold px-1 border-l-2 border-[#E50914] ml-1 flex items-center gap-2"><span>🎭</span> {t('series')}</h3>
                  <div className="grid grid-cols-1 gap-2 pl-4">
                    <Link to="/category/current-series" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>✨</span> {language === 'en' ? 'Latest Series' : 'أحدث المسلسلات'}</Link>
                    <Link to="/category/series-arabic" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>🇸🇦</span> {t('arabicSeries')}</Link>
                    <Link to="/category/series-popular" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>🌍</span> {t('foreignSeries')}</Link>
                    <Link to="/category/series-asian" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>⛩️</span> {t('asianSeries')}</Link>
                    <Link to="/category/series-indian" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>🇮🇳</span> {t('indianSeries') || 'مسلسلات هندية'}</Link>
                    <Link to="/category/turkish-series" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>🇹🇷</span> {t('turkishSeries')}</Link>
                    <Link to="/category/originals" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>💎</span> {t('originals')}</Link>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold px-1 border-l-2 border-[#E50914] ml-1 flex items-center gap-2"><span>🍥</span> {t('anime')}</h3>
                  <div className="grid grid-cols-1 gap-2 pl-4">
                    <Link to="/category/anime-subbed" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>💬</span> {t('animeSubbed')}</Link>
                    <Link to="/category/anime" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>🎥</span> {t('animeMovies')}</Link>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold px-1 border-l-2 border-[#E50914] ml-1 flex items-center gap-2"><span>🏰</span> {t('cartoon')}</h3>
                  <div className="grid grid-cols-1 gap-2 pl-4">
                    <Link to="/category/cartoon-subbed" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>💬</span> {t('cartoonSubbed')}</Link>
                    <Link to="/category/cartoons" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E50914] py-1"><span>✨</span> {t('disneyMovies')}</Link>
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border-color)] space-y-4">
                  <button 
                    onClick={() => { toggleTheme(); setShowMobileMenu(false); }}
                    className="flex w-full items-center justify-between font-bold"
                  >
                    <div className="flex items-center gap-3">
                      <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                      <span>{theme === 'dark' ? (language === 'en' ? 'Light Mode' : 'الوضع الفاتح') : (language === 'en' ? 'Dark Mode' : 'الوضع الداكن')}</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setLanguage(language === 'en' ? 'ar' : 'en'); setShowMobileMenu(false); }}
                    className="flex w-full items-center justify-between font-bold"
                  >
                    <div className="flex items-center gap-3">
                      <span>🌐</span>
                      <span>{language === 'en' ? 'Arabic' : 'الإنجليزية'}</span>
                    </div>
                    <span className="text-[10px] bg-[var(--text-primary)] text-[var(--bg-primary)] px-2 py-0.5 rounded uppercase font-mono">{language === 'en' ? 'ع' : 'EN'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
