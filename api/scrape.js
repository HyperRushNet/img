import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "Missing URL parameter" });
    }

    // Haal de pagina-inhoud op
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VercelBot/1.0)"
      }
    });

    // Laad de HTML met Cheerio
    const $ = cheerio.load(data);

    // Verzamel de metadata (titel, beschrijving, enz.)
    const title = $("head title").text().trim();
    const description = $("meta[name='description']").attr("content") || "No description available";
    const keywords = $("meta[name='keywords']").attr("content") || "No keywords available";

    // Haal **alle tekst** op, maar negeer HTML-tags
    const mainContentText = $("body").text().trim();

    // Structuur de verzamelde gegevens
    const scrapedData = {
      title,
      description,
      keywords,
      mainContentText,  // Alleen platte tekst van de pagina
    };

    // Stuur het antwoord terug naar de gebruiker
    res.status(200).json(scrapedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch or process the page." });
  }
}
