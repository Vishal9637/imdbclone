import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Bookmark, BookmarkCheck } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useWatchlist } from "../context/WatchlistContext.tsx";

const Toprated = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const navigate = useNavigate(); // Initialize the navigate function

  const apiKey = "9285d1e9c88254ee11ff102b45b09e32"; // Replace with your TMDB API key

  useEffect(() => {
    const fetchTopRatedMovies = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`
        );
        const sortedMovies = response.data.results.sort(
          (a, b) => b.vote_average - a.vote_average
        );
        setMovies(sortedMovies);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top-rated movies:", error);
        setError("Failed to load top-rated movies. Please try again later.");
        setLoading(false);
      }
    };

    fetchTopRatedMovies();
  }, [apiKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white container mx-auto p-4">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8"
      >
        <Trophy className="w-8 h-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">Top Rated Movies</h1>
      </motion.div>

      {/* Movies List */}
      <div className="space-y-6">
        {movies.map((movie, index) => {
          const isInWatchlist = watchlist.some(
            (item) => Number(item.id) === movie.id
          );

          return (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col md:flex-row">
                  {/* Ranking Number */}
                  <div className="bg-yellow-500 flex items-center justify-center text-black font-bold text-xl p-4 md:p-0 md:w-16">
                    #{index + 1}
                  </div>

                  {/* Movie Poster */}
                  <div className="relative md:w-48 w-full">
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-auto object-cover cursor-pointer"
                      onClick={() => navigate(`/movie/${movie.id}`)}
                    />
                  </div>

                  {/* Movie Details */}
                  <div className="flex-1 p-4 relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                      <h2
                        className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer"
                        onClick={() => navigate(`/movie/${movie.id}`)}
                      >
                        {movie.title}
                      </h2>
                      {/* Watchlist Icon Button for Desktop */}
                      <div className="hidden md:block">
                        {isInWatchlist ? (
                          <button
                            onClick={() =>
                              movie.id &&
                              removeFromWatchlist(movie.id.toString())
                            }
                            className="text-red-500 text-sm px-3 py-1 rounded-full border border-red-500 hover:bg-red-100 focus:outline-none"
                          >
                            <BookmarkCheck className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              movie.id &&
                              addToWatchlist({
                                id: movie.id.toString(),
                                title: movie.title,
                                poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                              })
                            }
                            className="text-white text-sm px-3 py-1 rounded-full border border-green-500 bg-green-500 hover:bg-green-400 focus:outline-none"
                          >
                            <Bookmark className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Movie Rating */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full w-max mt-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {movie.vote_average}
                      </span>
                    </div>

                    {/* Movie Year and Vote Count */}
                    <div className="text-gray-400 dark:text-gray-200 mt-2">
                      <span>{new Date(movie.release_date).getFullYear()}</span>
                      <span className="mx-2">•</span>
                      <span>{movie.vote_count.toLocaleString()} votes</span>
                    </div>

                    {/* Watchlist Text Button for Mobile */}
                    <div className="mt-4 md:hidden">
                      {isInWatchlist ? (
                        <button
                          onClick={() =>
                            movie.id &&
                            removeFromWatchlist(movie.id.toString())
                          }
                          className="w-full py-2 text-sm font-semibold rounded-lg bg-red-500 text-white hover:bg-red-400 focus:outline-none"
                        >
                          Remove from Watchlist
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            movie.id &&
                            addToWatchlist({
                              id: movie.id.toString(),
                              title: movie.title,
                              poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                            })
                          }
                          className="w-full py-2 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-400 focus:outline-none"
                        >
                          Add to Watchlist
                        </button>
                      )}
                    </div>

                    {/* Watchlist Text Button for Desktop (Optional) */}
                    <div className="mt-4 hidden md:block">
                      {isInWatchlist ? (
                        <button
                          onClick={() =>
                            movie.id &&
                            removeFromWatchlist(movie.id.toString())
                          }
                          className="py-1 px-4 text-sm font-semibold rounded-lg bg-red-500 text-white hover:bg-red-400 focus:outline-none"
                        >
                          Remove from Watchlist
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            movie.id &&
                            addToWatchlist({
                              id: movie.id.toString(),
                              title: movie.title,
                              poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                            })
                          }
                          className="py-1 px-4 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-400 focus:outline-none"
                        >
                          Add to Watchlist
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Toprated;
