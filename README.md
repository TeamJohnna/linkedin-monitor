# 🚀 LinkedIn Monitor - Quick Start Guide

## What You're Getting

A **multi-account LinkedIn monitoring tool** that:
- ✅ Monitors 5 keywords across multiple LinkedIn accounts
- ✅ Checks every 10 minutes (24/7)
- ✅ Sends email notifications when posts match
- ✅ Tracks posts to avoid duplicate alerts
- ✅ Beautiful web dashboard to manage everything
- ✅ Free hosting on Vercel

**Keywords monitored:**
- HRIS
- Payroll System
- Managed Services
- Payroll Outsourcing
- Sprout Solutions

---

## 📦 Files Included

```
linkedin-monitor/
├── server.js                 # Main app (Express + Puppeteer)
├── public/
│   └── index.html           # Dashboard UI
├── package.json             # Dependencies
├── vercel.json              # Vercel config
├── .gitignore               # Git ignore file
├── DEPLOYMENT.md            # Detailed setup guide
└── README.md                # This file
```

---

## ⚡ Quick Setup (5 Minutes)

### 1. Get Gmail App Password
```
1. Go to myaccount.google.com
2. Click Security
3. Enable 2-Step Verification (if not done)
4. Click App passwords
5. Select Mail + Your Device
6. Copy the 16-character password
```

### 2. Create GitHub Repo & Deploy
```bash
# On your computer:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/linkedin-monitor.git
git push -u origin main
```

Then:
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repo
4. Click "Deploy"
5. Wait 2-3 minutes
6. Get your live URL! 🎉

### 3. Add Your LinkedIn Accounts
1. Open your Vercel URL in browser
2. Fill in the form:
   - LinkedIn email: your@linkedin.com
   - LinkedIn password: your password
   - Notification email: your@gmail.com
   - Gmail app password: 16-character password from step 1
3. Click "Add Account"
4. Done! ✅

---

## 📧 What Happens When a Post Matches

You get an email like this:

```
Subject: LinkedIn Alert: HRIS, Payroll System

LinkedIn Post Alert

Account: your@linkedin.com
Author: John Doe
Posted: Today at 2:45 PM
Matched Keywords: HRIS, Payroll System

[Post content preview...]

View on LinkedIn →
```

---

## 🎮 Dashboard Features

**View Your Accounts**
- See all monitored accounts
- Active/Paused status
- Creation date

**Pause/Resume**
- Stop monitoring temporarily
- Resume anytime

**Delete**
- Remove accounts you don't want to monitor

**Check Now**
- Manually trigger a monitoring check
- See results immediately (vs waiting 10 minutes)

**Refresh**
- Update the account list

---

## 🔧 Customization

### Change Monitoring Keywords

Edit `server.js` line 10:
```javascript
const KEYWORDS = ['hris', 'payroll system', 'managed services', 'payroll outsourcing', 'sprout solutions'];
```

Change to whatever you want, then redeploy.

### Change Check Frequency

Edit `server.js` line 234:
```javascript
cron.schedule('*/10 * * * *', async () => {  // Currently: every 10 minutes
```

Common options:
- `'*/5 * * * *'` = every 5 minutes
- `'*/30 * * * *'` = every 30 minutes
- `'0 * * * *'` = every hour

### Multiple Notification Emails

Each LinkedIn account can send to a different Gmail - just add the notifications as you setup accounts!

---

## 🔒 Security

✅ **Your passwords are safe because:**
- They're stored only in Vercel's secure servers
- Never transmitted to third parties
- Only used to login to LinkedIn
- Deleted when you remove the account

✅ **Gmail App Passwords are secure because:**
- Can only send emails (not read emails)
- Can't change your Gmail password
- Can be revoked anytime
- Better than sharing your real Gmail password

---

## ⚠️ Important Notes

1. **LinkedIn 2FA**: If your LinkedIn has 2-factor authentication, you might need to approve the first login manually
2. **Check Logs**: If something breaks, check Vercel Function Logs for errors
3. **Email Spam**: Check spam folder if emails don't arrive
4. **Free Tier Limits**: Vercel free tier is enough for this app

---

## 🐛 Common Issues

**"My accounts won't save"**
- Refresh the page
- Check browser console (F12) for errors
- Try adding one account at a time

**"Not getting emails"**
- Check Gmail app password is correct (16 chars)
- Verify notification email address
- Check spam/promotions folder

**"LinkedIn login fails"**
- Make sure your password is correct
- LinkedIn may block automated logins - check your LinkedIn notifications
- Try pausing, then resuming the account

**"Still not working?"**
- Check Vercel logs: Vercel Dashboard → Your Project → Function Logs
- Most errors are password-related

---

## 📱 Access From Anywhere

Your dashboard is on the web - access it from:
- Computer: https://your-app.vercel.app
- Phone: https://your-app.vercel.app
- Tablet: https://your-app.vercel.app

It works on any device with a browser!

---

## 🎯 Next Steps

1. ✅ Get Gmail App Password
2. ✅ Deploy to Vercel
3. ✅ Add your LinkedIn accounts
4. ✅ Watch for emails!
5. ✅ Add more accounts as needed

---

## 💡 Pro Tips

- **Multiple Accounts**: You can monitor all your LinkedIn accounts from one dashboard
- **Test First**: Try adding one account, then watch for the first email
- **Adjust Keywords**: Change keywords anytime by editing server.js
- **Schedule Wisely**: Pause during meetings/vacation to reduce notifications

---

## 🎉 You're Ready!

Your LinkedIn monitoring app is ready to deploy. Follow the Quick Setup steps above and you'll be live in minutes!

**Questions?** Check DEPLOYMENT.md for detailed instructions.

Happy monitoring! 🚀
