import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Award,
  BarChart3,
  Calendar,
  Clock,
  Star,
  Play,
  Heart,
  Share2,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useWatchlist } from "../context/WatchlistContext.tsx";
import { useTheme } from "../context/ThemeContext.tsx";

const MovieDetails = () => {
  const { theme } = useTheme();
  const { id } = useParams();

  interface Movie {
    id: number;
    title: string;
    vote_average: number;
    runtime: number;
    release_date: string;
    poster_path: string;
    overview: string;
    genres: { name: string }[];
    videos: { results: { key: string; type: string }[] };
    credits: {
      cast: {
        id: number;
        name: string;
        character: string;
        profile_path: string;
      }[];
      crew: { id: number; name: string; job: string }[];
    };
    production_companies: { name: string }[];
    revenue: number;
    original_language: string;
    metacritic: string;
    awards: string;
    imdb_id: string;
  }

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTrailerVisible, setIsTrailerVisible] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  // Detect mobile view
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    // Set initial value
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const apiKey = "9285d1e9c88254ee11ff102b45b09e32";
  const omdbApiKey = "326dcdae";

  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const tmdbResponse = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US&append_to_response=credits,videos`
        );

        const omdbResponse = await axios.get(
          `https://www.omdbapi.com/?i=${tmdbResponse.data.imdb_id}&apikey=${omdbApiKey}`
        );

        setMovie({
          ...tmdbResponse.data,
          metacritic: omdbResponse.data.Metascore || "N/A",
          awards: omdbResponse.data.Awards || "N/A",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const isInWatchlist = (movie: Movie) =>
    watchlist.some((item) => item.id === movie.id);

  const handleWatchlistToggle = (movie: Movie) => {
    if (isInWatchlist(movie)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  const handleWatchTrailer = () => {
    if (movie?.videos?.results?.length) {
      const trailer = movie.videos.results.find(
        (video) => video.type === "Trailer"
      );
      if (trailer) {
        setTrailerKey(trailer.key);
        setIsTrailerVisible(true);
      }
    }
  };

  const handleCloseTrailer = () => {
    setIsTrailerVisible(false);
    setTrailerKey(null);
  };

  if (loading) return <div>Loading...</div>;

  // Responsive trailer embed container for both mobile and desktop.
  const TrailerEmbed = () => (
    <div className="mt-8 relative" style={{ paddingBottom: "56.25%", height: 0 }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${trailerKey}`}
        title="Trailer"
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <button
        onClick={handleCloseTrailer}
        className="absolute top-4 right-4 text-white p-2"
      >
        <X className="w-8 h-8" />
      </button>
    </div>
  );

  // The main content used in mobile view
  const content = (
    <>
      {/* Hero Section */}
      {isMobile ? (
        // Mobile Hero Section
        <div className="relative h-[300px] mb-8 rounded-xl overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/original/${movie?.poster_path})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>
          <div className="relative flex flex-col items-center justify-end h-full pb-4 px-4">
            <div className="w-32 h-48 rounded-lg shadow-xl overflow-hidden mb-4">
              <img
                src={`https://image.tmdb.org/t/p/w500/${movie?.poster_path}`}
                alt={movie?.title}
                className="object-cover w-full h-full"
              />
            </div>
            <h1 className="text-2xl font-bold text-white text-center">
              {movie?.title}
            </h1>
            <div className="flex flex-wrap justify-center mt-2 gap-2">
              {movie?.genres.map((g) => (
                <span
                  key={g.name}
                  className="px-2 py-1 bg-yellow-600 text-xs font-medium rounded-full"
                >
                  {g.name}
                </span>
              ))}
            </div>
            {/* Trailer, Watchlist & Share Buttons */}
            <div className="mt-4 w-full flex flex-col gap-2">
              <button
                onClick={handleWatchTrailer}
                className="w-full bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors"
              >
                <Play className="w-5 h-5" />
                Watch Trailer
              </button>
              <button
                onClick={() => movie && handleWatchlistToggle(movie)}
                className={`w-full ${
                  movie && isInWatchlist(movie)
                    ? "bg-red-500"
                    : "bg-gray-800/80"
                } text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors`}
              >
                <Heart className="w-5 h-5" />
                {movie && isInWatchlist(movie)
                  ? "Remove from Watchlist"
                  : "Add to Watchlist"}
              </button>
              <button className="w-full bg-gray-800/80 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Desktop Hero Section
        <div className="relative h-[400px] mb-8 rounded-xl overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/original/${movie?.poster_path})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80" />
          </div>
          <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
            <div className="grid md:grid-cols-3 gap-8 items-end">
              <div className="hidden md:block">
                <img
                  src={`https://image.tmdb.org/t/p/w500/${movie?.poster_path}`}
                  alt={movie?.title}
                  className="rounded-lg shadow-xl aspect-[2/3] object-cover"
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-yellow-500 font-semibold">
                      {movie?.vote_average} Rating
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">{movie?.runtime} mins</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">{movie?.release_date}</span>
                  </div>
                </div>
                <h1 className="text-4xl font-bold mb-4 text-yellow-500 dark:text-white">
                  {movie?.title}
                </h1>
                <div className="flex flex-wrap gap-4 mb-6">
                  {movie?.genres.map((g) => (
                    <span
                      key={g.name}
                      className="px-3 py-1 bg-yellow-800/80 backdrop-blur-sm rounded-full text-sm"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleWatchTrailer}
                    className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-yellow-400 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Watch Trailer
                  </button>
                  <button
                    onClick={() => movie && handleWatchlistToggle(movie)}
                    className={`${
                      movie && isInWatchlist(movie)
                        ? "bg-red-500"
                        : "bg-gray-800/80"
                    } backdrop-blur-sm text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2`}
                  >
                    <Heart className="w-5 h-5" />
                    {movie && isInWatchlist(movie)
                      ? "Remove from Watchlist"
                      : "Add to Watchlist"}
                  </button>
                  <button className="bg-gray-800/80 backdrop-blur-sm text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="bg-gray-800/80 backdrop-blur-sm text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Details Section */}
      <main className="container mx-auto px-4 py-12 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg transition-transform duration-300">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <section className="mb-12">
              <h2 className="text-lg font-semibold mt-3 text-black dark:text-white">
                Overview
              </h2>
              <p className="text-lg font-semibold mt-3 text-black dark:text-white">
                {movie?.overview}
              </p>

              {/* Trailer Video Section */}
              {isTrailerVisible && trailerKey && <TrailerEmbed />}
            </section>

            <section className="mb-12">
              <h2 className="text-lg font-semibold mt-3 text-black dark:text-white">
                Awards & Recognition
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="text-lg font-semibold mt-3 text-black dark:text-white flex items-center gap-1">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span>Awards: {movie?.awards || "N/A"}</span>
                </div>
                <div className="text-lg font-semibold mt-3 text-black dark:text-white flex items-center gap-1">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  <span>
                    Metacritic:{" "}
                    {movie?.metacritic && movie.metacritic !== "N/A"
                      ? movie.metacritic
                      : "N/A"}
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mt-3 text-black dark:text-white">
                Top Cast
              </h2>
              {isMobile ? (
                // Mobile: Vertical list for cast
                <div className="space-y-4 py-4">
                  {movie?.credits.cast.map((actor) => (
                    <Link
                      key={actor.id}
                      to={`/actor/${actor.id}`}
                      className="flex items-center bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 hover:bg-gray-700/50 transition-colors"
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w500/${actor.profile_path}`}
                        alt={actor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <h3 className="text-sm font-semibold text-black dark:text-white">
                          {actor.name}
                        </h3>
                        <p className="text-xs text-gray-300">
                          {actor.character}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                // Desktop: Grid layout for cast
                <div className="grid grid-cols-2 gap-6">
                  {movie?.credits.cast.map((actor) => (
                    <Link
                      key={actor.id}
                      to={`/actor/${actor.id}`}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 hover:bg-gray-700/50 transition-colors flex gap-4"
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w500/${actor.profile_path}`}
                        alt={actor.name}
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold mt-3 text-black dark:text-white">
                          {actor.name}
                        </h3>
                        <p className="text-lg font-semibold mt-3 text-black dark:text-white">
                          {actor.character}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div>
            <div className="sticky top-24 space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 hover:bg-gray-700/50 transition-colors flex gap-4">
                <div>
                  <h3 className="text-lg font-semibold mt-3 text-black dark:text-white">
                    Movie Info
                  </h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-lg font-semibold mt-3 text-black dark:text-white">
                        Director
                      </dt>
                      <dd>
                        {
                          movie?.credits.crew.find(
                            (crew) => crew.job === "Director"
                          )?.name
                        }
                      </dd>
                    </div>
                    <div>
                      <dt className="text-lg font-semibold mt-3 text-black dark:text-white">
                        Production Company
                      </dt>
                      <dd>
                        {movie?.production_companies[0]?.name || "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-lg font-semibold mt-3 text-black dark:text-white">
                        Revenue
                      </dt>
                      <dd>
                        $
                        {movie?.revenue
                          ? movie.revenue.toLocaleString()
                          : "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-lg font-semibold mt-3 text-black dark:text-white">
                        Language
                      </dt>
                      <dd>{movie?.original_language.toUpperCase()}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );

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

  // Desktop view rendering (alternative layout)
  return (
    <div>
      <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original/${movie?.poster_path})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80" />
        </div>

        <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
          <div className="grid md:grid-cols-3 gap-8 items-end">
            <div className="hidden md:block">
              <img
                src={`https://image.tmdb.org/t/p/w500/${movie?.poster_path}`}
                alt={movie?.title}
                className="rounded-lg shadow-xl aspect-[2/3] object-cover"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-yellow-500 font-semibold">
                    {movie?.vote_average} Rating
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">{movie?.runtime} mins</span>
                </div>
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">{movie?.release_date}</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold mb-4 text-yellow-500 dark:text-white">
                {movie?.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie?.genres.map((g) => (
                  <span
                    key={g.name}
                    className="px-3 py-1 bg-yellow-800/80 backdrop-blur-sm rounded-full text-sm"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleWatchTrailer}
                  className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-yellow-400 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Watch Trailer
                </button>
                <button
                  onClick={() => movie && handleWatchlistToggle(movie)}
                  className={`${
                    movie && isInWatchlist(movie)
                      ? "bg-red-500"
                      : "bg-gray-800/80"
                  } backdrop-blur-sm text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2`}
                >
                  <Heart className="w-5 h-5" />
                  {movie && isInWatchlist(movie)
                    ? "Remove from Watchlist"
                    : "Add to Watchlist"}
                </button>
                <button className="bg-gray-800/80 backdrop-blur-sm text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="bg-gray-800/80 backdrop-blur-sm text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-12 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg transition-transform duration-300">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <section className="mb-12">
              <h2 className="text-lg font-semibold mt-3 text-black dark:text-white">
                Overview
              </h2>
              <p className="text-lg font-semibold mt-3 text-black dark:text-white">
                {movie?.overview}
              </p>

              {isTrailerVisible && trailerKey && <TrailerEmbed />}
            </section>

            <section className="mb-12">
              <h2 className="text-lg font-semibold mt-3 text-black dark:text-white">
                Awards & Recognition
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="text-lg font-semibold mt-3 text-black dark:text-white flex items-center gap-1">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span>Awards: {movie?.awards || "N/A"}</span>
                </div>
                <div className="text-lg font-semibold mt-3 text-black dark:text-white flex items-center gap-1">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  <span>
                    Metacritic: {movie?.metacritic ? movie.metacritic : "N/A"}
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mt-3 text-black dark:text-white">
                Top Cast
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {movie?.credits.cast.map((actor) => (
                  <Link
                    key={actor.id}
                    to={`/actor/${actor.id}`}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 hover:bg-gray-700/50 transition-colors flex gap-4"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${actor.profile_path}`}
                      alt={actor.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold mt-3 text-black dark:text-white">
                        {actor.name}
                      </h3>
                      <p className="text-lg font-semibold mt-3 text-black dark:text-white">
                        {actor.character}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div>
            <div className="sticky top-24 space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 hover:bg-gray-700/50 transition-colors flex gap-4">
                <h3 className="text-lg font-semibold mt-3 text-black dark:text-white">
                  Movie Info
                </h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-lg font-semibold mt-3 text-black dark:text-white">
                      Director
                    </dt>
                    <dd>
                      {
                        movie?.credits.crew.find(
                          (crew) => crew.job === "Director"
                        )?.name
                      }
                    </dd>
                  </div>
                  <div>
                    <dt className="text-lg font-semibold mt-3 text-black dark:text-white">
                      Production Company
                    </dt>
                    <dd>
                      {movie?.production_companies[0]?.name || "N/A"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-lg font-semibold mt-3 text-black dark:text-white">
                      Revenue
                    </dt>
                    <dd>
                      $
                      {movie?.revenue
                        ? movie.revenue.toLocaleString()
                        : "N/A"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-lg font-semibold mt-3 text-black dark:text-white">
                      Language
                    </dt>
                    <dd>{movie?.original_language.toUpperCase()}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MovieDetails;
