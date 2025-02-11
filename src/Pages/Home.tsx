import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext.tsx";
import Hero from "../components/Hero.tsx";
import { Award, Clock, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import MovieCarousel from "../components/MovieCarousel.tsx";
import Slider from "react-slick"; // Import react-slick for slider functionality
import "slick-carousel/slick/slick.css"; // Slick slider CSS
import "slick-carousel/slick/slick-theme.css"; // Slick slider theme

const API_KEY = "89e89989982ba3305c463d55bab4d89f";
const BASE_URL = "https://api.themoviedb.org/3";

export interface Movie {
  id: number;
  title: string;
  rating: number;
  image: string;
  year: string;
  genre: number[];
}

const Home = () => {
  const { theme } = useTheme();

  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  // Store full movie objects in the watchlist (not just IDs)
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const storedWatchlist = localStorage.getItem("watchlist");
    if (storedWatchlist) {
      setWatchlist(JSON.parse(storedWatchlist));
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

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

  // Toggle watchlist: add if not present, remove if already added
  const handleToggleWatchlist = (movie: Movie) => {
    setWatchlist((prev) => {
      const isAlreadyAdded = prev.some((m) => m.id === movie.id);
      if (isAlreadyAdded) {
        return prev.filter((m) => m.id !== movie.id);
      }
      return [...prev, movie];
    });
  };

  // Fetch Trending and Upcoming Movies
  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US`
        );
        const data = await response.json();

        // Filter to only include English-language movies
        const hollywoodMovies = data.results.filter(
          (movie: any) => movie.original_language === "en"
        );

        setTrendingMovies(
          hollywoodMovies.map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            rating: movie.vote_average,
            image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            year: movie.release_date?.split("-")[0] || "Unknown",
            genre: movie.genre_ids,
          }))
        );
      } catch (error) {
        console.error("Error fetching trending movies:", error);
      }
    };

    const fetchUpcomingMovies = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`
        );
        const data = await response.json();

        const hollywoodUpcomingMovies = data.results.filter(
          (movie: any) => movie.original_language === "en"
        );

        setUpcomingMovies(
          hollywoodUpcomingMovies.slice(0, 10).map((movie: any) => ({
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

    fetchTrendingMovies();
    fetchUpcomingMovies();
  }, []);

  // Mobile slider settings for movie sections
  const mobileSliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1.5, // Shows one full slide and a peek of the next slide
    slidesToScroll: 1,
    swipeToSlide: true,
    arrows: false, // Hide arrows on mobile for a cleaner look
  };

  // ---------------- Mobile View ----------------
  if (isMobile) {
    return (
      <div className="w-full min-h-screen bg-white text-black dark:bg-black dark:text-white">
        <Hero />
        <main className="px-4 py-8">
          {/* Mobile Category List */}
          <div className="flex flex-col gap-4 mb-12">
            {[
              {
                icon: TrendingUp,
                label: "Trending",
                path: "/movies?sort=trending",
                color: "bg-yellow-500",
              },
              {
                icon: Star,
                label: "Top Rated",
                path: "/top-rated",
                color: "bg-purple-500",
              },
              {
                icon: Clock,
                label: "Coming Soon",
                path: "/coming-soon",
                color: "bg-blue-500",
              },
              {
                icon: Award,
                label: "Awards",
                path: "/awards",
                color: "bg-red-500",
              },
            ].map((category, index) => (
              <Link
                key={index}
                to={category.path}
                className={`${category.color} p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:opacity-70 transition-opacity`}
              >
                <category.icon className="w-5 h-5" />
                <span className="font-medium">{category.label}</span>
              </Link>
            ))}
          </div>

          {/* Trending Now Section for Mobile */}
          <div
            className={`mt-6 ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-200"
            } p-4 rounded-lg`}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-yellow-500" />
                Trending Now
              </h2>
              <Link
                to="/movies?sort=trending"
                className="text-yellow-500 hover:text-yellow-400 font-bold text-xs"
              >
                View All
              </Link>
            </div>
            {/* Mobile slider for Trending Now */}
            <Slider {...mobileSliderSettings}>
              {trendingMovies.map((movie) => (
                <div key={movie.id} className="px-2 min-w-[150px]">
                  <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-lg relative">
                    <Link to={`/movie/${movie.id}`} className="block">
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                      <p className="text-xs text-center mt-2 font-bold">
                        {movie.title}
                      </p>
                    </Link>
                    {/* Note: No add/remove button is rendered in mobile view */}
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          {/* Coming Soon Section for Mobile */}
          <div
            className={`mt-6 ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-200"
            } p-4 rounded-lg`}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-500" />
                Coming Soon
              </h2>
              <Link
                to="/coming-soon"
                className="text-blue-500 hover:text-blue-400 font-bold text-xs"
              >
                View All
              </Link>
            </div>
            {/* Mobile slider for Coming Soon */}
            <Slider {...mobileSliderSettings}>
              {upcomingMovies.map((movie) => (
                <div key={movie.id} className="px-2 min-w-[150px]">
                  <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-lg relative">
                    <Link to={`/movie/${movie.id}`} className="block">
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                      <p className="text-xs text-center mt-2 font-bold">
                        {movie.title}
                      </p>
                    </Link>
                    {/* Note: No add/remove button is rendered in mobile view */}
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </main>
      </div>
    );
  }

  // ---------------- Desktop View ----------------
  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <Hero />
      <main className="container mx-auto px-4 py-8">
        {/* Desktop Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            {
              icon: TrendingUp,
              label: "Trending",
              path: "/movies?sort=trending",
              color: "bg-yellow-500",
            },
            {
              icon: Star,
              label: "Top Rated",
              path: "/top-rated",
              color: "bg-purple-500",
            },
            {
              icon: Clock,
              label: "Coming Soon",
              path: "/coming-soon",
              color: "bg-blue-500",
            },
            {
              icon: Award,
              label: "Awards",
              path: "/awards",
              color: "bg-red-500",
            },
          ].map((category, index) => (
            <Link
              key={index}
              to={category.path}
              className={`${category.color} p-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-70 transition-opacity`}
            >
              <category.icon className="w-5 h-5" />
              <span className="font-medium">{category.label}</span>
            </Link>
          ))}
        </div>

        {/* Trending Now Section for Desktop */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-yellow-500" />
              Trending Now
            </h2>
            <Link
              to="/movies?sort=trending"
              className="text-yellow-500 hover:text-yellow-400"
            >
              View All
            </Link>
          </div>
          <MovieCarousel movies={trendingMovies} />
        </section>

        {/* Coming Soon Section for Desktop */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-500" />
              Coming Soon
            </h2>
            <Link
              to="/coming-soon"
              className="text-blue-500 hover:text-blue-400"
            >
              View All
            </Link>
          </div>
          <MovieCarousel movies={upcomingMovies} />
        </section>
      </main>
    </div>
  );
};

export default Home;
