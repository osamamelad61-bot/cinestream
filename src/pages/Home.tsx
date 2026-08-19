import { motion } from 'motion/react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import MovieRow from '@/components/MovieRow';
import ContinueWatchingRow from '@/components/ContinueWatchingRow';
import { requests } from '@/services/tmdbService';
import { Movie } from '@/types';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const handleMovieClick = (movie: Movie) => {
    const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
    navigate(`/watch/${type}/${movie.id}`);
  };

  return (
    <div className="relative min-h-screen">
      <Navbar />
      
      <main className="relative pb-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Hero />

            <section className="relative z-50 -mt-12 md:-mt-24 space-y-12 md:space-y-16 px-0 md:px-4">
              <ContinueWatchingRow />
              
              <div className="space-y-10">
                <MovieRow title={language === 'en' ? '🔥 Trending Now' : '🔥 المحتوى الرائج'} fetchUrl={requests.trending} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '💎 CineStream Originals' : '💎 أعمال CineStream الأصلية'} fetchUrl={requests.netflixOriginals} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '✨ Newly Released' : '✨ أحدث الأفلام'} fetchUrl={requests.nowPlayingMovies} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '⭐ Top Rated' : '⭐ الأعلى تقييماً'} fetchUrl={requests.topRated} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '🎬 Popular Movies' : '🎬 الأفلام الأكثر شعبية'} fetchUrl={requests.popular} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '🎭 Currently Airing Series' : '🎭 مسلسلات تعرض حالياً'} fetchUrl={requests.onTheAirSeries} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '🇸🇦 Arabic Movies' : '🇸🇦 أفلام عربية'} fetchUrl={requests.arabicMovies} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '🇸🇦 Arabic Series' : '🇸🇦 مسلسلات عربية'} fetchUrl={requests.arabicSeries} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '🧨 Action Movies' : '🧨 أفلام الأكشن'} fetchUrl={requests.actionMovies} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '😂 Comedies' : '😂 أفلام كوميدية'} fetchUrl={requests.comedyMovies} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '💀 Horror Movies' : '💀 أفلام رعب'} fetchUrl={requests.horrorMovies} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '🇹🇷 Turkish Series' : '🇹🇷 مسلسلات تركية'} fetchUrl={requests.turkishSeries} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '🇹🇷 Turkish Movies' : '🇹🇷 أفلام تركية'} fetchUrl={requests.turkishMovies} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '🇮🇳 Indian Movies' : '🇮🇳 أفلام هندية'} fetchUrl={requests.indianMovies} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '🇮🇳 Indian Series' : '🇮🇳 مسلسلات هندية'} fetchUrl={requests.indianSeries} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '🇰🇷 Asian & Korean Series' : '🇰🇷 مسلسلات كورية وآسيوية'} fetchUrl={requests.asianSeries} onMovieClick={handleMovieClick} />
                
                <MovieRow title={language === 'en' ? '⛩️ Asian Movies' : '⛩️ أفلام آسيوية'} fetchUrl={requests.asianMovies} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '🇰🇷 Korean Movies' : '🇰🇷 أفلام كورية'} fetchUrl={requests.koreanMovies} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '🇯🇵 Japanese Movies' : '🇯🇵 أفلام يابانية'} fetchUrl={requests.japaneseMovies} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '🇨🇳 Chinese Movies' : '🇨🇳 أفلام صينية'} fetchUrl={requests.chineseMovies} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '🍥 Anime' : '🍥 أنمي'} fetchUrl={requests.anime} onMovieClick={handleMovieClick} />
                
                <MovieRow title={language === 'en' ? '✨ Disney Movies' : '✨ أفلام ديزني'} fetchUrl={requests.disneyMovies} onMovieClick={handleMovieClick} />
                
                <MovieRow title={language === 'en' ? '📺 Disney Series' : '📺 مسلسلات ديزني'} fetchUrl={requests.disneySeries} onMovieClick={handleMovieClick} />

                <MovieRow title={language === 'en' ? '🏰 Cartoons' : '🏰 كرتون'} fetchUrl={requests.cartoons} onMovieClick={handleMovieClick} />
              </div>
            </section>
          </motion.div>
      </main>
    </div>
  );
}
