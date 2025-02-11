import React, { createContext, useContext, useState, useEffect } from "react";
import { db, auth } from "../firebase.ts"; // Import Firebase auth & Firestore
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

// Define movie type
interface Movie {
  id: number;
  title: string;
  posterPath?: string;
  [key: string]: any;
}

// Define context type
interface WatchlistContextType {
  watchlist: Movie[];
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: number) => void;
  user: User | null;
}

// Create context
export const WatchlistContext = createContext<WatchlistContextType | null>(null);

// Custom hook for using watchlist context
export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
};

// Watchlist provider component
interface WatchlistProviderProps {
  children: React.ReactNode;
}

export const WatchlistProvider: React.FC<WatchlistProviderProps> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Fetch watchlist from Firestore when user logs in
  useEffect(() => {
    if (user) {
      const docRef = doc(db, "watchlists", user.uid);

      // Subscribe to Firestore changes in real-time
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setWatchlist(docSnap.data().movies || []);
        } else {
          setWatchlist([]);
        }
      });

      return () => unsubscribe();
    } else {
      setWatchlist([]); // Clear watchlist if user logs out
    }
  }, [user]);

  // Update Firestore watchlist for the logged-in user
  const updateFirestoreWatchlist = async (movies: Movie[]) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "watchlists", user.uid), { movies });
    } catch (error) {
      console.error("Error updating watchlist:", error);
    }
  };

  // Add movie to watchlist (Firestore + local state)
  const addToWatchlist = async (movie: Movie) => {
    if (!user) {
      alert("Please sign in to add a movie to your watchlist.");
      return;
    }

    setWatchlist((prevWatchlist) => {
      // Prevent duplicate movies in the watchlist
      if (!prevWatchlist.some((item) => item.id === movie.id)) {
        const updatedList = [...prevWatchlist, movie];
        updateFirestoreWatchlist(updatedList);
        return updatedList;
      }
      return prevWatchlist;
    });
  };

  // Remove movie from watchlist (Firestore + local state)
  const removeFromWatchlist = async (movieId: number) => {
    if (!user) {
      alert("Please sign in to remove a movie from your watchlist.");
      return;
    }

    setWatchlist((prevWatchlist) => {
      const updatedList = prevWatchlist.filter((movie) => movie.id !== movieId);
      updateFirestoreWatchlist(updatedList);
      return updatedList;
    });
  };

  return (
    <WatchlistContext.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, user }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};
