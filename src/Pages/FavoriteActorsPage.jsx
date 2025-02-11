import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link to navigate
import { useFavoriteActors } from "../context/FavoriteActorsContext.jsx";

const FavoriteActorsPage = () => {
  const { favoriteActors, removeFavoriteActor } = useFavoriteActors();
  const [isMobile, setIsMobile] = useState(false);

  // Set isMobile state based on window width (<768px)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial state
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ---------------- Mobile View ----------------
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Favorite Actors</h1>

        {favoriteActors.length === 0 ? (
          <p className="text-gray-500 text-center">
            No favorite actors added yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {favoriteActors.map((actor) => {
              const actorImage = actor.profile_path
                ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                : "https://via.placeholder.com/300";

              return (
                <div
                  key={actor.id}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4"
                >
                  {/* Actor Image with Link */}
                  <Link to={`/actor/${actor.id}`}>
                    <img
                      src={actorImage}
                      alt={actor.name}
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                  </Link>

                  {/* Actor Name with Link */}
                  <Link to={`/actor/${actor.id}`}>
                    <h2 className="text-lg font-semibold text-center">
                      {actor.name}
                    </h2>
                  </Link>

                  {/* Biography (if available) */}
                  <p className="text-gray-600 dark:text-gray-300 text-xs mt-1 text-center">
                    {actor.biography
                      ? actor.biography.slice(0, 100) + "..."
                      : "No biography available."}
                  </p>

                  {/* Movies Section */}
                  <div className="mt-1">
                    <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-400 text-center">
                      Famous Movies:
                    </h3>
                    <ul className="text-gray-600 dark:text-gray-300 text-xs list-disc list-inside">
                      {actor.known_for && actor.known_for.length > 0 ? (
                        actor.known_for.map((movie, index) => (
                          <li key={index}>{movie.title || movie.name}</li>
                        ))
                      ) : (
                        <li>No popular movies listed</li>
                      )}
                    </ul>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFavoriteActor(actor.id)}
                    className="mt-2 text-red-500 hover:text-red-700 block mx-auto text-xs"
                  >
                    Remove from Favorites
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ---------------- Desktop View ----------------
  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Favorite Actors</h1>

      {favoriteActors.length === 0 ? (
        <p className="text-gray-500 text-center">
          No favorite actors added yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoriteActors.map((actor) => {
            const actorImage = actor.profile_path
              ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
              : "https://via.placeholder.com/300";

            return (
              <div
                key={actor.id}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4"
              >
                {/* Actor Image with Link */}
                <Link to={`/actor/${actor.id}`}>
                  <img
                    src={actorImage}
                    alt={actor.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                </Link>

                {/* Actor Name with Link */}
                <Link to={`/actor/${actor.id}`}>
                  <h2 className="text-xl font-semibold text-center">
                    {actor.name}
                  </h2>
                </Link>

                {/* Biography (if available) */}
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 text-center">
                  {actor.biography
                    ? actor.biography.slice(0, 100) + "..."
                    : "No biography available."}
                </p>

                {/* Movies Section */}
                <div className="mt-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-400 text-center">
                    Famous Movies:
                  </h3>
                  <ul className="text-gray-600 dark:text-gray-300 text-sm list-disc list-inside">
                    {actor.known_for && actor.known_for.length > 0 ? (
                      actor.known_for.map((movie, index) => (
                        <li key={index}>{movie.title || movie.name}</li>
                      ))
                    ) : (
                      <li>No popular movies listed</li>
                    )}
                  </ul>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFavoriteActor(actor.id)}
                  className="mt-3 text-red-500 hover:text-red-700 block mx-auto"
                >
                  Remove from Favorites
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoriteActorsPage;
