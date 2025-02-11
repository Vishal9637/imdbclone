import { useState, useEffect } from "react";
import { fetchMovies, fetchTVShows, fetchActors } from "../api/tmdb.jsx";
import { X } from "lucide-react"; // Importing an icon for the cancel button
import { useNavigate } from "react-router-dom"; // Importing useNavigate

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate hook

  // State to determine if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    // Set initial state
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch data for movies, TV shows, and actors
        const [movies, tvShows, actors] = await Promise.all([
          fetchMovies(query),
          fetchTVShows(query),
          fetchActors(query),
        ]);

        console.log("Search Results:", { movies, tvShows, actors });

        if (!movies.length && !tvShows.length && !actors.length) {
          setError("No results found.");
        }

        // Combine results for movies, TV shows, and actors
        setResults([
          ...movies.map((m) => ({ ...m, type: "movie" })),
          ...tvShows.map((t) => ({ ...t, type: "tv" })),
          ...actors.map((a) => ({ ...a, type: "person" })),
        ]);
      } catch (err) {
        setError("Error fetching results. Try again later.");
      }

      setLoading(false);
    };

    // Debounce API call (500ms)
    const timeoutId = setTimeout(fetchResults, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Function to clear search input and results
  const handleClear = () => {
    setQuery("");
    setResults([]);
    setError("");
  };

  // Handle click to navigate to the details page
  const handleResultClick = (item) => {
    if (item.type === "movie") {
      navigate(`/movie/${item.id}`);
    } else if (item.type === "person") {
      navigate(`/actor/${item.id}`);
    } else if (item.type === "tv") {
      navigate(`/tv/${item.id}`);
    }
  };

  // ---------------------------
  // Mobile View Layout
  // ---------------------------
  if (isMobile) {
    return (
      <div className="relative">
        <div className="flex items-center bg-gray-800 rounded px-3 py-1">
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm p-1 bg-transparent focus:outline-none text-white"
          />
          {/* Clear button */}
          {query && (
            <button onClick={handleClear} className="ml-2 text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>

        {loading && <p className="text-white text-sm mt-2">Loading...</p>}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {results.length > 0 && (
          <ul className="absolute left-0 top-10 w-full bg-white text-black shadow-lg rounded-md z-50">
            {results.slice(0, 6).map((item) => (
              <li
                key={item.id}
                className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleResultClick(item)}
              >
                <img
                  src={
                    item.poster_path || item.profile_path
                      ? `https://image.tmdb.org/t/p/w92${item.poster_path || item.profile_path}`
                      : "https://via.placeholder.com/92x138?text=No+Image"
                  }
                  alt={item.name || item.title}
                  className="w-10 h-14 rounded mr-2"
                />
                <div>
                  <p className="text-sm font-semibold">{item.title || item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.release_date
                      ? `(${item.release_date.split("-")[0]})`
                      : item.known_for_department || ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // ---------------------------
  // Desktop View Layout
  // ---------------------------
  return (
    <div className="relative">
      <div className="flex items-center bg-gray-800 rounded px-3 py-1">
        <input
          type="text"
          placeholder="Search movies, TV shows, or actors..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-60 text-sm p-1 bg-transparent focus:outline-none text-white"
        />
        {/* Clear button */}
        {query && (
          <button onClick={handleClear} className="ml-2 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {loading && <p className="text-white text-sm mt-2">Loading...</p>}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {results.length > 0 && (
        <ul className="absolute left-0 top-10 w-72 bg-white text-black shadow-lg rounded-md z-50">
          {results.slice(0, 6).map((item) => (
            <li
              key={item.id}
              className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleResultClick(item)}
            >
              <img
                src={
                  item.poster_path || item.profile_path
                    ? `https://image.tmdb.org/t/p/w92${item.poster_path || item.profile_path}`
                    : "https://via.placeholder.com/92x138?text=No+Image"
                }
                alt={item.name || item.title}
                className="w-10 h-14 rounded mr-2"
              />
              <div>
                <p className="text-sm font-semibold">{item.title || item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.release_date
                    ? `(${item.release_date.split("-")[0]})`
                    : item.known_for_department || ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
