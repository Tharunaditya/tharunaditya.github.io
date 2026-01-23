# 📁 Image Folder Structure Guide

## Directory Organization

### `assets/images/` - Main Images Folder

```
assets/images/
├── profile.jpg              # Your professional photo (500x500px)
├── og-image.jpg             # Social media preview (1200x630px)
├── favicon.ico              # Website icon
├── logo.png                 # Personal logo/brand mark
│
├── projects/                # Project screenshots
│   ├── project1-hero.jpg    # Main project image
│   ├── project1-demo.gif    # Feature demonstration
│   ├── project2-screenshot.png
│   └── ...
│
├── certs/                   # Certification images
│   ├── cisco-cert.jpg
│   ├── google-cert.png
│   ├── linkedin-cert.jpg
│   └── ...
│
└── uploads/                 # Blog post images (CMS managed)
    ├── 2026/
    │   └── 01/
    │       ├── blog-image1.jpg
    │       └── blog-image2.png
    └── ...
```

## Usage Guide

### 1. Profile Photo
- **Location:** `assets/images/profile.jpg`
- **Size:** 500x500px (square)
- **Format:** JPG or PNG
- **Max Size:** 100KB
- **Used in:** Hero section, About section

### 2. Project Screenshots
- **Location:** `assets/images/projects/`
- **Naming:** `project-name-description.jpg`
  - Example: `bugtracker-dashboard.jpg`
  - Example: `portfolio-mobile-view.png`
- **Size:** 1200x800px (landscape) or 800x1200px (portrait)
- **Format:** JPG, PNG, or WebP
- **Max Size:** 200KB each
- **Used in:** Projects section cards

### 3. Certification Images
- **Location:** `assets/images/certs/`
- **Naming:** `certification-name.jpg`
  - Example: `cisco-ccna.jpg`
  - Example: `google-cybersecurity.png`
- **Size:** Original certification size (maintain aspect ratio)
- **Format:** JPG or PNG
- **Max Size:** 150KB each
- **Used in:** Certifications section

### 4. Blog Post Images
- **Location:** `assets/images/uploads/`
- **Managed by:** Decap CMS (automatic)
- **Format:** JPG, PNG, GIF
- **Max Size:** 500KB
- **Used in:** Blog posts via CMS

### 5. Open Graph Image
- **Location:** `assets/images/og-image.jpg`
- **Size:** 1200x630px (exact)
- **Format:** JPG
- **Max Size:** 100KB
- **Used in:** Social media previews (Twitter, LinkedIn, Facebook)

### 6. Favicon
- **Location:** `assets/images/favicon.ico`
- **Size:** 32x32px or 64x64px
- **Format:** ICO (can be PNG)
- **Used in:** Browser tab icon

### 7. Logo
- **Location:** `assets/images/logo.png`
- **Size:** 200x60px (or proportional)
- **Format:** PNG (transparent background)
- **Max Size:** 50KB
- **Used in:** Navigation bar

## Image Optimization Tips

### Before Uploading:
1. **Compress images:**
   - Use TinyPNG.com or ImageOptim
   - Target: 70-80% quality

2. **Resize appropriately:**
   - Don't upload 4000px images for 300px display
   - Use recommended sizes above

3. **Choose right format:**
   - Photos: JPG
   - Graphics/logos: PNG
   - Animations: GIF or WebP
   - Modern browsers: WebP (smallest size)

### Naming Conventions:
- Use lowercase
- Use hyphens (not spaces or underscores)
- Be descriptive: `security-dashboard.jpg` not `img1.jpg`
- Include version if needed: `logo-v2.png`

## How to Add Images to Your Site

### In HTML (index.html):
```html
<!-- Profile photo -->
<img src="assets/images/profile.jpg" alt="Tharunaditya Anuganti">

<!-- Project image -->
<img src="assets/images/projects/bugtracker-hero.jpg" alt="Bug Tracker Dashboard">

<!-- Certification -->
<img src="assets/images/certs/cisco-ccna.jpg" alt="Cisco CCNA Certification">
```

### In CSS (style.css):
```css
/* Background image */
.hero {
    background-image: url('../images/hero-bg.jpg');
}
```

### In Markdown (Blog Posts):
```markdown
![Alt text](../assets/images/uploads/2026/01/blog-image.jpg)
```

### Via CMS:
1. Login to `/admin/`
2. Create/Edit blog post
3. Click "Insert Image"
4. Upload or select from media library
5. Auto-saved to `assets/images/uploads/`

## Current Folder Status
✅ Created: `assets/images/projects/`
✅ Created: `assets/images/certs/`
✅ Created: `assets/images/uploads/`

## Next Steps
1. Add your profile photo to `assets/images/profile.jpg`
2. Upload project screenshots to `assets/images/projects/`
3. Add certification images to `assets/images/certs/`
4. Create OG image and save to `assets/images/og-image.jpg`
5. Generate favicon and add to `assets/images/favicon.ico`

**All image folders are ready to use!** 🎉
