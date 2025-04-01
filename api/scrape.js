import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "Missing URL parameter" });
    }

    // Start Puppeteer en open de browser
    const browser = await puppeteer.launch({
      headless: true, // Zorg ervoor dat de browser niet zichtbaar is
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Nodig voor sommige serverless omgevingen
    });

    const page = await browser.newPage();
    
    // Ga naar de opgegeven URL
    await page.goto(url, {
      waitUntil: 'domcontentloaded', // Wacht tot de DOM geladen is
    });

    // Haal de HTML-inhoud op nadat de pagina geladen is
    const html = await page.content();

    // Sluit de browser
    await browser.close();

    // Gebruik Cheerio om de HTML-inhoud te analyseren
    const $ = require('cheerio').load(html);

    // Verzamel de metadata (titel, beschrijving, enz.)
    const title = $("head title").text().trim();
    const description = $("meta[name='description']").attr("content") || "No description available";
    const keywords = $("meta[name='keywords']").attr("content") || "No keywords available";

    // Haal de platte tekst op uit de body, zonder HTML-tags
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
    console.error("Error scraping the page:", error);
    res.status(500).json({ error: "Failed to fetch or process the page." });
  }
}
