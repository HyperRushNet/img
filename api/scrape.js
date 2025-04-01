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

    // Filter: Verzamel alleen belangrijke <script> inhoud
    const scripts = [];
    $("script").each((i, el) => {
      const scriptContent = $(el).html();
      // Alleen inline scripts zonder externe bronnen
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

    // Filter: Verzamel alleen relevante externe stijlen (geen externe analytics of ad-services)
    const externalStyles = [];
    $("link[rel='stylesheet']").each((i, el) => {
      const href = $(el).attr("href");
      if (href && !href.includes("analytics") && !href.includes("ads")) {
        externalStyles.push(href);
      }
    });

    // Filter: Verzamel alleen relevante externe scripts
    const externalScripts = [];
    $("script[src]").each((i, el) => {
      const src = $(el).attr("src");
      if (src && !src.includes("analytics") && !src.includes("ads")) {
        externalScripts.push(src);
      }
    });

    // Verzamel de belangrijkste inhoud zoals tekst uit paragrafen, headers, en lijsten
    const mainContent = {
      paragraphs: [],
      headers: [],
      lists: []
    };

    // Haal tekst uit paragrafen (<p>) en voeg toe
    $("p").each((i, el) => {
      mainContent.paragraphs.push($(el).text().trim());
    });

    // Haal tekst uit headers (<h1>, <h2>, <h3>, ...) en voeg toe
    $("h1, h2, h3, h4, h5, h6").each((i, el) => {
      mainContent.headers.push($(el).text().trim());
    });

    // Haal tekst uit ongeordende en geordende lijsten (<ul>, <ol>) en voeg toe
    $("ul, ol").each((i, el) => {
      const listItems = [];
      $(el).find("li").each((j, li) => {
        listItems.push($(li).text().trim());
      });
      mainContent.lists.push(listItems);
    });

    // Structuur de verzamelde gegevens met filters
    const scrapedData = {
      title,
      description,
      keywords,
      htmlContent,       // Hele HTML van de pagina
      scripts,           // Inline JavaScript-inhoud
      styles,            // Inline CSS-inhoud
      externalStyles,    // Externe CSS-bestanden
      externalScripts,   // Externe JavaScript-bestanden
      mainContent        // Hoofdinhoud van de pagina (paragrafen, headers, lijsten)
    };

    // Stuur het antwoord terug naar de gebruiker
    res.status(200).json(scrapedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch or process the page." });
  }
}
