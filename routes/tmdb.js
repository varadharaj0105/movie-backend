const express = require('express');
const axios = require('axios');
const Ratings = require('../models/Ratings'); // Import your Ratings model for the database

const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const OMDB_API_KEY = process.env.OMDB_API_KEY;

router.get('/popular-movies', async (req, res) => {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
      params: {
        api_key: TMDB_API_KEY,
        language: 'ta-IN',
        sort_by: 'popularity.desc',
        region: 'IN',
        with_original_language: 'ta',
        page: 1,
      },
    });
    const tamilMovies = response.data.results.filter(movie => movie.poster_path);
    res.json(tamilMovies);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching popular Tamil movies' });
  }
});

router.get('/recently-released', async (req, res) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/latest`, {
      params: { api_key: TMDB_API_KEY, language: 'en-US' },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching latest movies' });
  }
});

router.get('/search', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: 'Query parameter is required' });

  try {
    const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        language: 'en-US',
        page: 1,
      },
    });

    if (response.data.results.length === 0) {
      return res.status(404).json({ error: 'No movies found' });
    }

    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie data' });
  }
});

router.get('/movieDetails', async (req, res) => {
  const movieId = req.query.id;
  if (!movieId) return res.status(400).json({ error: 'Movie ID is required' });

  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
      params: { api_key: TMDB_API_KEY, language: 'en-US' },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});


router.get('/fullMovieDetails', async (req, res) => {
  const movieId = req.query.id;
  if (!movieId) return res.status(400).json({ error: 'Movie ID is required' });

  try {
    // Fetch movie details from TMDB and other related data (cast, video, providers)
    const [details, credits, videos, providersRes] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US' },
      }),
      axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
        params: { api_key: TMDB_API_KEY },
      }),
      axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
        params: { api_key: TMDB_API_KEY },
      }),
      axios.get(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers`, {
        params: { api_key: TMDB_API_KEY },
      }),
    ]);

    const trailer = videos.data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const imdbId = details.data.imdb_id;

    // Fetch OMDB data using IMDb ID if available
    let omdbData = null;
    if (imdbId) {
      try {
        const omdbResponse = await axios.get('http://www.omdbapi.com/', {
          params: {
            i: imdbId,
            apikey: OMDB_API_KEY,
          },
        });
        omdbData = omdbResponse.data;
      } catch (omdbError) {
        console.error('Error fetching OMDb data:', omdbError.message);
      }
    }

    const providers = providersRes.data.results?.IN || null;

    // Fetch the ratings from your database
    const dbRatings = await Ratings.findAll({
      where: { movieId: movieId },
    });

    // Calculate the combined ratings and count
    let combinedRating = 0;
    let combinedVotes = 0;

    // Combine TMDB and OMDB ratings with the database ratings
    const tmdbRating = details.data.vote_average || 0;
    const tmdbVotes = details.data.vote_count || 0;
    const imdbRating = omdbData ? parseFloat(omdbData.imdbRating) : 0;
    const imdbVotes = omdbData ? parseInt(omdbData.imdbVotes.replace(/,/g, '')) : 0;

    // Sum up all ratings and votes
    dbRatings.forEach(rating => {
      combinedRating += rating.score;
      combinedVotes += 1;
    });

    // Combine all ratings and calculate the weighted average
    combinedRating += (tmdbRating * tmdbVotes) + (imdbRating * imdbVotes);
    combinedVotes += tmdbVotes + imdbVotes;

    const finalRating = combinedVotes > 0 ? (combinedRating / combinedVotes).toFixed(1) : 'N/A';

    // Send back the combined data to the client
    res.json({
      ...details.data,
      cast: credits.data.cast.slice(0, 10),
      trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      omdb: omdbData,
      watchProviders: providers,
      combinedRating: finalRating,
      combinedVotes: combinedVotes,
    });
  } catch (error) {
    console.error('Error fetching TMDB or OMDb data:', error.message);
    res.status(500).json({ error: 'Failed to fetch full movie details' });
  }
});

module.exports = router;
router.get('/watch-providers', async (req, res) => {
  const movieId = req.query.id;
  if (!movieId) return res.status(400).json({ error: 'Movie ID is required' });

  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers`, {
      params: { api_key: TMDB_API_KEY },
    });

    const providers = response.data.results?.IN || {};
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watch providers' });
  }
});

module.exports = router;


