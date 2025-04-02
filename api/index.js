const chromium = require("@sparticuz/chromium");
const playwright = require("playwright-core");

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Missing URL parameter" });
  }

  try {
    const browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "load", timeout: 60000 });

    const content = await page.evaluate(() => document.body.innerText);

    await browser.close();
    return res.json({ url, content });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
