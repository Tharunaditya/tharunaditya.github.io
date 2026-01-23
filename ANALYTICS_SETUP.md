# 📊 Google Analytics 4 Setup Guide

## ✅ What's Already Done
- Google Analytics 4 tracking code added to `index.html`
- Privacy-friendly settings enabled (IP anonymization, secure cookies)

## 🚀 Next Steps to Complete Setup

### 1. Create Google Analytics Account
1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click "Start measuring"
4. Fill in:
   - **Account name**: "Tharunaditya Portfolio"
   - **Property name**: "tharunaditya.github.io"
   - **Time zone**: Your timezone
   - **Currency**: Your currency

### 2. Get Your Measurement ID
1. After creating the property, you'll see a **Measurement ID** (format: `G-XXXXXXXXXX`)
2. Copy this ID

### 3. Update Your Website
1. Open `index.html`
2. Find **BOTH** instances of `G-XXXXXXXXXX` in the Google Analytics script
3. Replace with your actual Measurement ID
4. Save the file

**Example:**
```html
<!-- Before -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
gtag('config', 'G-XXXXXXXXXX', {

<!-- After (with your actual ID) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ9"></script>
gtag('config', 'G-ABC123XYZ9', {
```

### 4. Deploy and Verify
1. Commit and push your changes
2. Wait 5-10 minutes for deployment
3. Visit your live site
4. Go to Google Analytics → Reports → Realtime
5. You should see yourself as an active user!

### 5. Configure Events (Optional)
Track specific user actions by adding these to `assets/js/main.js`:

```javascript
// Track project views
function trackProjectView(projectName) {
    gtag('event', 'view_project', {
        'project_name': projectName
    });
}

// Track downloads
function trackDownload(fileName) {
    gtag('event', 'download', {
        'file_name': fileName
    });
}

// Track contact form submissions
function trackFormSubmit() {
    gtag('event', 'form_submit', {
        'form_name': 'contact'
    });
}

// Track outbound links
function trackOutboundLink(url) {
    gtag('event', 'click', {
        'event_category': 'outbound',
        'event_label': url
    });
}
```

## 📈 What You'll Be Able to Track

### Automatic Tracking (No code needed)
- Page views
- User sessions
- Geographic location
- Device type (mobile/desktop/tablet)
- Browser and OS
- Referral sources
- Session duration
- Bounce rate

### Custom Events (Optional - requires code)
- Project card clicks
- Resume downloads
- Contact form submissions
- Social media link clicks
- Theme toggle (dark/light mode)
- Navigation clicks

## 🎯 Recommended Reports to Check Weekly
1. **Realtime** → See live visitors
2. **User Acquisition** → Where visitors come from
3. **Pages and Screens** → Most popular pages
4. **Tech Details** → Devices and browsers used
5. **Events** → Track custom interactions

## 🔒 Privacy Features Enabled
- ✅ IP Anonymization (GDPR compliant)
- ✅ Secure cookies (SameSite=None;Secure)
- ✅ No personal data collection

## 🚨 Important Notes
- Analytics data appears within 24-48 hours (Realtime is instant)
- Keep your Measurement ID private (don't share publicly)
- Consider adding a Privacy Policy page mentioning Google Analytics
- For EU visitors, you may need a cookie consent banner (optional for personal portfolios)

## 🔗 Useful Resources
- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [Event Tracking Guide](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [GA4 Dashboard](https://analytics.google.com/)

---

**Status:** ⚠️ Awaiting Measurement ID replacement in `index.html`
