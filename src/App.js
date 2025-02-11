import "./App.css";
import Navbar from "./components/Navbar.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home.tsx";
import Profile from "./Pages/Profile.jsx";
import MovieList from "./Pages/MovieList.tsx";
import MovieDetails from "./Pages/MovieDetails.tsx";
import Toprated from "./Pages/Toprated.jsx";
import Actordetails from "./Pages/Actordetails.tsx";
import ActorProfiles from "./Pages/ActorProfiles.jsx";
import Watchlist from "./Pages/Watchlist.tsx";
import ActorProfile from "./Pages/ActorProfiles.jsx";
import FavoriteActorsPage from "./Pages/FavoriteActorsPage.jsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { Provider } from "react-redux";
import { WatchlistProvider } from "./context/WatchlistContext.tsx";
import { FavoriteActorsProvider } from "./context/FavoriteActorsContext.jsx";
import ComingSoon from "./Pages/ComingSoon.tsx";
import Recommendations from "./components/Recommendations.jsx";
import RecommendationsPage from "./Pages/RecommendationsPage.jsx";



function App() {
  return (
    <ThemeProvider> 
      

      <FavoriteActorsProvider>
        <WatchlistProvider> 
          <BrowserRouter>
            
            
            <div className="min-h-screen bg-black text-white">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/movies" element={<MovieList />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/actor/:id" element={<Actordetails />} />
                <Route path="/top-rated" element={<Toprated />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/actors" element={<ActorProfiles />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/actor/:id/profile" element={<ActorProfile />} />
                <Route path="/favorite-actors" element={<FavoriteActorsPage />} />
                <Route path="/coming-soon" element={<ComingSoon />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
              
              </Routes>
             
            </div>
          </BrowserRouter>
        </WatchlistProvider>
      </FavoriteActorsProvider>
    

    </ThemeProvider>
  );
}

export default App;
