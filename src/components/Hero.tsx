import React, { useState, useEffect } from "react";
import { Play, Star, Calendar, X } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const Hero = () => {
  const [featuredMovies, setFeaturedMovies] = useState<any[]>([]);
  const [currentMovie, setCurrentMovie] = useState(0);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // Detect dark mode using the prefers-color-scheme media query
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Replace with your TMDB API Key
  const API_KEY = "9285d1e9c88254ee11ff102b45b09e32";
  const BASE_URL = "https://api.themoviedb.org/3";

  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Listen for changes in dark mode preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  // Fetch popular movies on mount
  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/movie/popular`, {
          params: {
            api_key: API_KEY,
            language: "en-US",
            page: 1,
          },
        });
        setFeaturedMovies(response.data.results);
      } catch (error) {
        console.error("Error fetching movie data:", error);
      }
    };

    fetchFeaturedMovies();
  }, []);

  // Auto-cycle through movies every 8 seconds
  useEffect(() => {
    if (featuredMovies.length === 0) return;
    const timer = setInterval(() => {
      setCurrentMovie((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredMovies]);

  // Fetch trailer data for the clicked movie
  const handleTrailerClick = async (movieId: number) => {
    try {
      const response = await axios.get(`${BASE_URL}/movie/${movieId}/videos`, {
        params: {
          api_key: API_KEY,
          language: "en-US",
        },
      });
      const trailer = response.data.results.find(
        (video: any) =>
          video.type === "Trailer" && video.site === "YouTube"
      );
      if (trailer) {
        setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}`);
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
    }
  };

  // Close the trailer modal
  const handleCancelTrailer = () => {
    setTrailerUrl(null);
  };

  const movie = featuredMovies[currentMovie];

  // Update text styles based on mobile view and dark mode.
  // On mobile:
  // - Dark mode: white text with white glow and a black border.
  // - Light mode: black text with black glow and a white border.
  // On desktop, keep the default white text with a white glow.
  let titleStyle = {};
  let overviewStyle = {};

  if (isMobile) {
    if (isDarkMode) {
      titleStyle = {
        color: "white",
        textShadow: "0 0 8px white",
        WebkitTextStroke: "1px black",
      };
      overviewStyle = {
        color: "white",
        textShadow: "0 0 6px white",
        WebkitTextStroke: "1px black",
      };
    } else {
      titleStyle = {
        color: "black",
        textShadow: "0 0 8px black",
        WebkitTextStroke: "1px white",
      };
      overviewStyle = {
        color: "black",
        textShadow: "0 0 6px black",
        WebkitTextStroke: "1px white",
      };
    }
  } else {
    titleStyle = {
      color: "white",
      textShadow: "0 0 8px white",
    };
    overviewStyle = {
      color: "white",
      textShadow: "0 0 6px white",
    };
  }

  return (
    // Hero section: 60vh on mobile and 90vh on medium+ screens
    <div className="relative h-[60vh] md:h-[90vh] bg-gradient-to-b from-transparent to-black">
      {movie && (
        <>
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{
              backgroundImage: `url('https://image.tmdb.org/t/p/original${
                isMobile ? movie.poster_path : movie.backdrop_path
              }')`,
            }}
          >
            {/* Render the blur overlay ONLY on non-mobile */}
            {!isMobile && (
              <div
                className="absolute inset-0 bg-black/30 transition-all duration-1000"
                style={{ backdropFilter: "blur(4px)" }}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="relative container mx-auto px-4 h-full flex flex-col justify-end items-center md:justify-center md:items-start pb-8">
            <div className="max-w-2xl text-center md:text-left">
              {/* Info Badges */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <Star className="w-5 h-5 text-yellow-500 dark:text-white" />
                  <span className="font-semibold text-yellow-500 dark:text-white">
                    {movie.vote_average} Rating
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <Calendar className="w-5 h-5 text-zinc-400 dark:text-white" />
                  <span className="text-zinc-300 dark:text-white">
                    {movie.release_date}
                  </span>
                </div>
              </div>
              {/* Title */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4">
                <span style={titleStyle}>{movie.title}</span>
              </h1>
              {/* Overview */}
              <p className="text-base sm:text-lg mb-8 line-clamp-3 max-w-xl mx-auto md:mx-0">
                <span style={overviewStyle}>{movie.overview}</span>
              </p>
              {/* Call-to-Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  to="#"
                  onClick={() => handleTrailerClick(movie.id)}
                  className="bg-yellow-500 text-black px-6 py-2 md:px-8 md:py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-yellow-400 transition-all hover:scale-105 duration-300"
                >
                  <Play className="w-5 h-5" />
                  Watch Trailer
                </Link>
                <Link
                  to={`/movie/${movie.id}`}
                  className="bg-zinc-900/80 backdrop-blur-md text-white px-6 py-2 md:px-8 md:py-3 rounded-xl font-semibold hover:bg-zinc-800 transition-all hover:scale-105 duration-300"
                >
                  More Info
                </Link>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-2 md:bottom-8 md:right-4 md:left-auto md:transform-none">
              {featuredMovies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMovie(index)}
                  className={`transition-all duration-300 rounded-full ${
                    currentMovie === index
                      ? "bg-yellow-500 w-3 h-3 md:w-4 md:h-4"
                      : "bg-gray-400 w-2 h-2 md:w-3 md:h-3 hover:bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Trailer Overlay Modal */}
          {trailerUrl && (
            <div className="absolute inset-0 bg-black/80 flex justify-center items-center">
              <div className="relative w-full h-full max-w-3xl md:max-w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={trailerUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Movie Trailer"
                  className="absolute inset-0"
                />
                <button
                  onClick={handleCancelTrailer}
                  className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Hero;
