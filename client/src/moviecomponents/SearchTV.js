import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

import './Search.css'; // Assuming the same CSS can be used

function SearchTV() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1); // State for tracking the current page
    const navigate = useNavigate(); // Initialize useNavigate

    const performSearch = useCallback(async (pageNum) => {
        try {
            const response = await fetch(`/searchTV?query=${query}&page=${pageNum}`);
            const data = await response.json();
            if (pageNum === 1) {
                setResults(data.results); // Set new results if it's the first page
            } else {
                setResults(prevResults => [...prevResults, ...data.results]); // Append new results for other pages
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }, [query]); // Add dependencies here

    useEffect(() => {
        // Debounce the search operation
        const delayDebounce = setTimeout(() => {
            if (query) {
                setPage(1); // Reset to page 1 whenever the query changes
                performSearch(1); // Fetch the first page of results
            } else {
                setResults([]); // Clear results if query is empty
            }
        }, 500); // 500ms delay

        return () => clearTimeout(delayDebounce);
    }, [query, performSearch]); // Include performSearch in the dependency array



    const navigateToSeries = (seriesId) => {
        navigate(`/series/${seriesId}`); // Change the navigation path
    };

    const calculateRating = (rating) => {
        const circumference = 2 * Math.PI * 20; // Assuming the radius of the circle is 20
        return (rating / 10) * circumference; // Convert to length of the circle's stroke
    };

    const loadMoreResults = async () => {
        const nextPage = page + 1;
        await performSearch(nextPage);
        setPage(nextPage); // Update the page state after fetching new results
    };

    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a series..."
                className="search-input"
            />

            {/* Render search results */}
            <div className="search-results-container">
                {results.map((series, index) => (
                    <div
                        key={`${series.id}-${page}-${index}`} // Unique key combining id, page, and index
                        className="search-movie-card"
                        onClick={() => navigateToSeries(series.id)}
                    >
                        <img
                            src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
                            alt={series.name}
                            className="search-movie-poster"
                        />
                        <div className="search-movie-info">
                            <div className="movie-rating-circle">
                                <svg width="40" height="40" viewBox="0 0 44 44">
                                    <circle
                                        className="rating-circle-bg"
                                        cx="22" cy="22" r="20"
                                    />
                                    <circle
                                        className="rating-circle"
                                        cx="22" cy="22" r="20"
                                        strokeDasharray={`${calculateRating(series.vote_average)} 999`}
                                    />
                                    <text
                                        x="50%"
                                        y="50%"
                                        dy=".3em" /* Adjust this value as needed */
                                        textAnchor="middle"
                                        className="rating-text"
                                    >
                                        {series.vote_average.toFixed(1)}
                                    </text>
                                </svg>
                            </div>
                            <p className="search-movie-release-date">First Aired: {series.first_air_date}</p>
                            <h3 className="search-movie-title">{series.name}</h3>
                        </div>

                    </div>
                ))}

            </div>
            {/* Conditionally render Load More button */}
            {results.length > 0 && (
                <div className="load-more-container">
                    <button onClick={loadMoreResults} className="load-more-button">LOAD MORE</button>
                </div>
            )}
        </div>
    );
}

export default SearchTV;
