/// <reference types="vite/client" />
import axios from 'axios';

const API_KEY =
  import.meta.env.VITE_TMDB_API_KEY ||
  '47448d34898555806c27806f3636599b';

const BASE_URL = 'https://api.themoviedb.org/3';

export const tmdb = axios.create({
  baseURL: BASE_URL,
});

// Always include api_key and language in every request
tmdb.interceptors.request.use((config) => {
  const savedLang = localStorage.getItem('app-lang') || 'ar';
  const tmdbLang = savedLang === 'en' ? 'en-US' : 'ar';

  config.params = {
    api_key: API_KEY,
    language: tmdbLang,
    include_adult: false,
    ...config.params,
  };

  return config;
});

// Response interceptor for better error reporting and adult content filtering
tmdb.interceptors.response.use(
  (response) => {
    // Filter out adult content if results exist in the response
    if (response.data && response.data.results && Array.isArray(response.data.results)) {
      response.data.results = response.data.results.filter((item: any) => !item.adult);
    }
    return response;
  },
  (error) => {
    const customError = {
      message: error.response?.data?.status_message || error.message || 'Unknown error',
      status: error.response?.status,
      url: error.config?.url,
    };
    console.error('TMDB API Error:', customError);
    return Promise.reject(customError);
  }
);

export const requests = {
  trending: '/trending/all/week',
  popular: '/movie/popular',
  netflixOriginals: '/discover/tv?with_networks=213',
  topRated: '/movie/top_rated',

  actionMovies: '/discover/movie?with_genres=28',
  comedyMovies: '/discover/movie?with_genres=35',
  horrorMovies: '/discover/movie?with_genres=27',
  romanceMovies: '/discover/movie?with_genres=10749',
  documentaries: '/discover/movie?with_genres=99',

  // 🔥 FIXED ANIME (stable)
  anime: '/discover/movie?with_genres=16&with_original_language=ja&sort_by=popularity.desc',
  animeSub: '/discover/tv?with_genres=16&with_original_language=ja',
  animeDub: '/discover/tv?with_genres=16&with_original_language=ja',

  // 🔥 FIXED CARTOONS (clean separation)
  cartoons: '/discover/tv?with_genres=16&without_original_language=ja&without_origin_country=JP',
  cartoonSub: '/discover/tv?with_genres=16&without_original_language=ja&without_origin_country=JP',
  cartoonDub: '/discover/tv?with_genres=16&without_original_language=ja&without_origin_country=JP',
  disneyMovies: '/discover/movie?with_genres=16&with_companies=2|3|3166|6125|15886|3475|10342|10227|25|9383', 
  disneySeries: '/discover/tv?with_genres=16&with_companies=6125|15886|3475|10342|10227',

  arabicMovies: '/discover/movie?with_original_language=ar',
  arabicSeries: '/discover/tv?with_original_language=ar',
  asianMovies: '/discover/movie?with_original_language=ko|ja|zh&without_genres=16',
  asianSeries: '/discover/tv?with_original_language=ko|ja|zh&without_genres=16',
  koreanMovies: '/discover/movie?with_original_language=ko',
  japaneseMovies: '/discover/movie?with_original_language=ja&without_genres=16',
  chineseMovies: '/discover/movie?with_original_language=zh|cn',
  indianMovies: '/discover/movie?with_original_language=hi|te|ta|ml|kn|bn',
  indianSeries: '/discover/tv?with_original_language=hi|te|ta|ml|kn|bn',
  turkishSeries: '/discover/tv?with_original_language=tr',
  turkishMovies: '/discover/movie?with_original_language=tr',
  upcomingMovies: '/movie/upcoming',
  nowPlayingMovies: '/movie/now_playing',
  onTheAirSeries: '/tv/on_the_air',
};

// ----------------------------
// FETCH MOVIES BY CATEGORY
// ----------------------------
export const fetchMoviesByCategory = async (
  url: string,
  page: number = 1
) => {
  try {
    const response = await tmdb.get(url, {
      params: { page },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching movies by category:', error);

    return {
      results: [],
      total_pages: 0,
    };
  }
};

// ----------------------------
// FETCH VIDEOS
// ----------------------------
export const fetchMovieVideos = async (
  id: number,
  type: 'movie' | 'tv' = 'movie'
) => {
  try {
    let response = await tmdb.get(`/${type}/${id}/videos`);

    if (!response.data.results.length) {
      const API_KEY =
        import.meta.env.VITE_TMDB_API_KEY ||
        '47448d34898555806c27806f3636599b';

      response = await axios.get(
        `https://api.themoviedb.org/3/${type}/${id}/videos`,
        {
          params: {
            api_key: API_KEY,
            language: 'en-US',
          },
        }
      );
    }

    return response.data.results;
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

// ----------------------------
// FETCH DETAILS
// ----------------------------
export const fetchMovieDetails = async (
  id: number,
  type: 'movie' | 'tv' = 'movie'
) => {
  try {
    const response = await tmdb.get(`/${type}/${id}`, {
      params: {
        append_to_response: 'external_ids'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching details:', error);
    return null;
  }
};

// ----------------------------
// FETCH SIMILAR
// ----------------------------
export const fetchSimilarMovies = async (
  id: number,
  type: 'movie' | 'tv' = 'movie'
) => {
  try {
    const response = await tmdb.get(`/${type}/${id}/similar`);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    return [];
  }
};

// ----------------------------
// IMAGE BASES
// ----------------------------
export const IMAGE_BASE_URL =
  'https://image.tmdb.org/t/p/original';

export const BACKDROP_BASE_URL =
  'https://image.tmdb.org/t/p/w1280';

export const POSTER_BASE_URL =
  'https://image.tmdb.org/t/p/w500';
