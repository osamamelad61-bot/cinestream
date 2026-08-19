import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    home: 'الرئيسية',
    movies: 'أفلام',
    series: 'مسلسلات',
    latest: 'الأحدث',
    favorites: 'قائمتي',
    cartoon: 'كرتون',
    anime: 'أنمي',
    wwe: 'مصارعة',
    theaters: 'في السينما',
    cartoonDubbed: 'كرتون مدبلج',
    dubbedMovies: 'أفلام مدبلجة',
    arabicMovies: 'أفلام عربية',
    egyptianMovies: 'أفلام مصرية',
    horrorMovies: 'أفلام رعب',
    foreignMovies: 'أفلام أجنبية',
    asianMovies: 'أفلام آسيوية',
    koreanMovies: 'أفلام كورية',
    japaneseMovies: 'أفلام يابانية',
    chineseMovies: 'أفلام صينية',
    indianMovies: 'أفلام هندية',
    turkishMovies: 'أفلام تركية',
    turkishSeries: 'مسلسلات تركية',
    shortSeries: 'مسلسلات قصيرة',
    arabicSeries: 'مسلسلات عربية',
    asianSeries: 'مسلسلات كورية وآسيوية',
    indianSeries: 'مسلسلات هندية',
    foreignSeries: 'مسلسلات أجنبية',
    originals: 'أعمال أصلية',
    subscriptions: 'الاشتراكات',
    searchPlaceholder: 'ابحث عن أفلام، مسلسلات...',
    loginGoogle: 'الدخول عبر جوجل',
    logout: 'تسجيل الخروج',
    premiumAcc: 'VIP بريميوم',
    normalAcc: 'اشتراك عادي',
    upgradeAcc: 'ترقية الحساب',
    animeSubbed: 'أنمي مترجم',
    animeDubbed: 'أنمي مدبلج (عربي)',
    animeMovies: 'أفلام أنمي',
    cartoonSubbed: 'كرتون مترجم',
    disneyMovies: 'أفلام ديزني',
    subTextTitle: 'لتفعيل الترجمة العربية',
    subTextDesc: 'اضغط على أيقونة الإعدادات أو (CC) داخل المشغل الخاص بالفيديو ثم من (Subtitles/Captions) اختر اللغة العربية (Arabic).',
    watchNow: 'شاهد الآن',
    details: 'التفاصيل',
    download: 'تنزيل',
    downloading: 'جارِ التنزيل...',
    premiumOnly: 'للمشتركين المميزين فقط',
    offlineReady: 'جاهز للمشاهدة بدون إنترنت!',
    loginCancelled: 'تم إلغاء تسجيل الدخول',
    loginError: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.',
    popupBlocked: 'تم حظر النافذة المنبثقة. يرجى السماح بالمنبثقات لهذا الموقع.',
  },
  en: {
    home: 'Home',
    movies: 'Movies',
    series: 'Series',
    latest: 'Latest',
    favorites: 'My List',
    cartoon: 'Cartoon',
    anime: 'Anime',
    wwe: 'WWE',
    theaters: 'In Theaters',
    cartoonDubbed: 'Dubbed Cartoon',
    dubbedMovies: 'Dubbed Movies',
    arabicMovies: 'Arabic Movies',
    egyptianMovies: 'Egyptian Movies',
    horrorMovies: 'Horror Movies',
    foreignMovies: 'Foreign Movies',
    asianMovies: 'Asian Movies',
    koreanMovies: 'Korean Movies',
    japaneseMovies: 'Japanese Movies',
    chineseMovies: 'Chinese Movies',
    indianMovies: 'Indian Movies',
    turkishMovies: 'Turkish Movies',
    turkishSeries: 'Turkish Series',
    shortSeries: 'Short Series',
    arabicSeries: 'Arabic Series',
    asianSeries: 'Asian & Korean Series',
    indianSeries: 'Indian Series',
    foreignSeries: 'Foreign Series',
    originals: 'Originals',
    subscriptions: 'Subscriptions',
    searchPlaceholder: 'Search movies, TV shows...',
    loginGoogle: 'Login with Google',
    logout: 'Logout',
    premiumAcc: 'VIP Premium',
    normalAcc: 'Standard',
    upgradeAcc: 'Upgrade Account',
    animeSubbed: 'Subbed Anime',
    animeDubbed: 'Dubbed Anime (AR)',
    animeMovies: 'Anime Movies',
    cartoonSubbed: 'Subbed Cartoon',
    disneyMovies: 'Disney Movies',
    subTextTitle: 'To enable Arabic subtitles',
    subTextDesc: 'Click the settings icon or (CC) inside the video player, then under (Subtitles/Captions) choose Arabic.',
    watchNow: 'Watch Now',
    details: 'Details',
    download: 'Download',
    downloading: 'Downloading...',
    premiumOnly: 'Premium Only',
    offlineReady: 'Ready for offline viewing!',
    loginCancelled: 'Login cancelled',
    loginError: 'Login failed. Please try again.',
    popupBlocked: 'Popup blocked. Please allow popups for this site.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-lang');
    return (saved as Language) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('app-lang', language);
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = language;
    // Notify window to reload or update TMDB if needed, so the data refetches
    // A simple reload is the easiest way to ensure all TMDB data re-fetches in the correct language.
    const lastLang = sessionStorage.getItem('last-lang');
    if (lastLang && lastLang !== language) {
      window.location.reload();
    }
    sessionStorage.setItem('last-lang', language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
