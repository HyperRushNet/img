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

    // Verzamel arrays van HTML-elementen
    const arrays = {
      unorderedLists: [],
      orderedLists: [],
      tables: [],
      scriptArrays: [],
      gameArrays: [],
    };

    // Haal de ongeordende lijsten (ul) en orden ze in een array
    $("ul").each((i, el) => {
      const listItems = [];
      $(el).find("li").each((j, li) => {
        listItems.push($(li).text().trim());
      });
      arrays.unorderedLists.push(listItems);
    });

    // Haal de geordende lijsten (ol) en orden ze in een array
    $("ol").each((i, el) => {
      const listItems = [];
      $(el).find("li").each((j, li) => {
        listItems.push($(li).text().trim());
      });
      arrays.orderedLists.push(listItems);
    });

    // Haal tabellen (table) en zet ze om in een array van rijen
    $("table").each((i, el) => {
      const rows = [];
      $(el).find("tr").each((i, row) => {
        const columns = [];
        $(row).find("td, th").each((i, col) => {
          columns.push($(col).text().trim());
        });
        rows.push(columns);
      });
      arrays.tables.push(rows);
    });

    // Haal arrays van JavaScript-objecten (bijvoorbeeld games array) in <script> tags
    $("script").each((i, el) => {
      const scriptContent = $(el).html();
      
      // Zoek naar arrays van objecten zoals const games = [{title: '...', link: '...'}, ...]
      const arrayMatches = scriptContent.match(/const\s+\w+\s*=\s*\[(\{.*?\})\]/g);
      if (arrayMatches) {
        arrayMatches.forEach((match) => {
          try {
            // Probeer de array van objecten te extraheren met eval
            const extractedArray = eval(match.split('=')[1].trim());
            if (Array.isArray(extractedArray)) {
              arrays.gameArrays.push(extractedArray);
            }
          } catch (e) {
            // Als het niet kan worden geëvalueerd, sla het dan over
          }
        });
      }
    });

    // Structuur de verzamelde gegevens
    const scrapedData = {
      title,
      description,
      arrays, // Verzamel arrays van verschillende HTML-elementen en JS-objecten
    };

    // Stuur het antwoord terug naar de gebruiker
    res.status(200).json(scrapedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch or process the page." });
  }
}
