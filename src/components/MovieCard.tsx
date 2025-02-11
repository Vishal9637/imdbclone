import React from "react";
import { Star } from "lucide-react";
import { useWatchlist } from "../context/WatchlistContext.tsx";

interface MovieProps {
  id: string;
  title: string;
  rating: number;
  image: string;
  year: string;
  genre: string[];
}

const MovieCard: React.FC<MovieProps> = ({ id, title, rating, image, year, genre }) => {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const isInWatchlist = watchlist.some((movie) => movie.id === id);

  return (
    <div className="bg-zinc-900/50 rounded-xl overflow-hidden movie-card-hover backdrop-blur-sm">
      {/* Movie Poster Clickable, But Not Buttons */}
      <div className="relative aspect-[2/3] group">
        <a href={`/movie/${id}`} className="block w-full h-full">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover hover-glow"
          />
        </a>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 p-4 w-full flex flex-col gap-2">
            <a href={`/movie/${id}`} className="w-full">
              <button className="w-full bg-yellow-500 text-black py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
                View Details
              </button>
            </a>

            {/* Prevent Navigation on Watchlist Click */}
            {isInWatchlist ? (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Stop event bubbling
                  e.preventDefault(); // Prevent navigation
                  removeFromWatchlist(id);
                }}
                className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-400 transition-colors"
              >
                Remove from Watchlist
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Stop event bubbling
                  e.preventDefault(); // Prevent navigation
                  addToWatchlist({ id, title, poster: image });
                }}
                className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-400 transition-colors"
              >
                Add to Watchlist
              </button>
            )}
          </div>
        </div>

        {/* Star Rating Display */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-yellow-500 font-medium">{rating}</span>
        </div>
      </div>

      {/* Movie Info Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg truncate text-glow">{title}</h3>
          <span className="text-zinc-400 text-sm">{year}</span>
        </div>
        {genre && (
          <div className="flex flex-wrap gap-2">
            {genre.slice(0, 2).map((g) => (
              <span key={g} className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-zinc-300">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
