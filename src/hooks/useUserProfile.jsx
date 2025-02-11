// File: src/hooks/useUserProfile.jsx
import { useState, useEffect } from "react";
import { auth, db } from "../firebase.ts"; // Ensure your firebase file exports 'auth' and 'db'
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const useUserProfile = () => {
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      
      const docRef = doc(db, "users", user.uid);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        } else {
          // Create a default profile document if it doesn't exist
          const defaultProfile = {
            username: "User",
            profilePicture:
              "https://i.ibb.co/Xhzsry7/ff5f78476f0edf5b1bf7840f84342ebd.jpg",
          };
          await setDoc(docRef, defaultProfile);
          setProfileData(defaultProfile);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = async (updates) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const docRef = doc(db, "users", user.uid);
    try {
      await updateDoc(docRef, updates);
      setProfileData((prevData) => ({ ...prevData, ...updates }));
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  return { profileData, updateProfile, loading };
};

export default useUserProfile;
