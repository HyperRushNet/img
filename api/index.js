  import chromium from '@sparticuz/chromium';
  import puppeteer from 'puppeteer-core';

  let browser = null;

  const chromeArgs = [
    '--font-render-hinting=none',
    '--no-sandbox',
    '--disable-setuid-sandbox',
  ];

  export const takeScreenshot = async (req, res) => {
    const { url } = req.query;

    if (!url) {
      res.status(400).send('URL is verplicht');
      return;
    }

    try {
      if (!browser?.isConnected()) {
        chromium.setGraphicMode = false;
        browser = await puppeteer.launch({
          args: chromeArgs,
          executablePath: await chromium.executablePath(),
          ignoreHTTPSErrors: true,
        });
      }

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const screenshot = await page.screenshot({ type: 'png', omitBackground: true });

      res.setHeader('Content-Type', 'image/png');
      res.status(200).send(screenshot);
    } catch (error) {
      res.status(500).send(`Fout bij het maken van screenshot: ${error.message}`);
    }
  };

  export default takeScreenshot;
