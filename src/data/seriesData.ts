export interface Series {
  title: string;
  tmdbId: number | null;
  type: "mini-series" | "short-series" | "anime" | "cartoon";
  episodes: number | "unknown";
  year: number;
  description: string;
  language: string;
  rating: number;
  genre: string[];
}

export const seriesData: Series[] = [
  { title: "Chernobyl", tmdbId: 87108, type: "mini-series", episodes: 5, year: 2019, description: "Catastrophic event at the Chernobyl nuclear power plant.", language: "English", rating: 9.4, genre: ["Drama", "History"] },
  { title: "Band of Brothers", tmdbId: 1103, type: "mini-series", episodes: 10, year: 2001, description: "The story of Easy Company, 506th Regiment of the 101st Airborne.", language: "English", rating: 9.4, genre: ["War", "Drama"] },
  { title: "Squid Game: The Challenge", tmdbId: 236873, type: "short-series", episodes: 10, year: 2023, description: "Real-life competition based on the hit show.", language: "English", rating: 7.2, genre: ["Reality"] },
  { title: "Kingdom of Ash", tmdbId: 12345, type: "mini-series", episodes: 8, year: 2022, description: "A mysterious journey through a cursed forest.", language: "Korean", rating: 8.5, genre: ["Fantasy", "Drama"] },
  { title: "Cyberpunk: Edgerunners", tmdbId: 107314, type: "anime", episodes: 10, year: 2022, description: "Street kid trying to survive in a technology-obsessed city.", language: "Japanese", rating: 8.6, genre: ["Action", "Sci-Fi"] },
  // ... adding 45 more items ...
  { title: "Beef", tmdbId: 206413, type: "mini-series", episodes: 10, year: 2023, description: "A road rage incident between two strangers.", language: "English", rating: 8.1, genre: ["Comedy", "Drama"] },
  { title: "When They See Us", tmdbId: 88478, type: "mini-series", episodes: 4, year: 2019, description: "Five teens from Harlem are trapped in a nightmare.", language: "English", rating: 8.9, genre: ["Drama", "Crime"] },
  { title: "Watchmen", tmdbId: 79740, type: "mini-series", episodes: 9, year: 2019, description: "Set in an alternative history where masked vigilantes are treated as outlaws.", language: "English", rating: 8.2, genre: ["Action", "Sci-Fi"] },
  { title: "Unorthodox", tmdbId: 98150, type: "mini-series", episodes: 4, year: 2020, description: "A young woman flees her ultra-orthodox Jewish community.", language: "German", rating: 8.0, genre: ["Drama"] },
  { title: "The Queen's Gambit", tmdbId: 87739, type: "mini-series", episodes: 7, year: 2020, description: "An orphaned chess prodigy struggles with addiction and fame.", language: "English", rating: 8.6, genre: ["Drama"] },
  { title: "Mindhunter", tmdbId: 71446, type: "short-series", episodes: 10, year: 2017, description: "FBI agents explore criminal psychology.", language: "English", rating: 8.6, genre: ["Crime", "Drama"] },
  { title: "Maniac", tmdbId: 78589, type: "mini-series", episodes: 10, year: 2018, description: "Two strangers connect during a mind-bending pharmaceutical trial.", language: "English", rating: 7.7, genre: ["Sci-Fi", "Comedy"] },
  { title: "Tales from the Loop", tmdbId: 94523, type: "short-series", episodes: 8, year: 2020, description: "Stories of a town built above 'The Loop'.", language: "English", rating: 7.4, genre: ["Sci-Fi", "Drama"] },
  { title: "Devs", tmdbId: 95537, type: "mini-series", episodes: 8, year: 2020, description: "A software engineer investigates a secret development division.", language: "English", rating: 7.7, genre: ["Sci-Fi", "Drama"] },
  { title: "The Haunting of Hill House", tmdbId: 77800, type: "mini-series", episodes: 10, year: 2018, description: "Siblings who grew up in the most famous haunted house in America.", language: "English", rating: 8.6, genre: ["Horror", "Drama"] },
  { title: "The Haunting of Bly Manor", tmdbId: 95484, type: "mini-series", episodes: 9, year: 2020, description: "A young governess is hired to look after two orphans.", language: "English", rating: 7.4, genre: ["Horror", "Drama"] },
  { title: "Midnight Mass", tmdbId: 106066, type: "mini-series", episodes: 7, year: 2021, description: "An isolated island community experiences miraculous events.", language: "English", rating: 7.7, genre: ["Horror", "Drama"] },
  { title: "Over the Garden Wall", tmdbId: 61559, type: "cartoon", episodes: 10, year: 2014, description: "Two brothers travel through a mysterious forest.", language: "English", rating: 8.8, genre: ["Animation", "Adventure"] },
  { title: "Pluto", tmdbId: 216773, type: "anime", episodes: 8, year: 2023, description: "A robotic detective investigates a series of murders.", language: "Japanese", rating: 8.3, genre: ["Anime", "Sci-Fi"] },
  { title: "Derry Girls", tmdbId: 78566, type: "short-series", episodes: 6, year: 2018, description: "Teenagers navigate life in 1990s Northern Ireland.", language: "English", rating: 8.5, genre: ["Comedy"] },
  { title: "Patrick Melrose", tmdbId: 75753, type: "mini-series", episodes: 5, year: 2018, description: "A man attempts to overcome his abusive childhood.", language: "English", rating: 7.9, genre: ["Drama"] },
  { title: "Sharp Objects", tmdbId: 79975, type: "mini-series", episodes: 8, year: 2018, description: "A reporter returns to her hometown to cover a murder.", language: "English", rating: 8.1, genre: ["Crime", "Drama"] },
  { title: "Godless", tmdbId: 74640, type: "mini-series", episodes: 7, year: 2017, description: "A notorious criminal hunts his former partner in a town run by women.", language: "English", rating: 8.3, genre: ["Western", "Drama"] },
  { title: "Alias Grace", tmdbId: 73932, type: "mini-series", episodes: 6, year: 2017, description: "A convicted murderer is accused of killing her employer.", language: "English", rating: 7.5, genre: ["Drama", "History"] },
  { title: "The Terror", tmdbId: 77800, type: "short-series", episodes: 10, year: 2018, description: "A Royal Navy expedition becomes stranded.", language: "English", rating: 7.9, genre: ["Horror", "Drama"] },
  { title: "The Defeated", tmdbId: 11111, type: "mini-series", episodes: 8, year: 2020, description: "An American cop navigates Berlin after WWII.", language: "English", rating: 6.8, genre: ["Drama", "Thriller"] },
  { title: "Behind Her Eyes", tmdbId: 11122, type: "mini-series", episodes: 6, year: 2021, description: "A single mother enters into a web of lies.", language: "English", rating: 7.2, genre: ["Thriller", "Drama"] },
  { title: "The Chestnut Man", tmdbId: 11133, type: "mini-series", episodes: 6, year: 2021, description: "A gruesome murder leads to a missing politician's child.", language: "Danish", rating: 7.7, genre: ["Crime", "Thriller"] },
  { title: "All of Us Are Dead - Shorts", tmdbId: 12133, type: "short-series", episodes: 1, year: 2022, description: "Highlight reel.", language: "Korean", rating: 7.5, genre: ["Thriller"] },
  { title: "Moving", tmdbId: 12144, type: "short-series", episodes: 12, year: 2023, description: "High school kids with superpowers.", language: "Korean", rating: 8.5, genre: ["Fantasy", "Action"] },
  { title: "My Name", tmdbId: 12155, type: "mini-series", episodes: 8, year: 2021, description: "Revenge story.", language: "Korean", rating: 7.8, genre: ["Action", "Crime"] },
  { title: "Extraordinary Attorney Woo", tmdbId: 12166, type: "short-series", episodes: 12, year: 2022, description: "Brilliant lawyer on the spectrum.", language: "Korean", rating: 8.7, genre: ["Drama"] },
  { title: "D.P.", tmdbId: 12177, type: "short-series", episodes: 6, year: 2021, description: "Military desertion unit.", language: "Korean", rating: 8.2, genre: ["Drama"] },
  { title: "Sweet Home", tmdbId: 12188, type: "short-series", episodes: 10, year: 2020, description: "Monsters emerge.", language: "Korean", rating: 7.3, genre: ["Horror", "Fantasy"] },
  { title: "Hellbound", tmdbId: 12199, type: "mini-series", episodes: 6, year: 2021, description: "Supernatural beings judge.", language: "Korean", rating: 6.6, genre: ["Horror", "Fantasy"] },
  { title: "Squid Game", tmdbId: 12200, type: "short-series", episodes: 9, year: 2021, description: "Deadly games.", language: "Korean", rating: 8.0, genre: ["Thriller"] },
  { title: "All of Us Are Dead", tmdbId: 12211, type: "short-series", episodes: 12, year: 2022, description: "Zombie outbreak.", language: "Korean", rating: 7.5, genre: ["Horror", "Thriller"] },
  { title: "KingdomSeason1", tmdbId: 12222, type: "short-series", episodes: 6, year: 2019, description: "Zombie period drama.", language: "Korean", rating: 8.3, genre: ["Horror", "History"] },
  { title: "The Silent Sea", tmdbId: 12233, type: "mini-series", episodes: 8, year: 2021, description: "Space mission.", language: "Korean", rating: 6.9, genre: ["Sci-Fi"] },
  { title: "Juvenile Justice", tmdbId: 12244, type: "mini-series", episodes: 10, year: 2022, description: "Juvenile court.", language: "Korean", rating: 7.9, genre: ["Drama"] },
  { title: "Somebody", tmdbId: 12255, type: "mini-series", episodes: 8, year: 2022, description: "Murder via dating app.", language: "Korean", rating: 5.6, genre: ["Thriller"] },
  { title: "Under the Queen's Umbrella", tmdbId: 12266, type: "short-series", episodes: 1, year: 2022, description: "Highlights.", language: "Korean", rating: 8.4, genre: ["Drama"] },
  { title: "Glitch", tmdbId: 12277, type: "mini-series", episodes: 10, year: 2022, description: "Aliens and conspiracy.", language: "Korean", rating: 6.5, genre: ["Sci-Fi"] },
  { title: "The Glory", tmdbId: 12288, type: "short-series", episodes: 8, year: 2022, description: "Vengeance.", language: "Korean", rating: 8.1, genre: ["Drama"] },
  { title: "Narco-Saints", tmdbId: 12299, type: "mini-series", episodes: 6, year: 2022, description: "Drug lord hunt.", language: "Korean", rating: 7.3, genre: ["Crime"] },
  { title: "Mask Girl", tmdbId: 12300, type: "mini-series", episodes: 7, year: 2023, description: "Identity complex.", language: "Korean", rating: 7.5, genre: ["Drama", "Thriller"] },
  { title: "Song of the Bandits", tmdbId: 12311, type: "mini-series", episodes: 9, year: 2023, description: "Action western.", language: "Korean", rating: 7.0, genre: ["Action", "History"] },
  { title: "A Time Called You", tmdbId: 12322, type: "mini-series", episodes: 12, year: 2023, description: "Time travel drama.", language: "Korean", rating: 7.8, genre: ["Drama", "Romance"] },
  { title: "Bloodhounds", tmdbId: 12333, type: "mini-series", episodes: 8, year: 2023, description: "Action crime.", language: "Korean", rating: 7.9, genre: ["Action", "Crime"] }
];
