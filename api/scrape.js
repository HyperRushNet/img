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

    // Verzamel alle <script> tags en hun inhoud
    const scripts = [];
    $("script").each((i, el) => {
      const scriptContent = $(el).html();
      scripts.push(scriptContent);
    });

    // Verzamel alle <style> tags en hun inhoud
    const styles = [];
    $("style").each((i, el) => {
      const styleContent = $(el).html();
      styles.push(styleContent);
    });

    // Verzamel alle externe CSS-bestanden in <link> tags
    const externalStyles = [];
    $("link[rel='stylesheet']").each((i, el) => {
      const href = $(el).attr("href");
      externalStyles.push(href);
    });

    // Verzamel alle externe JavaScript-bestanden in <script> tags
    const externalScripts = [];
    $("script[src]").each((i, el) => {
      const src = $(el).attr("src");
      externalScripts.push(src);
    });

    // Structuur de verzamelde gegevens
    const scrapedData = {
      title,
      description,
      keywords,
      htmlContent,       // Hele HTML van de pagina
      scripts,           // Inline JavaScript-inhoud
      styles,            // Inline CSS-inhoud
      externalStyles,    // Externe CSS-bestanden
      externalScripts,   // Externe JavaScript-bestanden
    };

    // Stuur het antwoord terug naar de gebruiker
    res.status(200).json(scrapedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch or process the page." });
  }
}
