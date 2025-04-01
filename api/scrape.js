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

    // Haal de titel van de pagina
    const title = $("head title").text().trim();

    // Haal de meta-beschchrijving van de pagina (indien aanwezig)
    const description = $("meta[name='description']").attr("content") || "No description available";

    // Verzamel arrays die in de script-tag worden gedeeld zonder specifieke naam
    const arrays = {
      scriptArrays: [],
    };

    // Haal arrays van JavaScript binnen de script tags
    $("script").each((i, el) => {
      const scriptContent = $(el).html();
      
      // Zoek naar array-declaraties zonder specifiek te weten hoe de array heet
      const arrayMatches = scriptContent.match(/\[\s*(\{.*?\}|\[.*?\])\s*\]/g); // Herken arrays van objecten of andere arrays

      if (arrayMatches) {
        arrayMatches.forEach((match) => {
          try {
            // Probeer de array te extraheren
            const extractedArray = eval(match);
            if (Array.isArray(extractedArray)) {
              arrays.scriptArrays.push(extractedArray);
            }
          } catch (e) {
            // Als de evaluatie niet werkt, sla het dan over
          }
        });
      }
    });

    // Structuur de verzamelde gegevens
    const scrapedData = {
      title,
      description,
      arrays, // Verzamel alle gevonden arrays
    };

    // Stuur het antwoord terug naar de gebruiker
    res.status(200).json(scrapedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch or process the page." });
  }
}
