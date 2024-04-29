const puppeteer = require('puppeteer');

const cellsSelector = '#\\30-scrollable > div:nth-child(2)';

async function captureGoogleSheet(sheetUrl) {
    
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport to a large size to capture most sheets without scrolling
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(sheetUrl, { waitUntil: 'networkidle2' });

    // Get the element of the cells of the sheet, no labels or menus etc
    const element = await page.waitForSelector(cellsSelector, { visible: true });

    if (element) {
        
        // Click in the middle of the sheet to move the selected cell out of the screenshot
        await page.click(cellsSelector, { clickCount: 1, delay: 100 });

        // Take a picture of the area using hard coded width and height and the x/y of the bounding box of the selected element
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