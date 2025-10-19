const puppeteer = require('puppeteer');
const ScreenshotSize = require('./constants');

// Try more specific grid containers before generic fallbacks
const gridSelectors = [
    '#waffle-grid-container div[role="grid"]',
    '#waffle-grid-container',
];

// Attempt selectors in order until one resolves
async function waitForSelectorFromList(page, selectors) {
    for (const selector of selectors) {
        try {
            const handle = await page.waitForSelector(selector, { visible: true, timeout: 8000 });
            return handle;
        } catch (error) {
            // Ignore and try the next selector
        }
    }

    return null;
}

// Resolve the scrollable sheet body; fall back to full grid if structure changes
async function findSheetBody(page) {
    
    const gridHandle = await waitForSelectorFromList(page, gridSelectors);

    if (!gridHandle) {
        throw new Error('Could not locate the sheet grid');
    }

    let gridElement = gridHandle;
    const scrollableBodySelector = 'div[id$="-scrollable"] > div:nth-child(2)';
    const scrollableBody = await gridElement.$(scrollableBodySelector);

    if (scrollableBody) {
        return scrollableBody;
    }

    console.warn('Falling back to entire grid element; headers may be included.');
    return gridElement;
}

async function captureGoogleSheet(sheetUrl, screenshotSize) {
    const browser = await puppeteer.launch({
        defaultViewport: null,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto(sheetUrl, { waitUntil: 'networkidle2' });

        // Target grid content without headers or menus
        const element = await findSheetBody(page);

        const box = await element.boundingBox();
        const xPos = box.x + box.width - 20;
        const yPos = box.y + 20;

        // Deselect the initial active cell to avoid selection highlights
        await page.mouse.click(xPos, yPos, { clickCount: 1, delay: 100 });

        if (screenshotSize !== ScreenshotSize.FULL) {
            const screenshotBuffer = await element.screenshot({
                clip: {
                    x: 0,
                    y: 0,
                    width: 1600,
                    height: screenshotSize
                }
            });

            console.log((screenshotSize === ScreenshotSize.SMALL ? 'Small' : 'Large') + ' screenshot taken');
            return screenshotBuffer;
        }

        const screenshotBuffer = await page.screenshot({ fullPage: true });
        console.log('Full page screenshot taken');
        return screenshotBuffer;
    } finally {
        await browser.close();
    }
}

module.exports = { captureGoogleSheet };
