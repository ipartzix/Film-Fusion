export default async function handler(req, res) {
  try {
    const { title } = req.query;
    if (!title) return res.status(400).json({ error: "Missing title" });

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(
        title
      )}`
    );
    const data = await response.json();

    if (data.results.length === 0) return res.status(404).json(null);

    const movie = data.results[0];
    const genreMap = {
      28: "Action",
      12: "Adventure",
      16: "Animation",
      35: "Comedy",
      80: "Crime",
      99: "Documentary",
      18: "Drama",
      10751: "Family",
      14: "Fantasy",
      36: "History",
      27: "Horror",
      10402: "Music",
      9648: "Mystery",
      10749: "Romance",
      878: "Sci-Fi",
      10770: "TV Movie",
      53: "Thriller",
      10752: "War",
      37: "Western",
    };

    movie.genre_names = movie.genre_ids.map((id) => genreMap[id] || "Unknown");

    res.status(200).json(movie);
  } catch (err) {
    console.error("TMDB error:", err);
    res.status(500).json({ error: "TMDB API failed" });
  }
}
