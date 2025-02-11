import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWatchlist } from "../context/WatchlistContext.tsx";

const API_KEY = "9285d1e9c88254ee11ff102b45b09e32"; 
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"; 

const Watchlist = () => {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [moviePosters, setMoviePosters] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchMoviePosters = async () => {
      const posterData: { [key: number]: string } = {};

      await Promise.all(
        watchlist.map(async (movie) => {
          const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}`
          );
          const data = await response.json();
          if (data.poster_path) {
            posterData[movie.id] = `${IMAGE_BASE_URL}${data.poster_path}`;
          }
        })
      );

      setMoviePosters(posterData);
    };

    if (watchlist.length > 0) {
      fetchMoviePosters();
    }
  }, [watchlist]);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white container mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-6">Your Watchlist</h2>

      {watchlist.length === 0 ? (
        <p className="text-center text-gray-500">No movies in your watchlist.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {watchlist.map((movie) => (
            <div key={movie.id} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="w-full aspect-[2/3] overflow-hidden rounded-lg">
                <Link to={`/movie/${movie.id}`} className="w-full h-full">
                  <img
                    src={moviePosters[movie.id] || "default-image.jpg"} 
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </Link>
              </div>
              <h3 className="text-lg font-semibold mt-3 text-black dark:text-white">{movie.title}</h3>
              <button
                onClick={() => removeFromWatchlist(movie.id)}
                className="mt-3 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Remove from Watchlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
