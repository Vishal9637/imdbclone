import React, { createContext, useContext, useState, useEffect } from "react";
import { db, auth } from "../firebase.ts"; // Import Firebase auth and Firestore
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const FavoriteActorsContext = createContext();

export const FavoriteActorsProvider = ({ children }) => {
  const [favoriteActors, setFavoriteActors] = useState([]);
  const [user, setUser] = useState(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Fetch favorite actors from Firestore when user is signed in
  useEffect(() => {
    const fetchFavoriteActors = async () => {
      if (user) {
        try {
          const docRef = doc(db, "favoriteActors", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFavoriteActors(docSnap.data().actors || []);
          } else {
            setFavoriteActors([]);
          }
        } catch (error) {
          console.error("Error fetching favorite actors:", error);
        }
      } else {
        // Clear the favorites if no user is signed in
        setFavoriteActors([]);
      }
    };

    fetchFavoriteActors();
  }, [user]);

  // Add actor to favorites (only if the user is signed in)
  const addFavoriteActor = async (actor) => {
    if (!user) {
      alert("Please sign in to add a favorite actor.");
      return;
    }

    try {
      const updatedFavorites = [...favoriteActors, actor];
      setFavoriteActors(updatedFavorites);
      await setDoc(doc(db, "favoriteActors", user.uid), { actors: updatedFavorites });
    } catch (error) {
      console.error("Error adding favorite actor:", error);
    }
  };

  // Remove actor from favorites (only if the user is signed in)
  const removeFavoriteActor = async (id) => {
    if (!user) {
      alert("Please sign in to remove a favorite actor.");
      return;
    }

    try {
      const updatedFavorites = favoriteActors.filter((actor) => actor.id !== id);
      setFavoriteActors(updatedFavorites);
      await setDoc(doc(db, "favoriteActors", user.uid), { actors: updatedFavorites });
    } catch (error) {
      console.error("Error removing favorite actor:", error);
    }
  };

  return (
    <FavoriteActorsContext.Provider
      value={{ favoriteActors, addFavoriteActor, removeFavoriteActor, user }}
    >
      {children}
    </FavoriteActorsContext.Provider>
  );
};

export const useFavoriteActors = () => useContext(FavoriteActorsContext);
