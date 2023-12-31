import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../components/Contexts'; // Adjust the path as necessary 
import axios from 'axios';
import './MovieDetail.css';
import './LoadingScreen.css';
import MovieReviews from '../pages/movie_review/movie_review';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';


function MovieDetail() {
  const { movieId } = useParams();
  const [movieDetails, setMovieDetails] = useState({});
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const castContainerRef = useRef(null);
  const { isLoggedIn } = useContext(AuthContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useContext(AuthContext);
  const username = user?.username;  // Safely access username
  const [trailerUrl, setTrailerUrl] = useState(''); // State to store trailer URL
  const navigate = useNavigate();



  useEffect(() => {
    setLoading(true);

    // Fetch movie details
    fetch(`/movies/${movieId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch movie details.');
        }
        return response.json();
      })
      .then(data => {
        setMovieDetails(data);

        // Fetch cast details
        return fetch(`/movies/${movieId}/cast`);
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch cast details.');
        }
        return response.json();
      })
      .then(castData => {
        setCast(castData.cast);

        // Fetch movie trailer
        return fetch(`/movies/${movieId}/videos`);
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch trailer.');
        }
        return response.json();
      })
      .then(data => {
        const trailers = data.results.filter(video => video.type === 'Trailer');
        if (trailers.length > 0) {
          setTrailerUrl(`https://www.youtube.com/embed/${trailers[0].key}`);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    // Check favorite status
    if (username) {
      axios.get(`/favorites/${username}/check`, { params: { movieId } })
        .then(response => {
          setIsFavorite(response.data.isFavorite);
        })
        .catch(err => console.error('Error checking favorite status:', err));
    }
  }, [movieId, username]);


  const calculateRating = rating => {
    const circumference = 2 * Math.PI * 20;
    return (rating / 10) * circumference;
  };

  const scrollCast = scrollOffset => {
    castContainerRef.current.scrollLeft += scrollOffset;
  };

  const addToFavorites = async () => {
    if (!username) return;
    console.log('Username and MovieID:', { username, movieId }); // Log relevant information
    let response;

    try {
      if (isFavorite) {
        response = await axios.delete(`/favorites/${username}/remove/${movieId}`);
      } else {
        response = await axios.post(`/favorites/${username}/add`, { movieId });
      }
      setIsFavorite(!isFavorite);
      console.log(response.data);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  if (loading) {
    return (
      <div className="overlay">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="relative-container">
      <div className="gradient-overlay"></div>

      <div className="background-image" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movieDetails.backdrop_path})` }}></div>

      <div className="movie-content">
        <div className="poster-and-trailer-container">
          <img src={`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`} alt={movieDetails.title} className="movie-poster" />

          {/* Trailer Section */}
          {trailerUrl && (
            <div className="trailer-container">
              <iframe
                src={trailerUrl}
                title="Movie Trailer"
                allowFullScreen
                className="movie-trailer-iframe">
              </iframe>
            </div>
          )}
        </div>

        <div className="movie-detail-content">
          <h1 className="detail-title">{movieDetails.title}</h1>
          <p className="detail-release-date">{movieDetails.release_date.split('-')[0]}</p>

          <div className="detail-flex-container">
            <div className="movie-rating-circle">
              <svg width="60" height="60" viewBox="0 0 44 44">
                <circle className="rating-circle-bg" cx="22" cy="22" r="20" />
                <circle className="rating-circle" cx="22" cy="22" r="20" strokeDasharray={`${calculateRating(movieDetails.vote_average)} 999`} />
                <text x="50%" y="50%" dy=".3em" textAnchor="middle" className="rating-text">
                  {movieDetails.vote_average.toFixed(1)}
                </text>
              </svg>
            </div>

            <div className="genres-container">
              {movieDetails.genres && movieDetails.genres.map((genre, index) => (
                <span key={index} className="genre-tag">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          <p>{movieDetails.overview}</p>

          {/* Add to Favorites button */}
          <div className="favorite-button-container">
            {isLoggedIn && (
              <button className="favorite-button1" onClick={addToFavorites}>
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </button>
            )}
          </div>

          <div className="cast-section">
            <h2 className="cast-heading">CAST</h2>

            <button onClick={() => scrollCast(-300)} className="cast-scroll-button left-arrow">
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div ref={castContainerRef} className="cast-container">
              {cast.map(member => (
                <div key={member.id} className="cast-member" onClick={() => navigate(`/actors/${member.id}`)}>
                  <div className="cast-poster-wrapper">
                    {member.profile_path && (
                      <img src={`https://image.tmdb.org/t/p/w200${member.profile_path}`} alt={member.name} className="cast-poster" />
                    )}
                    <div className="cast-info">
                      <p className="cast-name">{member.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => scrollCast(300)} className="cast-scroll-button right-arrow">
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>

          {/* Reviews section */}
          <MovieReviews movieId={movieId} />
        </div>

      </div>
    </div>
  );
}

export default MovieDetail;