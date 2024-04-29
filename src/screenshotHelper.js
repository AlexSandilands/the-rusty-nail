const puppeteer = require('puppeteer');

const cellsSelector = '#\\30-scrollable > div:nth-child(2)';
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function captureGoogleSheet(sheetUrl, fullPage) {
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--start-maximized'
        ]
    });

    const page = await browser.newPage();

    // Set viewport to a large size to capture most sheets without scrolling
    await page.setViewport({ width: 0, height: 0 });
    await page.goto(sheetUrl, { waitUntil: 'networkidle2' });

    // Get the element of the cells of the sheet, no labels or menus etc
    const element = await page.waitForSelector(cellsSelector, { visible: true });

    if (!fullPage && element) {
        
        // Click in the middle of the sheet to move the selected cell out of the screenshot
        await page.click(cellsSelector, { clickCount: 1, delay: 100 });

        // Take a picture of the area using hard coded width and height
        const screenshotBuffer = await element.screenshot({
            // path: 'screenshot.png',
            clip: {
                x: 0,
                y: 0,
                width: 1600,
                height: 350
            }
        });

        console.log("Clip screenshot taken");

        await browser.close();
        return screenshotBuffer;

    } else {
        
        // Fallback to full page screenshot if the specific area is not found
        const screenshotBuffer = await page.screenshot({ 
            // path: 'screenshot.png',
            fullPage: true
        });

        console.log("Full page screenshot taken");

        await browser.close();
        return screenshotBuffer;
    }
}

module.exports = { captureGoogleSheet };