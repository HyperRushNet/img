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

    // Verzamel de volledige HTML-inhoud
    const htmlContent = $.html();  // Hele HTML van de pagina

    // Verzamel de metadata (titel, beschrijving, enz.)
    const title = $("head title").text().trim();
    const description = $("meta[name='description']").attr("content") || "No description available";
    const keywords = $("meta[name='keywords']").attr("content") || "No keywords available";

    // Filter: Verzamel alleen belangrijke <script> inhoud (zoals eerder)
    const scripts = [];
    $("script").each((i, el) => {
      const scriptContent = $(el).html();
      if (scriptContent && !$(el).attr("src")) {
        scripts.push(scriptContent);
      }
    });

    // Filter: Verzamel alleen belangrijke <style> inhoud
    const styles = [];
    $("style").each((i, el) => {
      const styleContent = $(el).html();
      if (styleContent) {
        styles.push(styleContent);
      }
    });

    // Verzamel alleen **platte tekst** van de pagina (zonder HTML-tags)
    const mainContentText = [];
    
    // Haal tekst uit de belangrijkste elementen (hoofdinhoud)
    $("body").each((i, el) => {
      // Haal alleen de tekst uit de body van de pagina
      const bodyText = $(el).text().trim();
      if (bodyText) {
        mainContentText.push(bodyText);
      }
    });

    // Structuur de verzamelde gegevens met filters
    const scrapedData = {
      title,
      description,
      keywords,
      htmlContent,       // Hele HTML van de pagina
      scripts,           // Inline JavaScript-inhoud
      styles,            // Inline CSS-inhoud
      mainContentText    // Platte tekstinhoud van de pagina
    };

    // Stuur het antwoord terug naar de gebruiker
    res.status(200).json(scrapedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch or process the page." });
  }
}
