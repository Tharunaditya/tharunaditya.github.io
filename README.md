# Enhanced Portfolio v2.0 🚀

Modern, feature-rich portfolio website with integrated blogging capabilities, built with Jekyll and Decap CMS.

![Portfolio Preview](assets/images/portfolio-preview.png)

## ✨ Features

### 🎨 Design
- **Cyberpunk/Hacker Aesthetic** - Dark theme with neon green accents
- **Glassmorphism Effects** - Modern frosted glass cards
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - WOW.js-inspired scroll animations
- **Dark/Light Mode** - Theme toggle with localStorage persistence
- **Particles.js Background** - Interactive particle network
- **Glitch Effects** - Cyberpunk-style text animations

### 🛠️ Technical Features
- **Vanilla JavaScript** - No jQuery, pure ES6+ modules
- **Jekyll Static Site Generator** - Fast, secure, SEO-friendly
- **Decap CMS Integration** - Easy blog post management
- **GitHub Pages Deployment** - Automated CI/CD
- **GitHub API Integration** - Live repository statistics
- **Form Integration** - Formspree for contact form
- **Performance Optimized** - Lazy loading, debouncing, throttling
- **SEO Optimized** - Meta tags, structured data, sitemap
- **Accessibility** - ARIA labels, semantic HTML, keyboard navigation

### 📝 Blogging System
- **Decap CMS Admin Panel** - Login at `/admin`
- **GitHub OAuth** - Secure authentication
- **Markdown Editor** - Rich text editing with preview
- **Image Upload** - Media management built-in
- **Categories & Tags** - Content organization
- **Social Sharing** - Twitter, LinkedIn, Facebook integration
- **Post Navigation** - Previous/Next post links

### 🔧 Interactive Components
- **Typing Animation** - Rotating hero text
- **Stats Counter** - Animated number counters
- **Skill Progress Bars** - Percentage-based animations
- **Project Filters** - Category-based filtering
- **Scroll Progress Bar** - Reading progress indicator
- **Back to Top Button** - Smooth scroll to top
- **Social Sidebar** - Fixed social media links

## 🚀 Quick Start

### Prerequisites
- Git installed
- GitHub account
- Text editor (VS Code recommended)

### Installation

1. **Clone the repository**
   ```bash
   cd tharunaditya.github.io_v2/version_2
   ```

2. **Install Jekyll** (if not already installed)
   ```bash
   # For Windows (using RubyInstaller)
   # Download from https://rubyinstaller.org/
   
   # Install Jekyll and Bundler
   gem install jekyll bundler
   ```

3. **Install dependencies**
   ```bash
   bundle install
   ```

4. **Configure site settings**
   - Edit `_config.yml` with your information:
   ```yaml
   title: Your Name
   email: your.email@example.com
   github_username: yourusername
   linkedin_username: yourlinkedin
   ```

5. **Run locally**
   ```bash
   bundle exec jekyll serve
   ```
   Visit `http://localhost:4000/version_2`

## 📝 Blog Setup

### 1. Configure Decap CMS

Edit `admin/config.yml`:

```yaml
backend:
  name: github
  repo: yourusername/yourrepo  # Change this
  branch: main
```

### 2. Set up GitHub OAuth

For local development:
```yaml
backend:
  name: test-repo
```

For production, create a GitHub OAuth app:
1. Go to GitHub Settings → Developer Settings → OAuth Apps
2. Click "New OAuth App"
3. Set Homepage URL: `https://yourusername.github.io`
4. Set Authorization callback URL: `https://api.netlify.com/auth/done`
5. Copy Client ID and Secret

### 3. Deploy to GitHub Pages

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from main branch
   - Folder: `/version_2`
   - Save

3. **Access your site**
   - Portfolio: `https://yourusername.github.io/version_2`
   - Blog: `https://yourusername.github.io/version_2/blog`
   - Admin: `https://yourusername.github.io/version_2/admin`

## 📂 Project Structure

```
version_2/
├── _config.yml              # Jekyll configuration
├── index.html               # Main portfolio page
├── _layouts/                # Page templates
│   ├── default.html         # Base layout
│   ├── post.html            # Blog post layout
│   └── blog.html            # Blog listing layout
├── _posts/                  # Blog posts (markdown)
│   └── 2026-01-23-welcome-to-portfolio-v2.md
├── admin/                   # Decap CMS admin
│   ├── index.html           # Admin interface
│   └── config.yml           # CMS configuration
├── assets/
│   ├── css/
│   │   ├── style.css        # Main styles
│   │   └── blog.css         # Blog styles
│   ├── js/
│   │   └── main.js          # JavaScript modules
│   ├── images/              # Image assets
│   └── files/               # Downloadable files (resume, etc.)
├── blog/
│   └── index.html           # Blog homepage
└── README.md                # This file
```

