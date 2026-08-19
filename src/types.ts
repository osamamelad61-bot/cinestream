export interface Movie {
  id: number;
  title?: string;
  name?: string;

  overview?: string; // كان لازم تبقى optional عشان TMDB أحيانًا بيرجع null
  backdrop_path?: string;
  poster_path?: string;

  release_date?: string;
  first_air_date?: string;

  vote_average?: number;

  media_type?: 'movie' | 'tv';

  backdrops?: string[];

  // 🔥 إضافات مهمة ناقصة عندك
  runtime?: number;
  genres?: { id: number; name: string }[];

  original_language?: string;
  popularity?: number;
}

export interface TMDBCategory {
  title: string;
  fetchUrl: string;
  isLarge?: boolean;

  // 🔥 مفيد لو عايز pagination أو filtering
  page?: number;
}
