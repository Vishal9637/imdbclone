import React, { useEffect, useState } from "react";
// Import Firebase Auth functions
import { getAuth, onAuthStateChanged } from "firebase/auth";
// Import Firestore functions
import { getFirestore, doc, getDoc } from "firebase/firestore";

const TMDB_API_KEY = "YOUR_TMDB_API_KEY_HERE"; // Replace with your actual TMDB API key

const Recommendations = () => {
  // State to hold the authenticated user.
  const [firebaseUser, setFirebaseUser] = useState(null);
  // Local states for recommendation data.
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState(null);
  // State to manage the authentication loading state.
  const [authLoading, setAuthLoading] = useState(true);

  // Listen for Firebase authentication state changes.
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Only fetch recommendations if a user is logged in.
  useEffect(() => {
    if (!firebaseUser) {
      return; // Exit if no authenticated user.
    }

    const fetchWatchlistAndRecommendations = async () => {
      setError(null);
      setLoadingRecommendations(true);

      try {
        const db = getFirestore();
        // Assume the watchlist is stored in a Firestore collection called "watchlists"
        // with a document whose ID is the user's UID.
        const watchlistDocRef = doc(db, "watchlists", firebaseUser.uid);
        const watchlistDoc = await getDoc(watchlistDocRef);

        let watchlistData = [];
        if (watchlistDoc.exists()) {
          // The document is expected to have a "movies" field (an array of movie objects).
          watchlistData = watchlistDoc.data().movies || [];
        } else {
          console.log("No watchlist found for user:", firebaseUser.uid);
        }

        // Gather unique genre IDs from movies in the watchlist.
        const genres = new Set();

        // Fetch movie details for each movie in the watchlist in parallel.
        const movieDetailsPromises = watchlistData.map((movie) =>
          fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}`
          ).then((res) => res.json())
        );
        const movieDetails = await Promise.all(movieDetailsPromises);

        // Add each movie's genre IDs to the set.
        movieDetails.forEach((detail) => {
          if (detail.genres) {
            detail.genres.forEach((g) => genres.add(g.id));
          }
        });

        // If there are any genres, fetch recommendations based on them.
        if (genres.size > 0) {
          const genreList = Array.from(genres).join(",");
          const response = await fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreList}`
          );
          const data = await response.json();
          // Limit to the top 10 recommendations.
          setRecommendedMovies(data.results.slice(0, 10));
        } else {
          // If there are no genres (or the watchlist is empty), clear recommendations.
          setRecommendedMovies([]);
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Failed to load recommendations.");
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchWatchlistAndRecommendations();
  }, [firebaseUser]);

  // While waiting for authentication to complete, show a loading state.
  if (authLoading) {
    return <div className="p-4">Checking authentication...</div>;
  }

  // If the user is not logged in, display a prompt.
  if (!firebaseUser) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">Recommended for You</h2>
        <p>Please log in or sign up to view recommendations.</p>
      </div>
    );
  }

  // Render a loading state or an error message if needed.
  if (loadingRecommendations) return <div className="p-4">Loading recommendations...</div>;
  if (error) return <div className="p-4">{error}</div>;

  // Render the list of recommended movies or a message if there are none.
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Recommended for You</h2>
      {recommendedMovies.length > 0 ? (
        <ul>
          {recommendedMovies.map((movie) => (
            <li key={movie.id} className="mb-2">
              {movie.title} ({movie.release_date})
            </li>
          ))}
        </ul>
      ) : (
        <p>
          {watchlistDataIsEmpty(firebaseUser.uid)
            ? "Add some movies to your watchlist to get recommendations!"
            : "No recommendations available at the moment."}
        </p>
      )}
    </div>
  );
};

/**
 * Optionally, you can add a helper function to check if a user's watchlist is empty.
 * This might require additional logic or a separate Firestore query.
 * For now, this function returns false by default.
 */
const watchlistDataIsEmpty = (userId) => {
  // Implement your check if necessary.
  return false;
};

export default Recommendations;
