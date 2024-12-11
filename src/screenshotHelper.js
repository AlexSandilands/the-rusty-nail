const puppeteer = require('puppeteer');
const ScreenshotSize = require('./constants');

const cellsSelector = '#\\30-scrollable > div:nth-child(2)';
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function captureGoogleSheet(sheetUrl, screenshotSize) {
    
    const browser = await puppeteer.launch({
        defaultViewport: null,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]
    });

    const page = await browser.newPage();

    // Set viewport to a large size to capture most sheets without scrolling
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(sheetUrl, { waitUntil: 'networkidle2' });

    // Get the element of the cells of the sheet, no labels or menus etc
    const element = await page.waitForSelector(cellsSelector, { visible: true });
    
    // Setup click position
    const box = await element.boundingBox();
    const xPos = box.x + box.width - 20;
    const yPos = box.y + 20;

    // Click so the initial selected cell is not in the screenshot
    await page.mouse.click(xPos, yPos, { clickCount: 1, delay: 100 });

    if (screenshotSize != ScreenshotSize.FULL && element) {

        // Take a picture of the area using hard coded width and parameterised height
        const screenshotBuffer = await element.screenshot({
            // path: 'screenshot.png',
            clip: {
                x: 0,
                y: 0,
                width: 1600,
                height: screenshotSize
            }
        });

        console.log((screenshotSize == ScreenshotSize.SMALL ? "Small" : "Large") + " screenshot taken");

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