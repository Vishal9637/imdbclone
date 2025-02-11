// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.jsx";

export const store = configureStore({
  reducer: {
    auth: authReducer, // This key must be "auth"
  },
});
