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

    // Haal de meta-beschrijving van de pagina (indien aanwezig)
    const description = $("meta[name='description']").attr("content") || "No description available";

    // Haal alle koppen (h1 - h6)
    const headings = [];
    $("h1, h2, h3, h4, h5, h6").each((i, el) => {
      headings.push($(el).text().trim());
    });

    // Haal alle paragraafteksten (p)
    const paragraphs = [];
    $("p").each((i, el) => {
      paragraphs.push($(el).text().trim());
    });

    // Haal alle links (a)
    const links = [];
    $("a").each((i, el) => {
      const href = $(el).attr("href");
      if (href) {
        links.push(href);
      }
    });

    // Haal alle afbeeldingen (img)
    const images = [];
    $("img").each((i, el) => {
      const src = $(el).attr("src");
      if (src) {
        images.push(src);
      }
    });

    // Haal tabellen (indien aanwezig)
    const tables = [];
    $("table").each((i, el) => {
      const rows = [];
      $(el).find("tr").each((i, row) => {
        const columns = [];
        $(row).find("td, th").each((i, col) => {
          columns.push($(col).text().trim());
        });
        rows.push(columns);
      });
      tables.push(rows);
    });

    // Haal schema.org-gegevens (indien aanwezig)
    const schemaData = [];
    $("script[type='application/ld+json']").each((i, el) => {
      try {
        const jsonData = JSON.parse($(el).html());
        schemaData.push(jsonData);
      } catch (e) {
        // Fout bij het parseren van JSON, negeer die
      }
    });

    // Structuur de verzamelde gegevens
    const scrapedData = {
      title,
      description,
      headings,
      paragraphs,
      links,
      images,
      tables,
      schemaData,
    };

    // Stuur het antwoord terug naar de gebruiker
    res.status(200).json(scrapedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch or process the page." });
  }
}
