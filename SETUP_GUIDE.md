# 🚀 Quick Setup Guide

## For First-Time Users

### Step 1: Install Ruby & Jekyll (Windows)

1. **Download RubyInstaller**
   - Visit: https://rubyinstaller.org/downloads/
   - Download: Ruby+Devkit 3.2.X (x64)
   - Run installer with default options
   - Check "Run ridk install" at the end

2. **Install Jekyll**
   ```powershell
   gem install jekyll bundler
   ```

3. **Verify installation**
   ```powershell
   jekyll -v
   # Should show: jekyll 4.3.2 or similar
   ```

### Step 2: Set Up Your Portfolio

1. **Navigate to the project folder**
   ```powershell
   cd version_2
   ```

2. **Install dependencies**
   ```powershell
   bundle install
   ```

3. **Update configuration**
   - Open `_config.yml`
   - Change:
     ```yaml
     title: Your Name
     email: your.email@example.com
     github_username: yourusername
     linkedin_username: yourlinkedin
     ```

4. **Update Decap CMS config**
   - Open `admin/config.yml`
   - Change:
     ```yaml
     backend:
       repo: yourusername/yourrepo
     ```

### Step 3: Run Locally

```powershell
bundle exec jekyll serve
```

Visit: `http://localhost:4000/version_2`

### Step 4: Customize Content

1. **Edit personal info** → `index.html`
2. **Add your photo** → Save as `assets/images/profile.jpg`
3. **Update resume** → Save as `assets/files/Tharunaditya.pdf`
4. **Add projects** → Edit project cards in `index.html`

### Step 5: Deploy to GitHub Pages

1. **Create GitHub repository**
   - Name it: `username.github.io`

2. **Initialize Git**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Push to GitHub**
   ```powershell
   git remote add origin https://github.com/username/username.github.io.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages**
   - Go to repo Settings → Pages
   - Source: `main` branch
   - Folder: `/version_2`
   - Save

5. **Wait 2-3 minutes**, then visit:
   `https://username.github.io/version_2`

## 📝 Writing Your First Blog Post

### Using Decap CMS (Easy Way)

1. Visit: `https://username.github.io/version_2/admin`
2. Click "Login with GitHub"
3. Click "New Blog Post"
4. Fill in:
   - Title
   - Date
   - Categories
   - Tags
   - Content
5. Click "Publish"

### Manual Method

1. Create file: `_posts/2026-01-23-my-first-post.md`

2. Add this template:
   ```markdown
   ---
   layout: post
   title: "My First Blog Post"
   date: 2026-01-23 14:30:00 +0530
   categories: [Technology, Tutorial]
   tags: [jekyll, github-pages, blogging]
   excerpt: "This is my first blog post using Jekyll!"
   ---

   ## Hello World!

   This is the content of my blog post.

   ### Code Example
   ```python
   def hello():
       print("Hello from my blog!")
   ```

   - Point 1
   - Point 2
   - Point 3
   ```

3. Save and commit:
   ```powershell
   git add .
   git commit -m "Add first blog post"
   git push
   ```

## 🎨 Quick Customizations

### Change Theme Colors

Edit `assets/css/style.css`:
```css
:root {
    --accent-primary: #ff0055;  /* Change from green to pink */
    --accent-secondary: #cc0044;
}
```

### Add New Social Links

Edit `index.html`, find `.social-sidebar`:
```html
<a href="https://yoursite.com" class="social-link">
    <i class="fab fa-your-icon"></i>
</a>
```

### Update Contact Email

Edit `index.html`, search for `formspree.io` and update form action:
```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

Get form ID from: https://formspree.io/

## 🐛 Common Issues & Fixes

### "Jekyll command not found"
```powershell
# Add to PATH or use:
bundle exec jekyll serve
```

### "Bundle install fails"
```powershell
# Try:
gem update --system
bundle install
```

### "GitHub Pages not updating"
- Wait 3-5 minutes
- Check Actions tab for build status
- Clear browser cache

### "Particles not showing"
- Check internet connection (CDN dependency)
- Open browser console (F12) for errors

### "Admin panel not loading"
- Verify `admin/config.yml` repo name
- Ensure GitHub Pages is enabled
- Try incognito/private browsing

## 📚 Learn More

- **Jekyll Docs**: https://jekyllrb.com/docs/
- **Decap CMS Docs**: https://decapcms.org/docs/
- **Markdown Guide**: https://www.markdownguide.org/
- **GitHub Pages**: https://pages.github.com/

## 💡 Pro Tips

1. **Test locally before pushing**
   ```powershell
   bundle exec jekyll serve --drafts
   ```

2. **Use drafts folder**
   - Create `_drafts/my-draft.md`
   - No date needed in filename
   - Won't publish until moved to `_posts/`

3. **Enable comments**
   - Add Disqus/Giscus integration
   - Edit `_layouts/post.html`

4. **Add Google Analytics**
   - Get tracking ID
   - Add to `_config.yml`

5. **SEO optimization**
   - Use descriptive titles
   - Add meta descriptions
   - Include keywords in frontmatter

## ✅ Checklist

Before going live:

- [ ] Update `_config.yml` with your info
- [ ] Change `admin/config.yml` repo name
- [ ] Add your profile photo
- [ ] Upload your resume
- [ ] Update project descriptions
- [ ] Add your certifications
- [ ] Test all links
- [ ] Test contact form
- [ ] Check mobile responsiveness
- [ ] Verify blog posts load
- [ ] Test admin panel login
- [ ] Set up GitHub OAuth (production)
- [ ] Add Google Analytics (optional)
- [ ] Enable HTTPS on custom domain (if using)

## 🆘 Need Help?

- **Email**: tharunaditya.anuganti@gmail.com
- **GitHub Issues**: Create an issue in the repo
- **Documentation**: Check README.md

---

**Happy Coding! 🎉**
