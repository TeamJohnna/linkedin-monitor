# LinkedIn Monitor - Setup & Deployment Guide

## ✅ Prerequisites

Before deploying, make sure you have:

1. **GitHub Account** - for code repository
2. **Vercel Account** - for hosting (free tier)
3. **Gmail Account(s)** - where you want notifications sent
4. **LinkedIn Account(s)** - the accounts you want to monitor

---

## 📋 Step 1: Prepare Your Credentials

### Gmail App Password Setup

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** in the left sidebar
3. Enable **2-Step Verification** (if not already enabled)
4. Go back to Security and click **App passwords**
5. Select **Mail** and **Windows PC** (or your device)
6. Click **Generate**
7. **Copy the 16-character password** - you'll need this

**Note:** Keep this password safe - you'll enter it in the dashboard

---

## 🚀 Step 2: Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)

1. **Create a GitHub Repository**
   - Go to [github.com/new](https://github.com/new)
   - Name it `linkedin-monitor`
   - Clone it to your computer
   - Copy these files into the repo:
     - `server.js`
     - `package.json`
     - `public/index.html`
   - Push to GitHub:
     ```bash
     git add .
     git commit -m "Initial commit"
     git push origin main
     ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click **New Project**
   - Select your GitHub repo `linkedin-monitor`
   - Click **Deploy**
   - Wait for deployment to complete (2-3 minutes)
   - Your app will be live at something like: `linkedin-monitor.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# In your project directory
vercel

# Follow the prompts and Vercel will deploy automatically
```

---

## 🎯 Step 3: How to Use Your Dashboard

1. **Open your deployed app**
   - Go to your Vercel URL (e.g., `https://linkedin-monitor.vercel.app`)

2. **Add LinkedIn Accounts**
   - Fill in the form with:
     - **LinkedIn Email**: Your LinkedIn login email
     - **LinkedIn Password**: Your LinkedIn password
     - **Notification Email**: Gmail address where you want alerts
     - **Gmail App Password**: The 16-character password from Step 1
   - Click **Add Account**

3. **Monitoring is Automatic**
   - Once added, the app checks every 10 minutes
   - When someone in your connections posts about:
     - HRIS
     - Payroll System
     - Managed Services
     - Payroll Outsourcing
     - Sprout Solutions
   - You'll get an email notification immediately!

4. **Manage Accounts**
   - **Pause/Resume**: Stop monitoring temporarily
   - **Delete**: Remove an account
   - **Check Now**: Manually trigger a check right away

---

## ⚙️ How It Works

```
Every 10 minutes:
1. Connect to LinkedIn using your credentials
2. Check your connections' feed for posts
3. Search for keywords in post content
4. If found → Send you an email with details
5. Track which posts were already notified (no duplicates)
```

---

## 🔒 Security Notes

- **Credentials are stored securely** in Vercel's environment
- **Passwords never leave your server**
- **Gmail app passwords** are safer than actual passwords
- All data stored locally in JSON format

---

## 🐛 Troubleshooting

### "Monitoring not working"
- Check that the account is **Active** (not Paused)
- Click **Check Now** to manually trigger a check
- Make sure Gmail App Password is correct (16 characters)

### "Not receiving emails"
- Verify Gmail address is correct
- Check spam/promotions folder
- Make sure Gmail 2-Step Verification is enabled
- Verify the App Password is entered correctly

### "LinkedIn login fails"
- Make sure password is correct
- LinkedIn may require additional verification - check your email
- 2FA on LinkedIn might block automated login

### "App is slow"
- Puppeteer takes 30-60 seconds per check (normal)
- Multiple accounts = longer checks
- This is expected behavior

---

## 📝 Monitoring Keywords

Currently monitoring for:
- `hris`
- `payroll system`
- `managed services`
- `payroll outsourcing`
- `sprout solutions`

To change keywords, edit the `KEYWORDS` array in `server.js` and redeploy.

---

## 💡 Tips & Best Practices

1. **Multiple Accounts**: Add all your LinkedIn accounts to monitor them all from one dashboard
2. **Different Gmail Addresses**: Each account can send to a different Gmail
3. **Regular Checks**: Manually click "Check Now" if you need immediate results
4. **Pause During Vacation**: Pause accounts when you don't need notifications

---

## 🔄 Updating the App

If you want to update:

1. Edit files locally
2. Commit and push to GitHub
3. Vercel auto-deploys (or redeploy manually)

---

## 📞 Support

If something breaks:
1. Check the browser console (F12) for errors
2. Check Vercel logs (Vercel Dashboard → Function Logs)
3. Make sure all credentials are entered correctly

---

## 🎉 You're All Set!

Your LinkedIn monitoring app is now running 24/7 on Vercel.
You'll get email notifications whenever your connections mention the keywords you're tracking.

Happy monitoring! 🚀
