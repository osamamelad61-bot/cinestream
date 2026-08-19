
export interface WatchingProgress {
  id: string;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string;
  timestamp: number;
  progress: number; // 0 to 100
  season?: number;
  episode?: number;
}

const STORAGE_KEY = 'continue_watching_history';
const MAX_ITEMS = 10;

export const saveProgress = (item: Omit<WatchingProgress, 'timestamp'>) => {
  const history = getHistory();
  const index = history.findIndex(h => h.id === item.id && h.type === item.type);
  
  const newItem: WatchingProgress = {
    ...item,
    timestamp: Date.now()
  };

  if (index > -1) {
    history.splice(index, 1);
  }
  
  history.unshift(newItem);
  
  // Limit the history size
  const limitedHistory = history.slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
};

export const getHistory = (): WatchingProgress[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse watching history', e);
    return [];
  }
};

export const removeFromHistory = (id: string, type: 'movie' | 'tv') => {
  const history = getHistory();
  const filtered = history.filter(h => !(h.id === id && h.type === type));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};
