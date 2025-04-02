const chromium = require('@sparticuz/chromium-min');
const puppeteer = require('puppeteer-core');

exports.handler = async (event, context) => {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.goto('https://example.com');

    // Voer hier verdere acties uit...

    await browser.close();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Succesvol uitgevoerd' }),
    };
  } catch (error) {
    if (browser !== null) {
      await browser.close();
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
