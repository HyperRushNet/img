  const chromium = require('@sparticuz/chromium');
  const puppeteer = require('puppeteer-core');

  module.exports = async (req, res) => {
    let browser = null;

    try {
      const executablePath = await chromium.executablePath();

      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless,
      });

      const page = await browser.newPage();
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({ error: 'URL is vereist' });
      }

      await page.goto(url, { waitUntil: 'networkidle2' });
      const screenshot = await page.screenshot({ fullPage: true });

      res.setHeader('Content-Type', 'image/png');
      res.status(200).end(screenshot);
    } catch (error) {
      console.error('Fout bij het maken van de screenshot:', error);
      res.status(500).json({ error: 'Interne serverfout' });
    } finally {
      if (browser !== null) {
        await browser.close();
      }
    }
  };
