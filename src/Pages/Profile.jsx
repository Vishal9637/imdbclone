import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext.tsx";
import { useWatchlist } from "../context/WatchlistContext.tsx";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // For authentication
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useUserProfile from "../hooks/useUserProfile";

const TMDB_API_KEY = "9285d1e9c88254ee11ff102b45b09e32";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const defaultProfilePicture =
  "https://i.ibb.co/Xhzsry7/ff5f78476f0edf5b1bf7840f84342ebd.jpg";

const Profile = () => {
  const { theme } = useTheme();
  const { watchlist } = useWatchlist();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user); // Fetch logged-in user from Redux
  const { profileData, updateProfile, loading } = useUserProfile();

  // State initialization (username and profile picture)
  const [newUsername, setNewUsername] = useState(() => {
    return localStorage.getItem("username") || "User";
  });
  const [profilePicture, setProfilePicture] = useState(() => {
    return localStorage.getItem("profilePicture") || defaultProfilePicture;
  });
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [watchlistWithPosters, setWatchlistWithPosters] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [ratedMovies, setRatedMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreMovies, setGenreMovies] = useState([]);

  // State to detect mobile devices
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial state
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // If profileData from Firestore is available, update state and localStorage
    if (profileData) {
      const usernameFromProfile = profileData.username || "User";
      const profilePicFromProfile = profileData.profilePicture || defaultProfilePicture;
      setNewUsername(usernameFromProfile);
      setProfilePicture(profilePicFromProfile);
      localStorage.setItem("username", usernameFromProfile);
      localStorage.setItem("profilePicture", profilePicFromProfile);
    }

    // Fetch movies from the watchlist and get recommendations if available
    if (watchlist.length > 0) {
      fetchWatchlistMovies();
      fetchRecommendedMovies(watchlist.map((movie) => movie.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData, watchlist]);

  const fetchMoviesByGenre = async (genreId) => {
    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&language=en-US`
      );
      const data = await res.json();
      setGenreMovies(data.results || []);
    } catch (error) {
      console.error("Error fetching movies by genre:", error);
    }
  };

  const fetchWatchlistMovies = async () => {
    try {
      const updatedWatchlist = await Promise.all(
        watchlist.map(async (movie) => {
          const res = await fetch(
            `${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=en-US`
          );
          const data = await res.json();
          return { id: movie.id, title: data.title, poster_path: data.poster_path };
        })
      );
      setWatchlistWithPosters(updatedWatchlist);
    } catch (error) {
      console.error("Error fetching watchlist movies:", error);
    }
  };

  const fetchRecommendedMovies = async (movieIds) => {
    try {
      const recommendations = await Promise.all(
        movieIds.map(async (movieId) => {
          const res = await fetch(
            `${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}&language=en-US`
          );
          const data = await res.json();
          return data.results || [];
        })
      );
      setRecommendedMovies(recommendations.flat().slice(0, 10));
    } catch (error) {
      console.error("Error fetching recommended movies:", error);
    }
  };

  const handleSave = async () => {
    if (!newUsername.trim()) {
      alert("Username cannot be empty!");
      return;
    }
    try {
      // Update the profile data in Firestore
      await updateProfile({
        username: newUsername,
        profilePicture: profilePicture,
      });
      // Store updated values in localStorage for persistence
      localStorage.setItem("username", newUsername);
      localStorage.setItem("profilePicture", profilePicture);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4, slidesToScroll: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    ],
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please log in to view your profile.</p>;

  if (isMobile) {
    // ---------------- Mobile View ----------------
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
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-sm font-bold text-gray-500">
              {user?.email || "No email available"}
            </p>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col items-center mb-4">
            <img
              src={profilePicture}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-500"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setProfilePicture(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="mt-2 text-xs font-bold"
            />
          </div>

          {/* Username Section */}
          <div className="w-full flex flex-col items-center mb-4">
            <label className="text-base font-bold">Username</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="border border-black rounded p-2 text-center text-black w-4/5 mt-2 font-bold"
            />
            <button
              onClick={handleSave}
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-bold"
            >
              Save Changes
            </button>
          </div>

          {/* Movie Preferences Section */}
          <div
            className={`mt-6 ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-200"
            } p-4 rounded-lg`}
          >
            <h2
              className={`${
                theme === "dark" ? "text-yellow-400" : "text-black"
              } text-xl font-bold`}
            >
              Movie Preferences
            </h2>
            <p className="mt-2 text-center text-xs">
              Select a genre to see movies.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {[
                { id: 28, name: "Action" },
                { id: 35, name: "Comedy" },
                { id: 18, name: "Drama" },
                { id: 27, name: "Horror" },
                { id: 878, name: "Sci-Fi" },
                { id: 10749, name: "Romance" },
              ].map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => {
                    setSelectedGenre(genre.name);
                    fetchMoviesByGenre(genre.id);
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 font-bold text-xs"
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {/* Display Genre Movies */}
          {selectedGenre && (
            <div
              className={`mt-6 ${
                theme === "dark" ? "bg-gray-800" : "bg-gray-200"
              } p-4 rounded-lg`}
            >
              <h2
                className={`${
                  theme === "dark" ? "text-yellow-400" : "text-black"
                } text-xl font-bold`}
              >
                Movies in {selectedGenre}
              </h2>
              <Slider {...sliderSettings}>
                {genreMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="p-2 cursor-pointer"
                    onClick={() => navigate(`/movie/${movie.id}`)}
                  >
                    <img
                      src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                    <p
                      className={`text-xs text-center mt-2 ${
                        theme === "dark" ? "text-yellow-400" : "text-black"
                      }`}
                    >
                      {movie.title}
                    </p>
                  </div>
                ))}
              </Slider>
            </div>
          )}

          {/* Movie Sections */}
          {[
            { title: "My Watchlist", movies: watchlistWithPosters, route: "/watchlist" },
            { title: "Recommended Movies", movies: recommendedMovies, route: "/recommendations" },
            { title: "Reviewd Movies", movies: relatedMovies, route: "/review" },
            { title: "Rated Movies", movies: ratedMovies, route: "/rated" },
          ].map(({ title, movies, route }) => (
            <div
              key={title}
              className={`mt-6 ${
                theme === "dark" ? "bg-gray-800" : "bg-gray-200"
              } p-4 rounded-lg`}
            >
              <div className="flex justify-between items-center mb-2">
                <h2
                  className={`${
                    theme === "dark" ? "text-yellow-400" : "text-black"
                  } text-xl font-bold`}
                >
                  {title}
                </h2>
                <button
                  onClick={() => navigate(route)}
                  className="text-blue-500 hover:underline font-bold text-xs"
                >
                  View All
                </button>
              </div>
              <Slider {...sliderSettings}>
                {movies.map((movie) => (
                  <div
                    key={movie.id}
                    className="p-2 cursor-pointer"
                    onClick={() => navigate(`/movie/${movie.id}`)}
                  >
                    <img
                      src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                    <p
                      className={`text-xs text-center mt-2 ${
                        theme === "dark" ? "text-yellow-400" : "text-black"
                      }`}
                    >
                      {movie.title}
                    </p>
                  </div>
                ))}
              </Slider>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------- Desktop View ----------------
  return (
    <div
      className={`min-h-screen flex flex-col items-center p-6 ${
        theme === "dark" ? "bg-black text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div
        className={`max-w-5xl w-full shadow-lg rounded-lg p-8 ${
          theme === "dark" ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold">My Profile</h1>
          <p className={`${theme === "dark" ? "text-yellow-400" : "text-gray-500"} text-center font-bold`}>
            {user?.email || "No email available"}
          </p>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={profilePicture}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-blue-500"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onloadend = () => {
                  setProfilePicture(reader.result);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="mt-3 text-sm font-bold"
          />
        </div>

        {/* Username Section */}
        <div className="w-full flex flex-col items-center">
          <label className="text-lg font-bold">Username</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="border border-black rounded p-2 text-center text-black w-1/2 mt-2 font-bold"
          />
          <button
            onClick={handleSave}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-bold"
          >
            Save Changes
          </button>
        </div>

        {/* Movie Preferences Section */}
        <div className={`mt-10 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"} p-6 rounded-lg`}>
          <h2 className={`${theme === "dark" ? "text-yellow-400" : "text-black"} text-2xl font-bold`}>
            Movie Preferences
          </h2>
          <p className="mt-2 text-center text-sm">Select a genre to see movies.</p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {[
              { id: 28, name: "Action" },
              { id: 35, name: "Comedy" },
              { id: 18, name: "Drama" },
              { id: 27, name: "Horror" },
              { id: 878, name: "Sci-Fi" },
              { id: 10749, name: "Romance" },
            ].map((genre) => (
              <button
                key={genre.id}
                onClick={() => {
                  setSelectedGenre(genre.name);
                  fetchMoviesByGenre(genre.id);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-bold"
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Display Genre Movies */}
        {selectedGenre && (
          <div className={`mt-10 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"} p-6 rounded-lg`}>
            <h2 className={`${theme === "dark" ? "text-yellow-400" : "text-black"} text-2xl font-bold`}>
              Movies in {selectedGenre}
            </h2>
            <Slider {...sliderSettings}>
              {genreMovies.map((movie) => (
                <div key={movie.id} className="p-2 cursor-pointer" onClick={() => navigate(`/movie/${movie.id}`)}>
                  <img
                    src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                  <p className={`text-sm text-center mt-2 ${theme === "dark" ? "text-yellow-400" : "text-black"}`}>
                    {movie.title}
                  </p>
                </div>
              ))}
            </Slider>
          </div>
        )}

        {/* Movie Sections with Gray Background */}
        {[
          { title: "My Watchlist", movies: watchlistWithPosters, route: "/watchlist" },
          { title: "Recommended Movies", movies: recommendedMovies, route: "/recommendations" },
          { title: "Reviewd Movies", movies: relatedMovies, route: "/review" },
          { title: "Rated Movies", movies: ratedMovies, route: "/rated" },
        ].map(({ title, movies, route }) => (
          <div
            key={title}
            className={`mt-10 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"} p-6 rounded-lg`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={`${theme === "dark" ? "text-yellow-400" : "text-black"} text-2xl font-bold`}>
                {title}
              </h2>
              <button
                onClick={() => navigate(route)}
                className="text-blue-500 hover:underline font-bold"
              >
                View All
              </button>
            </div>
            <Slider {...sliderSettings}>
              {movies.map((movie) => (
                <div key={movie.id} className="p-2 cursor-pointer" onClick={() => navigate(`/movie/${movie.id}`)}>
                  <img
                    src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                  <p className={`text-sm text-center mt-2 ${theme === "dark" ? "text-yellow-400" : "text-black"}`}>
                    {movie.title}
                  </p>
                </div>
              ))}
            </Slider>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
