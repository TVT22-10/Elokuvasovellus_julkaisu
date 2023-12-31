import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../my_profile/my_profile.css'; // Assuming styles are similar to Profile
import { useParams,useNavigate } from 'react-router-dom';
import StarRating from '../../movie_review/StarRating';

function PublicProfile() {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState('favourites');
  const [creationDate, setCreationDate] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [userAvatar, setUserAvatar] = useState('');
  const [userReviews, setUserReviews] = useState([]);
  const [movies, setMovies] = useState({});
  const [showFullReview, setShowFullReview] = useState(false);
  const [userExists, setUserExists] = useState(true);
  const [bio, setBio] = useState('');
  const [userPosts, setUserPosts] = useState([]); // Added this line

  

  const navigate = useNavigate();
  
  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`/favorites/${username}`);
      const favoriteMovieIds = response.data.map(fav => fav.movie_id);

      const movieResponses = await Promise.all(
        favoriteMovieIds.map(id => axios.get(`/movies/${id}`))
      );
      setFavorites(movieResponses.map(res => res.data));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };


  useEffect(() => {
    const fetchMovieDetails = async (movieIds) => {
      try {
        const movieResponses = await Promise.all(
          movieIds.map(id => axios.get(`/movies/${id}`))
        );
        const newMovies = {};
        movieResponses.forEach((response) => {
          newMovies[response.data.id] = response.data;
        });
        return newMovies;
      } catch (error) {
        console.error('Error fetching movie details:', error);
      }
    };
  
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/user/profile/${username}`);
        if (response.data) {
          const { creation_time, avatar, favorites, reviews } = response.data;
  
          setCreationDate(formatCreationDate(creation_time));
          setUserAvatar(avatar ? `/avatars/${avatar}` : '/avatars/defaultAvatar.png');
          setUserReviews(reviews);
          setUserExists(true);
          setBio(response.data.bio || 'No bio yet');
  
          const reviewMovieIds = reviews.map(review => review.movie_id);
          const favoriteMovieIds = favorites.map(fav => fav.movie_id);
  
          // Fetching movie details for both reviews and favorites concurrently
          const [reviewMovies, favoriteMovies] = await Promise.all([
            fetchMovieDetails(reviewMovieIds),
            fetchMovieDetails(favoriteMovieIds)
          ]);
  
          // Combining the movie details into a single object
          setMovies({ ...reviewMovies, ...favoriteMovies });
  
          // Call fetchFavorites to update the favorites state
          await fetchFavorites(); // This will update the favorites state
        } else {
          setUserExists(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserExists(false);
      }
    };
  
    fetchUserData();
  }, [username]); // Make sure to include fetchFavorites in the dependency array if it uses any external state or props
  

  
  
  

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await axios.get(`/posts/${username}`);
        setUserPosts(response.data);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };

    fetchUserPosts();
  }, [username]);

  

  if (!userExists) {
    return <div>User not found.</div>;
  }

  // Rest of your component logic
  // ...

  const navigateToMovie = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  const formatCreationDate = (timestamp) => {
    if (!timestamp) {
      return 'No creation time';
    }

    let date;
    if (typeof timestamp === 'number') {
      date = new Date(timestamp * 1000);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      return 'Invalid Format';
    }

    return date.toLocaleDateString();
  };

    const calculateRating = (rating) => {
        const circumference = 2 * Math.PI * 20;
        return (rating / 10) * circumference;
      };

      const toggleShowFullReview = () => {
        setShowFullReview(!showFullReview);
      };



  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-container">
          <div className="profile-image">
            <img src={userAvatar} alt="User Avatar" className="avatar" />
          </div>
          <div className="profile">
            <div className="username">
              <h2>{username}</h2>
              <p>Account Created On: {creationDate}</p>
            </div>
           
          </div>
          <div className="bio-top-right">
          <div className="bio-view">
            <div className="bio-text-container">
              <p className="bio-text-outline">{bio}</p>
            </div>
          </div>
        </div>
        </div>
        <div className="profile-buttons">
          <p
            className={`view-change ${activeTab === 'favourites' ? 'active-link' : ''}`}
            onClick={() => setActiveTab('favourites')}
          >
            Favourites
          </p>
          <p
            className={`view-change ${activeTab === 'reviews' ? 'active-link' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </p>
          <p
            className={`view-change ${activeTab === 'posts' ? 'active-link' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </p>
        </div>
        <div className="profile-content">
          <div className={`content ${activeTab !== 'favourites' && 'hidden'}`} id="favourites">
            <div className="favorites-container">
              {favorites.map((movie) => (
                <div
                  key={movie.id}
                  className="favorites-movie-card"
                  onClick={() => navigateToMovie(movie.id)}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                    alt={movie.title}
                    className="favorites-movie-poster"
                  />
                  <div className="favorites-movie-info">
                    <div className="movie-rating-circle">
                      <svg width="40" height="40" viewBox="0 0 44 44">
                        <circle className="rating-circle-bg" cx="22" cy="22" r="20" />
                        <circle
                          className="rating-circle"
                          cx="22"
                          cy="22"
                          r="20"
                          strokeDasharray={`${calculateRating(movie.vote_average)} 999`}
                        />
                        <text x="50%" y="50%" dy=".3em" textAnchor="middle" className="rating-text">
                        {movie.vote_average?.toFixed(1)}
                        </text>
                      </svg>
                    </div>
                    <p className="favorites-movie-release-date">Released: {movie.release_date}</p>
                    <h3 className="favorites-movie-title">{movie.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={`content ${activeTab !== 'reviews' && 'hidden'}`} id="reviews">
            {userReviews.length > 0 ? (
              <div className="rowed-reviews-container">
                {userReviews.map((review) => (
                  <div key={review.review_id} className="review-container">
                    <div className="review-content-left">
              <div className='review-userdata-container'>
              <div className="review-profile-image">
              <div className='review-username'><img src={userAvatar} alt="User Avatar" className="avatar" /><h3>{username}</h3></div>
              </div>
              </div>
                      <div className="review-content">
                        <div className='profile-review-date'><p>Posted on: {new Date(review.review_date).toLocaleDateString()}</p></div>
                        <StarRating rating={review.rating} />
                        <div className='profile-review-text'>
                          {showFullReview ? (
                            <p>{review.review_text}</p>
                          ) : (
                            <p>
                              {review.review_text.length > 70
                                ? `${review.review_text.substring(0, 70)}...`
                                : review.review_text}
                              {review.review_text.length > 70 && (
                                <div className='read-more-container'><button className='read-more' onClick={toggleShowFullReview}>
                                  {showFullReview ? 'Read Less' : 'Read More'}
                                </button></div>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {movies[review.movie_id] && (
                      <div className="movie-poster-container" onClick={() => navigateToMovie(review.movie_id)}>
                        <img
                          src={`https://image.tmdb.org/t/p/w300${movies[review.movie_id].poster_path}`}
                          alt={movies[review.movie_id].title}
                          className="browse-movie-poster"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No reviews for this user yet.</p>
            )}
          </div>
          <div className={`content ${activeTab === 'posts' ? 'visible' : 'hidden'}`} id="posts">
          <div className="posts">

          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <div key={post.post_id} className="user-post">
                <p>{post.content}</p>
                <span>Posted on: {new Date(post.creation_time).toLocaleDateString()}</span>
              </div>
            ))
          ) : (
            <p>No posts for this user yet.</p>
          )}
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;
