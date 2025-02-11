const API_KEY = "9285d1e9c88254ee11ff102b45b09e32"; 
const BASE_URL = "https://api.themoviedb.org/3";
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour

// Generic function to fetch data with caching
const fetchWithCache = async (url, cacheKey) => {
  try {
    const cachedData = JSON.parse(localStorage.getItem(cacheKey));

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION_TIME) {
      console.log(`Cache hit: ${cacheKey}`);
      return cachedData.data;
    }

    console.log(`Fetching from API: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Network error: ${response.statusText}`);

    const data = await response.json();
    if (!data || (!data.results && !data.id)) throw new Error("Invalid API response format");

    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  } catch (error) {
    console.error("Fetch error:", error.message);
    return { results: [] }; // Always return an object with an empty results array
  }
};

// Fetch movies based on a query
export const fetchMovies = async (query) => {
  const data = await fetchWithCache(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`,
    `movie-${query}`
  );
  return data?.results || [];
};

// Fetch TV shows based on a query
export const fetchTVShows = async (query) => {
  const data = await fetchWithCache(
    `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`,
    `tv-${query}`
  );
  return data?.results || [];
};

// Fetch actors based on a query
export const fetchActors = async (query) => {
  const data = await fetchWithCache(
    `${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(query)}`,
    `actors-${query}`
  );
  return data?.results || [];
};

// Fetch full movie details including cast, trailers, and reviews
export const fetchMovieDetails = async (id) => {
  return fetchWithCache(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=videos,credits,reviews`,
    `movie-details-${id}`
  );
};

// Fetch cast details separately
export const fetchMovieCast = async (id) => {
  return fetchWithCache(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`, `movie-cast-${id}`);
};

// Fetch movie trailers separately
export const fetchMovieTrailers = async (id) => {
  return fetchWithCache(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`, `movie-trailers-${id}`);
};

// Fetch movie reviews separately
export const fetchMovieReviews = async (id) => {
  return fetchWithCache(`${BASE_URL}/movie/${id}/reviews?api_key=${API_KEY}`, `movie-reviews-${id}`);
};

// Fetch details for any type (movie, tv, person)
export const fetchDetails = async (id, type = "movie") => {
  return fetchWithCache(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`, `details-${type}-${id}`);
};

// Fetch recommended movies based on watchlist
export const fetchRecommendedMovies = async (movieIds) => {
  if (!movieIds.length) return [];

  const genreCounts = {};

  // Fetch movie details and count genres
  await Promise.all(movieIds.map(async (id) => {
    const movie = await fetchMovieDetails(id);
    if (movie.genres) {
      movie.genres.forEach((genre) => {
        genreCounts[genre.id] = (genreCounts[genre.id] || 0) + 1;
      });
    }
  }));

  // Sort genres by most frequent
  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([genreId]) => genreId);

  if (!sortedGenres.length) return [];

  // Fetch recommended movies based on top genre
  const topGenre = sortedGenres[0];
  const recommendations = await fetchWithCache(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${topGenre}`,
    `recommended-${topGenre}`
  );

  return recommendations.results || [];
};
