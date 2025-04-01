import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "Missing URL parameter" });
    }

    // Fetch the page content
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VercelBot/1.0)"
      }
    });

    // Load HTML with Cheerio
    const $ = cheerio.load(data);

    // Extract readable text (removing scripts, styles, and non-relevant elements)
    let text = $("body")
      .find("p, h1, h2, h3, h4, h5, h6, li")
      .map((i, el) => $(el).text().trim())
      .get()
      .join("\n");

    // Basic cleanup for LLMs
    text = text.replace(/\s{2,}/g, " ").trim();

    res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch or process the page." });
  }
}
