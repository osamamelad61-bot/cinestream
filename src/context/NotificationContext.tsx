import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tmdb, requests } from '@/services/tmdbService';
import { Movie } from '@/types';
import { useLanguage } from './LanguageContext';
import { useFeedback } from './FeedbackContext';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'movie' | 'tv';
  tmdbId: number;
  timestamp: number;
  image?: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { language } = useLanguage();
  const { showFeedback } = useFeedback();

  const fetchNewContent = useCallback(async () => {
    try {
      // Fetch latest movies and series
      const [moviesRes, seriesRes, turkishRes, turkishMoviesRes] = await Promise.all([
        tmdb.get(requests.nowPlayingMovies),
        tmdb.get(requests.onTheAirSeries),
        tmdb.get(requests.turkishSeries),
        tmdb.get(requests.turkishMovies)
      ]);

      const newMovies = moviesRes.data.results.slice(0, 2).map((m: any) => ({
        id: `movie-${m.id}`,
        title: m.title,
        description: language === 'en' ? 'New release available!' : 'متوفر الآن للمشاهدة!',
        type: 'movie',
        tmdbId: m.id,
        timestamp: Date.now(),
        image: m.backdrop_path,
        isRead: false
      }));

      const newSeries = seriesRes.data.results.slice(0, 2).map((s: any) => ({
        id: `tv-${s.id}`,
        title: s.name,
        description: language === 'en' ? 'New episodes on the air!' : 'حلقات جديدة قيد العرض!',
        type: 'tv',
        tmdbId: s.id,
        timestamp: Date.now(),
        image: s.backdrop_path,
        isRead: false
      }));

      const newTurkish = turkishRes.data.results.slice(0, 2).map((s: any) => ({
        id: `tv-tr-${s.id}`,
        title: s.name,
        description: language === 'en' ? 'New Turkish drama added!' : 'مسلسل تركي جديد متاح الآن!',
        type: 'tv',
        tmdbId: s.id,
        timestamp: Date.now(),
        image: s.backdrop_path,
        isRead: false
      }));

      const newTurkishMovies = turkishMoviesRes.data.results.slice(0, 2).map((m: any) => ({
        id: `movie-tr-${m.id}`,
        title: m.title,
        description: language === 'en' ? 'New Turkish movie added!' : 'فيلم تركي جديد متاح الآن!',
        type: 'movie',
        tmdbId: m.id,
        timestamp: Date.now(),
        image: m.backdrop_path,
        isRead: false
      }));

      const combined = [...newMovies, ...newSeries, ...newTurkish, ...newTurkishMovies].sort(() => Math.random() - 0.5);
      
      // Load existing notifications from localStorage to avoid duplicates
      const saved = localStorage.getItem('app-notifications');
      const existing: Notification[] = saved ? JSON.parse(saved) : [];
      
      // Filter out existing ones
      const uniqueNew = combined.filter(n => !existing.some(e => e.id === n.id));

      if (uniqueNew.length > 0) {
        const updated = [...uniqueNew, ...existing].slice(0, 20);
        setNotifications(updated);
        localStorage.setItem('app-notifications', JSON.stringify(updated));
        
        // Show a "New Content" feedback for the first one if the app just loaded or manually triggered
        const mostRecent = uniqueNew[0];
        showFeedback(
          language === 'en' 
            ? `New Content: ${mostRecent.title}` 
            : `محتوى جديد: ${mostRecent.title}`,
          'info'
        );
      } else if (existing.length > 0) {
        setNotifications(existing);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [language, showFeedback]);

  useEffect(() => {
    fetchNewContent();
    // Check every hour
    const interval = setInterval(fetchNewContent, 3600000);
    return () => clearInterval(interval);
  }, [fetchNewContent]);

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    localStorage.setItem('app-notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem('app-notifications', JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('app-notifications');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead, 
      clearNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