## 🎨 Customization

### Change Color Scheme

Edit `assets/css/style.css`:

```css
:root {
    --accent-primary: #00ff41;      /* Change neon green */
    --accent-secondary: #00cc33;
    --bg-primary: #0a0a0a;          /* Background color */
    --text-primary: #ffffff;        /* Text color */
}
```

### Update Content

1. **Personal Information**: Edit `index.html`
2. **About Section**: Modify the about section in `index.html`
3. **Projects**: Add/edit project cards in the projects section
4. **Certifications**: Update certification cards
5. **Skills**: Modify skill categories and percentages

### Add New Blog Post

#### Method 1: Using Decap CMS (Recommended)
1. Visit `/admin`
2. Login with GitHub
3. Click "New Blog Post"
4. Write your post
5. Publish

#### Method 2: Manual
1. Create new file in `_posts/`: `YYYY-MM-DD-title.md`
2. Add frontmatter:
   ```yaml
   ---
   layout: post
   title: "Your Post Title"
   date: 2026-01-23 10:00:00 +0530
   categories: [Category1, Category2]
   tags: [tag1, tag2, tag3]
   excerpt: "Brief description"
   ---
   ```
3. Write content in Markdown
4. Commit and push

## 🔧 Configuration Options

### Jekyll Plugins

Add to `_config.yml`:
```yaml
plugins:
  - jekyll-feed        # RSS feed
  - jekyll-seo-tag     # SEO optimization
  - jekyll-sitemap     # XML sitemap
```

### Environment Variables

Create `.env` file:
```env
GITHUB_USERNAME=yourusername
FORMSPREE_ID=your_form_id
```

## 🚢 Deployment

### GitHub Pages (Recommended)
Already configured. Just push to `main` branch.

### Netlify
1. Connect GitHub repository
2. Build command: `jekyll build`
3. Publish directory: `_site`

### Vercel
1. Import GitHub repository
2. Framework: Other
3. Build command: `bundle exec jekyll build`
4. Output directory: `_site`

## 📊 Analytics Setup

### Google Analytics 4
1. Get tracking ID from Google Analytics
2. Add to `_config.yml`:
   ```yaml
   google_analytics: G-XXXXXXXXXX
   ```

### Microsoft Clarity
1. Get project ID
2. Add script to `_layouts/default.html`

## 🔒 Security

- All resources loaded via HTTPS
- Form spam protection via Formspree
- GitHub OAuth for CMS authentication
- Email obfuscation to prevent scraping
- Content Security Policy headers

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### Issue: Particles not showing
- Check browser console for errors
- Ensure particles.js is loaded from CDN
- Verify JavaScript is enabled

### Issue: CMS not loading
- Check `admin/config.yml` configuration
- Verify GitHub repo name is correct
- Ensure OAuth app is set up correctly

### Issue: Blog posts not appearing
- Check frontmatter formatting in markdown files
- Verify file naming: `YYYY-MM-DD-title.md`
- Ensure posts are in `_posts/` directory

### Issue: Build failures
- Check Jekyll version compatibility
- Verify all required gems are installed
- Review build logs for specific errors

## 📄 License

MIT License - Feel free to use this template for your own portfolio!

## 🤝 Contributing

Found a bug or have a feature request? 
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Contact

- **Email**: tharunaditya.anuganti@gmail.com
- **LinkedIn**: [tharunaditya-anuganti](https://linkedin.com/in/tharunaditya-anuganti)
- **GitHub**: [@Tharunaditya](https://github.com/Tharunaditya)
- **Twitter**: [@Tharunaditya1](https://twitter.com/Tharunaditya1)

## 🙏 Acknowledgments

- **Template Design**: Custom cyberpunk theme
- **Particles.js**: Interactive background animations
- **Decap CMS**: Content management system
- **Jekyll**: Static site generator
- **GitHub Pages**: Free hosting platform
- **Font Awesome**: Icon library
- **Google Fonts**: Orbitron, Rajdhani, Inter fonts

---

**Built with ❤️ by Tharunaditya Anuganti**

*Last updated: January 23, 2026*
