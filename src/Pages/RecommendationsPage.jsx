import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.tsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// Import Firestore functions
import { getFirestore, doc, getDoc } from "firebase/firestore";

const TMDB_API_KEY = "9285d1e9c88254ee11ff102b45b09e32";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const RecommendationsPage = () => {
  const { theme } = useTheme();
  const [user, setUser] = useState(null); // Firebase user object (null if not logged in)
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check Firebase authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Firebase auth state changed:", currentUser);
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Detect mobile view (window width < 768px)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    // Set initial value
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch recommendations only if the user is logged in
  useEffect(() => {
    if (!user) {
      console.log("User is not logged in, skipping recommendations fetch.");
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        // Retrieve watchlist from Firestore instead of localStorage
        const db = getFirestore();
        const watchlistDocRef = doc(db, "watchlists", user.uid);
        const watchlistDoc = await getDoc(watchlistDocRef);
        let watchlist = [];
        if (watchlistDoc.exists()) {
          // Assumes the document has a "movies" field containing an array
          watchlist = watchlistDoc.data().movies || [];
        } else {
          console.log("No watchlist found in Firestore for user:", user.uid);
        }
        console.log("Fetched watchlist:", watchlist);
        if (watchlist.length === 0) {
          setLoading(false);
          return;
        }

        // Create an array of movie IDs from the watchlist
        const movieIds = watchlist.map((movie) => movie.id);
        const requests = movieIds.map((id) =>
          axios.get(
            `${TMDB_BASE_URL}/movie/${id}/recommendations?api_key=${TMDB_API_KEY}&language=en-US`
          )
        );

        // Wait for all recommendation requests to complete
        const responses = await Promise.all(requests);

        // Flatten all responses into one array of recommended movies
        const allRecommendedMovies = responses.flatMap((res) => res.data.results);
        console.log("All recommended movies:", allRecommendedMovies);

        // Deduplicate movies by their unique ID
        const uniqueMovies = Array.from(
          new Map(allRecommendedMovies.map((movie) => [movie.id, movie])).values()
        );

        setMovies(uniqueMovies);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  // If the user is not logged in, show a login prompt and do not display recommendations.
  if (!user) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-4 ${
          theme === "dark" ? "bg-black text-white" : "bg-gray-100 text-black"
        }`}
      >
        <h1 className="text-3xl font-bold mb-8">Your Personalized Recommendations</h1>
        <div className="text-center text-gray-500">
          Please log in or sign up to view recommendations.
        </div>
      </div>
    );
  }

  // Main content for both mobile and desktop views
  const content = (
    <>
      <h1 className="text-3xl font-bold mb-8">Your Personalized Recommendations</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="w-full text-center">Loading...</div>
        ) : movies.length > 0 ? (
          movies.map((movie) => (
            <div
              key={movie.id}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              <Link to={`/movie/${movie.id}`}>
                <div className="relative aspect-[2/3]">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-md flex items-center gap-1">
                    <span className="text-yellow-500 font-medium">
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>
              </Link>
              <div className="p-4 text-center">
                <h2 className="text-lg font-semibold">{movie.title}</h2>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No recommendations available.</div>
        )}
      </div>
    </>
  );

  // Render mobile view
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

  // Render desktop view
  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white container mx-auto p-4">
      {content}
    </div>
  );
};

export default RecommendationsPage;
