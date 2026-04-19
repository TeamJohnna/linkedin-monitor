const express = require('express');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join('/tmp', 'data.json'); // Use /tmp for temporary writing
const KEYWORDS = ['hris', 'payroll system', 'managed services', 'payroll outsourcing', 'sprout solutions'];

// Initialize data in the writable /tmp directory
function initializeDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ accounts: [], notifiedPosts: [] }, null, 2));
  }
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { accounts: [], notifiedPosts: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function monitorLinkedInAccount(account) {
  let browser;
  try {
    // Vercel-specific Browser Launch
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    await page.goto('https://linkedin.com', { waitUntil: 'networkidle2' });
    await page.type('input[name="session_key"]', account.linkedinEmail);
    await page.type('input[name="session_password"]', account.linkedinPassword);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await page.goto('https://linkedin.com', { waitUntil: 'networkidle2' });

    const posts = await page.evaluate(() => {
      const postElements = document.querySelectorAll('[data-id*="urn:li:activity"]');
      return Array.from(postElements).map(element => ({
        id: element.getAttribute('data-id'),
        author: element.querySelector('a[href*="/in/"]')?.innerText || 'Unknown',
        content: element.innerText || '',
        url: element.querySelector('a[href*="/feed/update/"]')?.href || '',
        timestamp: new Date().toISOString()
      }));
    });

    const data = readData();
    for (const post of posts) {
      const postKey = `${account.email}-${post.id}`;
      if (data.notifiedPosts.includes(postKey)) continue;

      const matched = KEYWORDS.filter(k => post.content.toLowerCase().includes(k.toLowerCase()));
      if (matched.length > 0) {
        // Send Email logic (omitted for brevity, keep your original sendNotification here)
        data.notifiedPosts.push(postKey);
        writeData(data);
      }
    }
  } catch (err) {
    console.error('Scraping error:', err);
  } finally {
    if (browser) await browser.close();
  }
}

// Routes
app.post('/api/monitor-now', async (req, res) => {
  const data = readData();
  for (const account of data.accounts) {
    if (account.enabled) await monitorLinkedInAccount(account);
  }
  res.json({ message: 'Monitoring check completed' });
});

// Other API routes (accounts CRUD) remain the same...

initializeDataFile();
module.exports = app; // Export for Vercel
