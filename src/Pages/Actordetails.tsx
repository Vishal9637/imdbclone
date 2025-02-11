import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaStar as Star, FaAward as Award } from 'react-icons/fa';
import { FaInstagram as Instagram, FaTwitter as Twitter } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext.tsx';

const ActorDetails = () => {
  const { theme } = useTheme();
  const { id } = useParams();

  // Type definition for the Actor (using TypeScript)
  interface Actor {
    name: string;
    profile_path: string;
    biography: string;
    birthday: string;
    place_of_birth: string;
    imdb_id: string;
    knownFor: Array<{
      id: number;
      poster_path: string;
      title: string;
      rating: string;
      role: string;
      year: string;
    }>;
    stats: {
      avgRating: number;
      totalAwards: number;
      moviesCount: number;
    };
    socialMedia: {
      instagram: string;
      twitter: string;
    };
    awards: Array<{
      name: string;
      year: string;
      category: string;
      film: string;
    }>;
  }

  const [actor, setActor] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mobile view detection state
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    // Set initial value
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tmdbApiKey = "9285d1e9c88254ee11ff102b45b09e32"; // TMDB API key
  const omdbApiKey = "326dcdae"; // OMDB API key

  useEffect(() => {
    const fetchActorDetails = async () => {
      try {
        // Fetch actor's personal details from TMDB
        const actorResponse = await axios.get(
          `https://api.themoviedb.org/3/person/${id}?api_key=${tmdbApiKey}&language=en-US`
        );

        // Fetch actor's movie credits (known for) from TMDB
        const creditsResponse = await axios.get(
          `https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${tmdbApiKey}&language=en-US`
        );

        // Fetch actor's social media links from TMDB
        const socialResponse = await axios.get(
          `https://api.themoviedb.org/3/person/${id}/external_ids?api_key=${tmdbApiKey}`
        );

        // Fetch actor's awards and more details from OMDB API using the IMDb ID
        const omdbResponse = await axios.get(
          `https://www.omdbapi.com/?apikey=${omdbApiKey}&i=${actorResponse.data.imdb_id}`
        );

        setActor({
          ...actorResponse.data,
          knownFor: creditsResponse.data.cast.slice(0, 6).map((movie: any) => ({
            ...movie,
            poster_path: movie.poster_path ? movie.poster_path : '', // Use poster_path for movie poster
          })),
          stats: {
            avgRating: actorResponse.data.popularity, // Using popularity as an example for rating
            totalAwards: omdbResponse.data.Awards ? omdbResponse.data.Awards.split(',').length : 0,
            moviesCount: creditsResponse.data.cast.length,
          },
          socialMedia: {
            instagram: socialResponse.data.instagram_id || '',
            twitter: socialResponse.data.twitter_id || '',
          },
          awards: omdbResponse.data.Awards
            ? omdbResponse.data.Awards.split(',').map((award: string) => ({
                name: award.trim(),
                year: 'Unknown',
                category: 'Unknown',
                film: 'Unknown',
              }))
            : [],
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching actor details:", error);
        setError("Failed to load actor details. Please try again later.");
        setLoading(false);
      }
    };

    fetchActorDetails();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Redefined Hero Section for Mobile and Desktop
  const heroSection = isMobile ? (
    // Mobile Hero Section
    <div className="relative h-[250px] mb-4 rounded-xl overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/w500/${actor?.knownFor[0]?.poster_path || actor?.profile_path})`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50" />
      </div>
      <div className="relative h-full flex flex-col items-center justify-center p-4">
        <img
          src={`https://image.tmdb.org/t/p/w500/${actor?.profile_path}`}
          alt={actor?.name}
          className="w-24 h-24 rounded-full object-cover border-2 border-yellow-500"
        />
        <h1 className="mt-2 text-2xl font-bold text-white">{actor?.name}</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-yellow-300">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{actor?.stats.avgRating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4 text-purple-500" />
            <span>{actor?.stats.totalAwards}</span>
          </div>
        </div>
      </div>
    </div>
  ) : (
    // Desktop Hero Section
    <div className="relative h-[400px] mb-8 rounded-xl overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w500/${actor?.knownFor[0]?.poster_path})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80" />
      </div>
      <div className="relative h-full container flex items-end pb-8">
        <div className="flex items-end gap-8">
          <img
            src={`https://image.tmdb.org/t/p/w500/${actor?.profile_path}`}
            alt={actor?.name}
            className="w-48 h-48 rounded-xl object-cover border-4 border-yellow-500 dark:border-white"
          />
          <div>
            <h1 className="text-4xl font-bold mb-4 text-yellow-400 dark:text-gray-100">
              {actor?.name}
            </h1>
            <div className="flex items-center gap-2 text-yellow-400 dark:text-white">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>{actor?.stats.avgRating} Average Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                <span>{actor?.stats.totalAwards} Awards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Main content that follows the hero section
  const content = (
    <>
      {heroSection}

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Personal Info & Social Media */}
        <div>
          <div className="sticky top-24 space-y-6">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
              <h2 className="font-semibold mb-4">Personal Info</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-gray-400">Born</dt>
                  <dd>{actor?.birthday}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Place of Birth</dt>
                  <dd>{actor?.place_of_birth}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Movies</dt>
                  <dd>{actor?.stats.moviesCount} titles</dd>
                </div>
              </dl>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
              <h2 className="font-semibold mb-4">Social Media</h2>
              <div className="flex gap-4">
                {actor?.socialMedia.instagram && (
                  <a
                    href={`https://www.instagram.com/${actor?.socialMedia.instagram}`}
                    className="text-gray-400 hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                )}
                {actor?.socialMedia.twitter && (
                  <a
                    href={`https://twitter.com/${actor?.socialMedia.twitter}`}
                    className="text-gray-400 hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Biography, Awards, Known For */}
        <div className="md:col-span-2">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Biography</h2>
            <p className="text-lg font-semibold mt-3 text-black dark:text-white">
              {actor?.biography || "Biography not available"}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Awards & Nominations</h2>
            <div className="grid gap-4">
              {actor?.awards.map((award, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-gray-800 p-4 rounded-xl"
                >
                  <Award className="w-5 h-5 text-yellow-500" />
                  <div>
                    <span className="font-semibold">{award.name}</span>
                    <span className="mx-2">|</span>
                    <span>{award.year}</span>
                    <p className="text-sm text-gray-400">
                      {award.category} - {award.film}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Known For</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {actor?.knownFor.map((movie) => (
                <Link key={movie.id} to={`/movie/${movie.id}`}>
                  <div className="text-lg font-semibold mt-3 text-black dark:text-white">
                    <div className="relative aspect-[2/3]">
                      <img
                        src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded-md flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-500 font-medium">
                          {movie.rating}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">
                        {movie.title}
                      </h3>
                      <p className="text-gray-400">as {movie.role}</p>
                      <p className="text-gray-500 text-sm">{movie.year}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );

  // Render based on device view
  if (isMobile) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center p-4 ${
          theme === "dark" ? "bg-black text-white" : "bg-gray-100 text-black"
        }`}
      >
        <div
          className={`w-full shadow-lg rounded-lg p-4 ${
            theme === "dark" ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white container mx-auto p-4">
      {content}
    </div>
  );
};

export default ActorDetails;
