import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "../redux/authSlice";
import { Film, Menu, X, Sun, Moon, UserCircle } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.tsx";
import SearchBar from "./SearchBar.jsx";
import LoginModal from "./LoginModal.tsx";
import SignupModal from "./SignupModal.tsx";
import { auth } from "../firebase.ts"; 
import { onAuthStateChanged, signOut } from "firebase/auth";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const didInitialRedirect = useRef(false); // To ensure redirection only happens once
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Get user from Redux
  const user = useSelector((state: { auth: { user: any } }) => state.auth.user);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(login(user)); // Update Redux with user info
      } else {
        dispatch(logout());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Redirect to home page on initial load (only once)
  useEffect(() => {
    if (!didInitialRedirect.current) {
      if (location.pathname !== "/") {
        navigate("/");
      }
      didInitialRedirect.current = true;
    }
  }, [location, navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-gray-100 dark:bg-gray-900 backdrop-blur-md border-b border-gray-300 dark:border-zinc-800 sticky top-0 z-50 p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Film className="w-8 h-8 text-yellow-500" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">MovieDB</span>
        </Link>

        {/* Navigation Items (Desktop) */}
        <ul className="hidden md:flex gap-4 text-gray-900 dark:text-white">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/actors">Actor Profiles</Link>
          </li>
          <li>
            <Link to="/movies">Movies</Link>
          </li>
          <li>
            <Link to="/watchlist">Watchlist</Link>
          </li>
          <li>
            <Link to="/coming-soon">Coming Soon</Link>
          </li>
          <li>
            <Link to="/top-rated">Top Rated</Link>
          </li>
        </ul>

        {/* Search Bar */}
        <SearchBar />

        {/* Theme Toggle & Authentication (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 transition"
          >
            {theme === "dark" ? (
              <Sun className="text-yellow-400" />
            ) : (
              <Moon className="text-gray-900" />
            )}
          </button>

          {/* Authentication/Profile */}
          {user ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/profile")}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition"
              >
                <UserCircle size={20} />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowLogin(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Login
              </button>
              <button
                onClick={() => setShowSignup(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-900 dark:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-gray-200 dark:bg-gray-900 rounded-lg">
          <div className="flex flex-col gap-4">
            <Link
              to="/"
              className="text-gray-900 dark:text-white hover:text-yellow-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/actors"
              className="text-gray-900 dark:text-white hover:text-yellow-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Actor Profiles
            </Link>
            <Link
              to="/movies"
              className="text-gray-900 dark:text-white hover:text-yellow-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Movies
            </Link>
            <Link
              to="/watchlist"
              className="text-gray-900 dark:text-white hover:text-yellow-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Watchlist
            </Link>
            <Link
              to="/coming-soon"
              className="text-gray-900 dark:text-white hover:text-yellow-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Coming Soon
            </Link>
            <Link
              to="/top-rated"
              className="text-gray-900 dark:text-white hover:text-yellow-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Top Rated
            </Link>

            {/* Theme Toggle (Mobile) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 transition"
            >
              {theme === "dark" ? (
                <Sun className="text-yellow-400" />
              ) : (
                <Moon className="text-gray-900" />
              )}
            </button>

            {/* Authentication (Mobile) */}
            {user ? (
              <div className="flex flex-col gap-4 items-center">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsMenuOpen(false);
                  }}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition"
                >
                  <UserCircle size={20} />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setIsMenuOpen(false);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowSignup(true);
                    setIsMenuOpen(false);
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showLogin && (
        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}
      {showSignup && (
        <SignupModal
          isOpen={showSignup}
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
