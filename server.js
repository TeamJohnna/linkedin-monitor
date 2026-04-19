const express = require('express');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Vercel /tmp is the only writable directory
const DATA_FILE = path.join('/tmp', 'data.json'); 
const KEYWORDS = ['hris', 'payroll system', 'managed services', 'payroll outsourcing', 'sprout solutions'];

// --- Helper Functions ---

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

// Fixed: Added back the missing email function
async function sendNotification(gmailAddress, appPassword, accountEmail, post) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailAddress, pass: appPassword }
    });
    
    const emailContent = `
      <h2>LinkedIn Post Alert</h2>
      <p><strong>Account:</strong> ${accountEmail}</p>
      <p><strong>Matched Keywords:</strong> ${post.matchedKeywords.join(', ')}</p>
      <hr>
      <p>${post.content.substring(0, 500)}...</p>
      <p><a href="${post.url}" target="_blank">View on LinkedIn</a></p>
    `;

    await transporter.sendMail({
      from: gmailAddress,
      to: gmailAddress,
      subject: `LinkedIn Alert: ${post.matchedKeywords.join(', ')}`,
      html: emailContent
    });
    console.log(`Email sent for post by ${post.author}`);
  } catch (error) {
    console.error('Email Error:', error);
  }
}

async function monitorLinkedInAccount(account) {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
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
        post.matchedKeywords = matched;
        await sendNotification(account.notificationEmail, account.appPassword, account.linkedinEmail, post);
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

// --- API Routes ---

app.get('/api/accounts', (req, res) => res.json(readData().accounts));

app.post('/api/accounts', (req, res) => {
  const data = readData();
  const newAccount = { ...req.body, id: Date.now().toString(), enabled: true };
  data.accounts.push(newAccount);
  writeData(data);
  res.json({ message: 'Added', id: newAccount.id });
});

app.post('/api/monitor-now', async (req, res) => {
  const data = readData();
  for (const account of data.accounts) {
    if (account.enabled) await monitorLinkedInAccount(account);
  }
  res.json({ message: 'Monitoring check completed' });
});

initializeDataFile();
module.exports = app;
