# Blog Layout Fix - Complete Reimplementation

## Problems Identified

### 1. **Architectural Issues**
- `.container` class had `margin: 0 auto` which centers it
- Adding padding to a centered container doesn't work with fixed sidebars
- Fixed positioned elements (left: 0, right: 0) don't interact with document flow
- Previous approach tried to add padding to `.container` which conflicts with centering

### 2. **CSS Conflicts**
- Base `.container` in style.css: `max-width: 1400px; margin: 0 auto; padding: 0 2rem;`
- Blog CSS was adding `padding-left: 340px` to `.container` 
- This created asymmetric padding on a centered element = broken layout

### 3. **HTML Structure Issues**
- `has-series` class was on `.post-layout-wrapper` but CSS looked for it on `.post-content`
- TOC container had no wrapper for styling
- Redundant wrappers causing confusion

## Solution Implemented

### New Architecture

```
.post-content (wrapper with has-series class)
├── .toc-sidebar (position: fixed; left: 0; width: 320px;)
├── .series-sidebar (position: fixed; right: 0; width: 320px;)
└── .post-main-area (padding-left: 320px; padding-right: 320px when has-series)
    └── .container (max-width: none !important; width: 100%)
        └── .post-main-content (max-width: 850px; margin: 0 auto;)
            └── content
```

### Key Changes

**1. HTML Structure (`_layouts/post.html`)**
- Moved `has-series` class to `.post-content` wrapper
- Added `.post-main-area` wrapper around container
- Removed redundant `.post-layout-wrapper`
- Added `.toc-inner` wrapper inside `.toc-sidebar`

**2. CSS Layout (`assets/css/blog.css`)**
- **Padding Strategy**: Applied to `.post-main-area` instead of `.container`
  - `.post-main-area { padding-left: 320px; }`
  - `.post-content.has-series .post-main-area { padding-right: 320px; }`

- **Container Override**: Removed max-width constraint
  - `.post-main-area .container { max-width: none !important; width: 100%; }`

- **Center Content**: Auto-centering within available space
  - `.post-main-content { max-width: 850px; margin: 0 auto; width: 100%; }`

- **Fixed Sidebars**: Truly fixed to screen edges
  - `.toc-sidebar { position: fixed; left: 0; width: 320px; }`
  - `.series-sidebar { position: fixed; right: 0; width: 320px; }`

- **Hidden Scrollbars**: 
  ```css
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  &::-webkit-scrollbar { display: none; } /* Chrome/Safari */
  ```

- **Empty TOC Hide**: 
  ```css
  .toc-sidebar .toc-inner:empty { display: none; }
  #toc-container:empty { display: none; }
  ```

**3. Responsive Breakpoints**
- **1400px**: Sidebars → 260px
- **1200px**: Sidebars → 220px
- **992px**: Stack layout (sidebars become relative, full-width)

### How It Works

1. **Fixed Sidebars**: Positioned absolutely to screen edges (left: 0, right: 0)
2. **Main Area Padding**: Creates space for sidebars without affecting container centering
3. **Container**: Fills available space between sidebars
4. **Content**: Auto-centers within container with max-width constraint
5. **Responsive**: Automatically stacks on mobile, adjusts sidebar width on tablet

### Visual Layout

```
Desktop (>1400px):
┌────────────────────────────────────────────────────────────┐
│ [TOC - 320px] │      [Content - auto, max 850px]      │ [Series - 320px] │
│   fixed left  │           centered                     │   fixed right   │
└────────────────────────────────────────────────────────────┘

Tablet (992-1400px):
┌────────────────────────────────────────────────────────────┐
│ [TOC-260px] │    [Content - auto, max 850px]    │ [Series-260px] │
└────────────────────────────────────────────────────────────┘

Mobile (<992px):
┌─────────────────┐
│   TOC (stacked)  │
├─────────────────┤
│ Series (stacked) │
├─────────────────┤
│     Content      │
└─────────────────┘
```

## Testing Checklist

- [ ] TOC fixed to left edge (320px width)
- [ ] Series fixed to right edge (320px width)  
- [ ] Content centered between sidebars (max 850px)
- [ ] Scrollbars hidden but scrolling works
- [ ] Empty TOC doesn't show empty box
- [ ] Share buttons below title with brand colors
- [ ] Responsive layout works on tablet
- [ ] Mobile stacks properly
- [ ] No horizontal scroll
- [ ] Print button works
- [ ] Comments section shows

## Files Modified

1. `_layouts/post.html` - HTML structure
2. `assets/css/blog.css` - Layout CSS

## To Test

Start Jekyll server and navigate to any blog post with series:
```bash
bundle exec jekyll serve --incremental
# or
jekyll serve --incremental
```

Visit: `http://localhost:4000/blog/2026/01/24/pentesting-fundamentals-part-1/`

## Rollback Instructions

If this breaks, the issue is likely:
1. Container still has conflicting styles from style.css
2. Media queries not working properly
3. JavaScript not populating TOC

Check browser console for errors and verify CSS specificity with DevTools.
