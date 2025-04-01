const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto('https://www.google.com');
        await page.type('input[name=q]', 'site:example.com');
        await page.keyboard.press('Enter');
        await page.waitForSelector('#result-stats');
        const resultStats = await page.$eval('#result-stats', el => el.innerText);
        await browser.close();

        // Stuur het resultaat terug naar de client
        res.status(200).send(resultStats);
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).send('Internal Server Error');
    }
};
