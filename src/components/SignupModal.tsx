// src/components/SignUpModal.tsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { auth, db } from "../firebase.ts";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { login } from "../redux/authSlice.jsx";
import { Eye, EyeOff } from "lucide-react";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const SignUpModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, { displayName: name });

      // Send email verification
      await sendEmailVerification(user);

      // Store username in Firestore
      await setDoc(doc(db, "users", user.uid), { username: name });

      setMessage("Verification email sent! Please check your inbox.");

      // Sign out user to enforce email verification
      await signOut(auth);
    } catch (error: any) {
      console.error("Error signing up:", error.message);
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center pt-32 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-4">
          Create Your Account
        </h2>

        {message && (
          <div
            className={`p-3 rounded-md text-center text-sm font-medium ${
              message.includes("sent") ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {message.includes("sent") ? "✓" : "⚠️"} {message}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSignup}>
          {/* Name Input */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 text-black dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 text-black dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Password Input with Toggle */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 text-black dark:bg-gray-800 dark:text-white"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
          <button
            type="button"
            className="text-blue-600 hover:underline dark:text-blue-400"
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;
