import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

const API_KEY = "89e89989982ba3305c463d55bab4d89f";
const BASE_URL = "https://api.themoviedb.org/3";

interface Movie {
  id: number;
  title: string;
  rating: number;
  image: string;
  year: string;
  genre: number[];
}

const ComingSoon = () => {
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchUpcomingMovies = async () => {
      try {
        const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();

        const hollywoodUpcomingMovies = data.results.filter(
          (movie) => movie.original_language === "en"
        );

        setUpcomingMovies(
          hollywoodUpcomingMovies.map((movie) => ({
            id: movie.id,
            title: movie.title,
            rating: movie.vote_average,
            image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            year: movie.release_date?.split("-")[0] || "Unknown",
            genre: movie.genre_ids,
          }))
        );
      } catch (error) {
        console.error("Error fetching upcoming movies:", error);
      }
    };

    fetchUpcomingMovies();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-500" /> Coming Soon
          </h2>
          <Link to="/" className="text-blue-500 hover:text-blue-400">
            Back to Home
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {upcomingMovies.map((movie) => (
            <Link to={`/movie/${movie.id}`} key={movie.id}>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="w-full h-80 object-cover rounded-lg"
                />
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">{movie.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">Year: {movie.year}</p>
                  <p className="text-yellow-500">⭐ {movie.rating.toFixed(1)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
