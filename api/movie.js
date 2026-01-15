export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { query } = req.body;
    const prompt = `Based on the movie "${query}", recommend 10 similar movies. Return ONLY a JSON array of objects with a "title" key.`;

    // PROFESSIONALLY SECURED: Accesses the key from the server's environment
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              // FIXED: Using correct snake_case property name
              response_mime_type: "application/json"
            },
          }),
        }
    );

    const data = await response.json();

    // Check for API-specific errors (like invalid key or quota)
    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const movies = JSON.parse(data.candidates[0].content.parts[0].text);
    res.status(200).json(movies);
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "API connection failed" });
  }
}