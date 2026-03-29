/**
 * Quick Chrome launch test
 */
import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function test() {
  console.log('[test] Attempting to launch Chrome headlessly...');
  console.log('[test] Path:', CHROME_PATH);
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: CHROME_PATH,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox', 
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--single-process',
      ],
      timeout: 15000,
    });
    
    console.log('[test] Chrome launched successfully!');
    
    const version = await browser.version();
    console.log('[test] Browser version:', version);
    
    const page = await browser.newPage();
    await page.setContent('<h1>Hello PDF</h1>');
    
    const pdf = await page.pdf({ format: 'A4' });
    console.log('[test] PDF size:', pdf.length, 'bytes');
    
    await browser.close();
    console.log('[test] Browser closed. Test passed!');
    
  } catch (err) {
    console.error('[test] FAILED:', err.message);
    process.exit(1);
  }
}

test();
