const express = require('express');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Configuration
const DATA_FILE = path.join(__dirname, 'data.json');
const KEYWORDS = ['hris', 'payroll system', 'managed services', 'payroll outsourcing', 'sprout solutions'];

// Initialize data file
function initializeDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({
      accounts: [],
      notifiedPosts: []
    }, null, 2));
  }
}

// Read/write data
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

// Email setup
function createTransporter(gmailAddress, appPassword) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailAddress,
      pass: appPassword
    }
  });
}

// Send email notification
async function sendNotification(gmailAddress, appPassword, accountEmail, post) {
  try {
    const transporter = createTransporter(gmailAddress, appPassword);
    
    const emailContent = `
      <h2>LinkedIn Post Alert</h2>
      <p><strong>Account:</strong> ${accountEmail}</p>
      <p><strong>Author:</strong> ${post.author}</p>
      <p><strong>Posted:</strong> ${new Date(post.timestamp).toLocaleString()}</p>
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

    console.log(`Email sent to ${gmailAddress} for post by ${post.author}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Monitor LinkedIn for a single account
async function monitorLinkedInAccount(account) {
  let browser;
  try {
    console.log(`Starting monitoring for ${account.email}`);
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Login to LinkedIn
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });
    
    await page.type('input[name="session_key"]', account.linkedinEmail);
    await page.type('input[name="session_password"]', account.linkedinPassword);
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Go to feed
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'networkidle2' });

    // Scroll and collect posts
    const posts = await page.evaluate(() => {
      const postElements = document.querySelectorAll('[data-id*="urn:li:activity"]');
      const postsData = [];

      postElements.forEach(element => {
        const postText = element.innerText || '';
        const authorElement = element.querySelector('a[href*="/in/"]');
        const author = authorElement ? authorElement.innerText : 'Unknown';
        const postUrl = element.querySelector('a[href*="/feed/update/"]')?.href || '';

        postsData.push({
          id: element.getAttribute('data-id'),
          author,
          content: postText,
          url: postUrl,
          timestamp: new Date().toISOString()
        });
      });

      return postsData;
    });

    await browser.close();

    // Check for keywords
    const data = readData();
    for (const post of posts) {
      const postKey = `${account.email}-${post.id}`;
      
      if (data.notifiedPosts.includes(postKey)) {
        continue; // Already notified
      }

      const matchedKeywords = KEYWORDS.filter(keyword =>
        post.content.toLowerCase().includes(keyword.toLowerCase())
      );

      if (matchedKeywords.length > 0) {
        post.matchedKeywords = matchedKeywords;
        
        // Send email
        await sendNotification(
          account.notificationEmail,
          account.appPassword,
          account.linkedinEmail,
          post
        );

        // Mark as notified
        data.notifiedPosts.push(postKey);
        writeData(data);
      }
    }

  } catch (error) {
    console.error(`Error monitoring ${account.email}:`, error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Schedule monitoring for all accounts
function startMonitoring() {
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log('Starting scheduled check at', new Date().toISOString());
    const data = readData();
    
    for (const account of data.accounts) {
      if (account.enabled) {
        await monitorLinkedInAccount(account);
      }
    }
  });

  console.log('Monitoring scheduler started');
}

// API Routes

// Get all accounts
app.get('/api/accounts', (req, res) => {
  const data = readData();
  const safeAccounts = data.accounts.map(acc => ({
    ...acc,
    linkedinPassword: '***',
    appPassword: '***'
  }));
  res.json(safeAccounts);
});

// Add new account
app.post('/api/accounts', (req, res) => {
  const { linkedinEmail, linkedinPassword, notificationEmail, appPassword } = req.body;

  if (!linkedinEmail || !linkedinPassword || !notificationEmail || !appPassword) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const data = readData();
  const newAccount = {
    id: Date.now().toString(),
    email: linkedinEmail,
    linkedinEmail,
    linkedinPassword,
    notificationEmail,
    appPassword,
    enabled: true,
    createdAt: new Date().toISOString()
  };

  data.accounts.push(newAccount);
  writeData(data);

  res.json({ message: 'Account added successfully', id: newAccount.id });
});

// Update account
app.put('/api/accounts/:id', (req, res) => {
  const { id } = req.params;
  const { enabled } = req.body;

  const data = readData();
  const account = data.accounts.find(a => a.id === id);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  account.enabled = enabled;
  writeData(data);

  res.json({ message: 'Account updated' });
});

// Delete account
app.delete('/api/accounts/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();

  data.accounts = data.accounts.filter(a => a.id !== id);
  writeData(data);

  res.json({ message: 'Account deleted' });
});

// Manual trigger monitoring
app.post('/api/monitor-now', async (req, res) => {
  const data = readData();
  
  for (const account of data.accounts) {
    if (account.enabled) {
      await monitorLinkedInAccount(account);
    }
  }

  res.json({ message: 'Monitoring started' });
});

// Initialize and start
initializeDataFile();
startMonitoring();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LinkedIn Monitor running on port ${PORT}`);
});
