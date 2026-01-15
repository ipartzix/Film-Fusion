export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const { query } = req.body;
        const prompt = `Recommend 10 movies similar to "${query}". Return ONLY a JSON array of objects with a "title" key. Example: [{"title": "Inception"}, {"title": "Interstellar"}]`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        response_mime_type: "application/json"
                    },
                }),
            }
        );

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        // CLEANING LOGIC: Removes any markdown backticks if Gemini includes them
        let rawText = data.candidates[0].content.parts[0].text;
        const cleanJson = rawText.replace(/```json|```/g, "").trim();

        const movies = JSON.parse(cleanJson);
        res.status(200).json(movies);
    } catch (err) {
        console.error("Gemini error:", err);
        res.status(500).json({ error: "Gemini API failed to parse response" });
    }
}