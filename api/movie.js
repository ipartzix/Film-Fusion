export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query } = req.body;
    const prompt = `
      Based on the movie "${query}", recommend 10 similar movies.
      Return JSON like:
      [
        {"title": "Movie 1"},
        {"title": "Movie 2"},
        ...
      ]
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    const data = await response.json();
    const movies = JSON.parse(data.candidates[0].content.parts[0].text);

    res.status(200).json(movies);
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Gemini API failed" });
  }
}
