import React, { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Star,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useWatchlist } from "../context/WatchlistContext.tsx";
import { useTheme } from "../context/ThemeContext.tsx";

const MovieList = () => {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search");
  const [viewMode, setViewMode] = useState("grid");
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [movies, setMovies] = useState<
    {
      id: number;
      title: string;
      poster_path: string;
      vote_average: number;
      overview: string;
      release_date: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ year: "", genre: "" });
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const API_KEY = "9285d1e9c88254ee11ff102b45b09e32";
  const API_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&page=1`;

  // Detect window width to toggle mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    // Set initial value
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to fetch genres from the API
  const fetchGenres = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`
      );
      const data = await response.json();
      setGenres(data.genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  // Function to fetch movies based on filters
  const fetchMovies = async () => {
    try {
      let url = API_URL;

      if (search) {
        url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${search}&language=en-US&page=1`;
      }

      // Apply filters for year and genre if selected
      if (filters.year) {
        url += `&primary_release_year=${filters.year}`;
      }

      if (filters.genre) {
        url += `&with_genres=${filters.genre}`;
      }

      console.log("Fetching URL: ", url);

      const response = await fetch(url);
      const data = await response.json();
      setMovies(data.results);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [search, filters]);
  useEffect(() => {
    fetchGenres();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // All content is stored in a constant so it can be rendered in both mobile and desktop layouts
  const content = (
    <>
      <h1 className="text-3xl font-bold mb-8">
        {search
          ? `Search Results for "${search}"`
          : `Movies of ${filters.year || "All Years"} ${
              filters.genre
                ? `- Genre: ${
                    genres.find((g) => g.id === Number(filters.genre))?.name
                  }`
                : ""
            }`}
      </h1>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <button className="hidden md:flex gap-2 text-gray-900 dark:text-white">
            <SlidersHorizontal /> Filters
          </button>

          <div className="flex items-center gap-4">
            {/* Year Filter */}
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="bg-gray-200 dark:bg-gray-800 dark:text-white p-2 rounded-md"
            >
              <option value="">Select Year</option>
              {Array.from({ length: 45 }, (_, index) => 2025 - index).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>

            {/* Genre Filter */}
            <select
              name="genre"
              value={filters.genre}
              onChange={handleFilterChange}
              className="bg-gray-200 dark:bg-gray-800 dark:text-white p-2 rounded-md"
            >
              <option value="">Select Genre</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggle View Button - visible on all screen sizes */}
        <button
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          className="flex gap-2 text-gray-900 dark:text-white"
        >
          {viewMode === "grid" ? "Switch to List View" : "Switch to Grid View"}
        </button>
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            : "space-y-6"
        }
      >
        {loading ? (
          <div className="w-full text-center">Loading...</div>
        ) : (
          movies.map((movie) => {
            const isInWatchlist = watchlist.some(
              (item) => Number(item.id) === movie.id
            );

            return (
              <div
                key={movie.id}
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                {viewMode === "grid" && (
                  <div className="flex flex-col">
                    <Link to={`/movie/${movie.id}`}>
                      <div className="relative aspect-[2/3]">
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <div className="absolute top-4 right-4">
                          {isInWatchlist ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                movie.id && removeFromWatchlist(movie.id);
                              }}
                              className="text-red-500"
                            >
                              <BookmarkCheck className="w-6 h-6" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                movie.id &&
                                  addToWatchlist({
                                    id: movie.id,
                                    title: movie.title,
                                    poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                                  });
                              }}
                              className="text-white"
                            >
                              <Bookmark className="w-6 h-6" />
                            </button>
                          )}
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-md flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-yellow-500 font-medium">
                            {movie.vote_average}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="p-4 text-center">
                      <h2 className="text-lg font-semibold">{movie.title}</h2>
                      <button
                        onClick={() => {
                          isInWatchlist
                            ? movie.id && removeFromWatchlist(movie.id)
                            : movie.id &&
                              addToWatchlist({
                                id: movie.id,
                                title: movie.title,
                                poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                              });
                        }}
                        className={`mt-2 w-full py-2 rounded-lg font-semibold transition-colors ${
                          isInWatchlist
                            ? "bg-red-500 text-white hover:bg-red-400"
                            : "bg-green-500 text-white hover:bg-green-400"
                        }`}
                      >
                        {isInWatchlist
                          ? "Remove from Watchlist"
                          : "Add to Watchlist"}
                      </button>
                    </div>
                  </div>
                )}

                {viewMode === "list" && (
                  <div className="flex gap-4 w-full">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-24 h-36 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex flex-col justify-between w-full">
                      <div>
                        <h2 className="text-lg font-bold">{movie.title}</h2>
                        <p className="text-gray-400">{movie.overview}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-yellow-500 font-medium flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current" />
                            {movie.vote_average}
                          </span>
                          <span className="text-gray-400">
                            {movie.release_date?.split("-")[0]}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            isInWatchlist
                              ? movie.id && removeFromWatchlist(movie.id)
                              : movie.id &&
                                addToWatchlist({
                                  id: movie.id,
                                  title: movie.title,
                                  poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                                });
                          }}
                          className={`py-2 px-4 text-sm rounded-lg font-semibold transition-colors ${
                            isInWatchlist
                              ? "bg-red-500 text-white hover:bg-red-400"
                              : "bg-green-500 text-white hover:bg-green-400"
                          }`}
                        >
                          {isInWatchlist
                            ? "Remove from Watchlist"
                            : "Add to Watchlist"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );

  // ---------------- Mobile View ----------------
  if (isMobile) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center p-4 ${
          theme === "dark" ? "bg-black text-white" : "bg-gray-100 text-black"
        }`}
      >
        <div
          className={`w-full shadow-lg rounded-lg p-4 ${
            theme === "dark" ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">
        {search ? `Search Results for "${search}"` : `Movies of ${filters.year || 'All Years'} ${filters.genre ? `- Genre: ${genres.find(g => g.id === Number(filters.genre))?.name}` : ''}`}
      </h1>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button className="hidden md:flex gap-4 text-gray-900 dark:text-white">
            <SlidersHorizontal /> Filters
          </button>

          <div className="flex items-center gap-4">
            {/* Year Filter */}
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="bg-gray-200 dark:bg-gray-800 dark:text-white p-2 rounded-md"
            >
              <option value="">Select Year</option>
              {Array.from({ length: 45 }, (_, index) => 2025 - index).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* Genre Filter */}
            <select
              name="genre"
              value={filters.genre}
              onChange={handleFilterChange}
              className="bg-gray-200 dark:bg-gray-800 dark:text-white p-2 rounded-md"
            >
              <option value="">Select Genre</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle View Button */}
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="hidden md:flex gap-4 text-gray-900 dark:text-white"
          >
            {viewMode === "grid" ? "Switch to List View" : "Switch to Grid View"}
          </button>
        </div>
      </div>

      <div className={viewMode === "grid" ? "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-6"}>
        {loading ? (
          <div className="w-full text-center">Loading...</div>
        ) : (
          movies.map((movie) => {
            const isInWatchlist = watchlist.some((item) => Number(item.id) === movie.id);

            return (
              <div key={movie.id} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
                {viewMode === "grid" && (
                  <div className="flex flex-col">
                    <Link to={`/movie/${movie.id}`}>
                      <div className="relative aspect-[2/3]">
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <div className="absolute top-4 right-4">
                          {isInWatchlist ? (
                            <button onClick={() => movie.id && removeFromWatchlist(movie.id)} className="text-red-500">
                              <BookmarkCheck className="w-6 h-6" />
                            </button>
                          ) : (
                            <button onClick={() => movie.id && addToWatchlist({ id: movie.id, title: movie.title, poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}` })} className="text-white">
                              <Bookmark className="w-6 h-6" />
                            </button>
                          )}
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-md flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-yellow-500 font-medium">{movie.vote_average}</span>
                        </div>
                      </div>
                    </Link>
                    <div className="p-4 text-center">
                      <h2 className="text-lg font-semibold">{movie.title}</h2>
                      <button
                        onClick={() => {
                          isInWatchlist
                            ? movie.id && removeFromWatchlist(movie.id)
                            : movie.id && addToWatchlist({ id: movie.id, title: movie.title, poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}` });
                        }}
                        className={`mt-2 w-full py-2 rounded-lg font-semibold transition-colors ${isInWatchlist ? "bg-red-500 text-white hover:bg-red-400" : "bg-green-500 text-white hover:bg-green-400"}`}
                      >
                        {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                      </button>
                    </div>
                  </div>
                )}

                {viewMode === "list" && (
                  <div className="flex gap-4 w-full">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-24 h-36 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex flex-col justify-between w-full">
                      <div>
                        <h2 className="text-lg font-bold">{movie.title}</h2>
                        <p className="text-gray-400">{movie.overview}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-yellow-500 font-medium flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current" />
                            {movie.vote_average}
                          </span>
                          <span className="text-gray-400">{movie.release_date?.split("-")[0]}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            isInWatchlist
                              ? movie.id && removeFromWatchlist(movie.id)
                              : movie.id && addToWatchlist({ id: movie.id, title: movie.title, poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}` });
                          }}
                          className={`py-2 px-4 w-auto text-sm rounded-lg font-semibold transition-colors ${isInWatchlist ? "bg-red-500 text-white hover:bg-red-400" : "bg-green-500 text-white hover:bg-green-400"}`}
                        >
                          {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MovieList;
