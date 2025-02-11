// src/components/LoginModal.tsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { auth } from "../firebase.ts";
import { signInWithEmailAndPassword } from "firebase/auth";
import { login } from "../redux/authSlice.jsx";
import { FirebaseError } from "firebase/app";
import { Eye, EyeOff, X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignup,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        setError("Please verify your email first. Check your inbox.");
        return;
      }

      dispatch(
        login({
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || email,
          email: userCredential.user.email,
        })
      );

      onClose();
    } catch (error) {
      console.error("Login Error:", error);

      if (error instanceof FirebaseError) {
        switch (error.code) {
          // ... existing error cases ...
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg w-96 relative mt-96">
        <button
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-300"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-4">
          Login to Your Account
        </h2>

        {error && (
          <div className="p-2 text-sm rounded-md mb-3 text-center bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 text-black dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 text-black dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 dark:text-gray-300"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-4 text-gray-600 dark:text-gray-300">
          <span>Don't have an account? </span>
          <button
            className="text-blue-600 hover:underline"
            onClick={() => {
              onClose();
              onSwitchToSignup();
            }}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
