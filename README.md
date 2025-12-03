# Cold Email System - Frontend

Complete MVP frontend for the Cold Email System with warming, campaigns, and contact management.

## 🚀 Deploy to Render.com

### Quick Deploy (5 minutes)

1. **Push to GitHub:**
```bash
cd /mnt/user-data/outputs/frontend

git init
git add .
git commit -m "Initial frontend deployment"

# Create new repo on GitHub: https://github.com/new
# Name it: cold-email-frontend

git remote add origin https://github.com/YOUR_USERNAME/cold-email-frontend.git
git branch -M main
git push -u origin main
```

2. **Deploy on Render:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `cold-email-frontend`
   - Render will auto-detect settings from `render.yaml`
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment

3. **Done!**
   - Your frontend will be live at: `https://cold-email-frontend.onrender.com`
   - It's already connected to your backend at: `https://cold-email-system-1.onrender.com`

## 🏃 Run Locally

```bash
cd /mnt/user-data/outputs/frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📦 Project Structure

```
frontend/
├── src/
│   ├── App.jsx           # Main MVP application
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
├── render.yaml           # Render deployment config
└── .gitignore           # Git exclusions
```

## ✨ Features

### 5 Complete Pages:
1. **Dashboard** - System stats with real-time updates
2. **Warming** - Account management + warming control
3. **Contacts** - CSV import + contact database
4. **Campaigns** - Campaign creation + tracking
5. **Settings** - System configuration

### Key Features:
- ✅ Real-time stats (updates every 5s)
- ✅ Add warming accounts with SMTP/IMAP
- ✅ Start/stop warming campaigns
- ✅ CSV contact import with drag & drop
- ✅ Create cold campaigns with templates
- ✅ Personalization variables ({{firstName}}, etc.)
- ✅ Campaign analytics (sent, opened, clicked, replied)
- ✅ Modern UI with purple/blue theme
- ✅ Responsive design

## 🔧 Configuration

The frontend connects to your backend at:
```
https://cold-email-system-1.onrender.com
```

To change the backend URL, edit `src/App.jsx` line 5:
```javascript
const API_BASE_URL = 'https://your-backend-url.onrender.com';
```

## 🎨 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool (fast, modern)
- **Lucide React** - Icon library
- **Tailwind CSS** - Styling (via CDN)
- **Fetch API** - Backend communication

## 📊 API Integration

All API endpoints are integrated:
- `/health` - System health check
- `/api/warming/accounts` - Account management
- `/api/warming/campaigns/start` - Start warming
- `/api/warming/campaigns/stop` - Stop warming
- `/api/smtp/test` - Test connections
- `/api/campaigns` - Campaign CRUD
- `/api/contacts` - Contact management

## 🆓 Free Tier

Render.com free tier includes:
- ✅ 750 hours/month (enough for one app)
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ Takes ~30 sec to wake up
- ✅ Perfect for testing/demo

Upgrade to Starter ($7/month) for:
- ✅ Always-on (no sleeping)
- ✅ Faster performance
- ✅ Custom domain

## 🔄 Auto-Deploy

Every time you push to GitHub:
```bash
git add .
git commit -m "Updated feature"
git push
```

Render automatically rebuilds and redeploys (takes ~2 minutes).

## 🐛 Troubleshooting

### Build fails:
- Check Render logs for error message
- Verify all files are pushed to GitHub
- Ensure package.json has correct dependencies

### Frontend can't connect to backend:
- Verify backend URL in `src/App.jsx`
- Check CORS settings on backend
- Ensure backend is running (not sleeping)

### Styles not loading:
- Tailwind CSS loads from CDN in `index.html`
- Check browser console for errors
- Try hard refresh (Ctrl+Shift+R)

## 📱 Usage

1. **Add Warming Accounts:**
   - Go to Warming page
   - Click "Add Account"
   - Enter Gmail + app password
   - Click "Add Account"

2. **Start Warming:**
   - Set emails per day (slider)
   - Click "Start" button
   - Monitor progress in control panel

3. **Import Contacts:**
   - Go to Contacts page
   - Click "Import CSV"
   - Drag/drop CSV file
   - Contacts appear in table

4. **Create Campaign:**
   - Go to Campaigns page
   - Click "Create Campaign"
   - Fill in name, subject, body
   - Use {{firstName}}, {{company}} for personalization
   - Set daily limit
   - Click "Create"

## 🎯 Next Steps

After deployment:
1. Test all pages work
2. Add warming accounts
3. Import contacts
4. Create test campaign
5. Start warming!

## 📞 Support

- **Render Docs:** https://render.com/docs
- **Backend:** https://cold-email-system-1.onrender.com
- **GitHub:** Your repository

## 🎉 You're Ready!

Your complete cold email system is ready to deploy. Frontend + backend working together!

---

**Quick Deploy Command:**
```bash
cd /mnt/user-data/outputs/frontend
git init && git add . && git commit -m "Deploy"
# Add GitHub remote, then push
git push -u origin main
# Then deploy on Render.com
```
