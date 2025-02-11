import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext.tsx";
import { useFavoriteActors } from "../context/FavoriteActorsContext.jsx";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link } from "react-router-dom";

const TMDB_API_KEY = "9285d1e9c88254ee11ff102b45b09e32"; // Replace with your TMDb API key
const BASE_URL = "https://api.themoviedb.org/3";

const ActorProfiles = () => {
  const { theme } = useTheme();
  const { favoriteActors, addFavoriteActor, removeFavoriteActor } = useFavoriteActors();
  const [actors, setActors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices (window width < 768px)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial state
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to fetch actors from TMDB API
  const fetchActors = async (query) => {
    setLoading(true);
    setError(null);

    const endpoint = query
      ? `${BASE_URL}/search/person?api_key=${TMDB_API_KEY}&language=en-US&query=${query}`
      : `${BASE_URL}/person/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to fetch actors");

      const data = await response.json();
      if (!data.results) throw new Error("Invalid API response");

      setActors(data.results);
    } catch (error) {
      console.error("Error fetching actors:", error);
      setError("Could not load actor data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch popular actors on initial render
  useEffect(() => {
    fetchActors("");
  }, []);

  // Fetch actors as user types in real-time
  useEffect(() => {
    fetchActors(searchTerm);
  }, [searchTerm]);

  // ---------------- Mobile View ----------------
  if (isMobile) {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark" ? "bg-black text-white" : "bg-white text-black"
        } p-4`}
      >
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-2xl font-bold mb-4">Actor Profiles</h1>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search for an actor..."
            className="border border-gray-300 dark:border-gray-600 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white w-full mb-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Favorite Actors Button */}
          <Link
            to="/favorite-actors"
            className="px-4 py-2 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-700 text-white text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 hover:from-blue-600 hover:to-blue-800 mb-4"
          >
            ⭐ View Favorite Actors
          </Link>
        </div>

        {/* Loading and Error States */}
        {loading && <p className="text-blue-500 text-center text-lg">Loading...</p>}
        {error && <p className="text-red-500 text-center text-lg">Error: {error}</p>}

        {/* Actor Grid (1 column for mobile) */}
        <div className="grid grid-cols-1 gap-4">
          {!loading &&
            actors.map((actor) => {
              const isFavorite = favoriteActors.some((favActor) => favActor.id === actor.id);
              const actorImage = actor.profile_path
                ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                : "https://via.placeholder.com/150";
              const knownForMovies =
                actor.known_for && actor.known_for.length > 0
                  ? actor.known_for.map((movie) => movie.title || movie.name).join(", ")
                  : "No popular movies listed";

              return (
                <Link
                  to={`/actor/${actor.id}`}
                  key={actor.id}
                  className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 p-4"
                >
                  <div className="relative">
                    <img
                      src={actorImage}
                      alt={actor.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h2 className="text-xl font-semibold text-black">{actor.name}</h2>
                    <p className="text-gray-600 text-sm mt-2">{knownForMovies}</p>
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigation when clicking the heart icon
                        isFavorite ? removeFavoriteActor(actor.id) : addFavoriteActor(actor);
                      }}
                      className="mt-2 text-red-500 text-2xl"
                    >
                      {isFavorite ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    );
  }

  // ---------------- Desktop View ----------------
  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      } p-6`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Actor Profiles</h1>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search for an actor..."
          className="border border-gray-300 dark:border-gray-600 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white w-full sm:w-96 mt-4 sm:mt-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Link
          to="/favorite-actors"
          className="px-4 py-2 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-700 text-white text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 hover:from-blue-600 hover:to-blue-800"
        >
          ⭐ View Favorite Actors
        </Link>
      </div>

      {/* Loading and Error States */}
      {loading && <p className="text-blue-500 text-center text-lg">Loading...</p>}
      {error && <p className="text-red-500 text-center text-lg">Error: {error}</p>}

      {/* Actor Grid (responsive columns for desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {!loading &&
          actors.map((actor) => {
            const isFavorite = favoriteActors.some((favActor) => favActor.id === actor.id);
            const actorImage = actor.profile_path
              ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
              : "https://via.placeholder.com/150";
            const knownForMovies =
              actor.known_for && actor.known_for.length > 0
                ? actor.known_for.map((movie) => movie.title || movie.name).join(", ")
                : "No popular movies listed";

            return (
              <Link
                to={`/actor/${actor.id}`}
                key={actor.id}
                className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 p-4"
              >
                <div className="relative">
                  <img
                    src={actorImage}
                    alt={actor.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="p-4 text-center">
                  <h2 className="text-xl font-semibold text-black">{actor.name}</h2>
                  <p className="text-gray-600 text-sm mt-2">{knownForMovies}</p>
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      isFavorite ? removeFavoriteActor(actor.id) : addFavoriteActor(actor);
                    }}
                    className="mt-2 text-red-500 text-2xl"
                  >
                    {isFavorite ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
};

export default ActorProfiles;
